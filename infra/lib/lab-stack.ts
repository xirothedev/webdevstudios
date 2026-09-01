import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Schedule } from 'aws-cdk-lib/aws-applicationautoscaling';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { join } from 'path';
import { SUBDOMAINS, placeholderConfig } from './config';
import { NetworkStack } from './network-stack';
import { allowAllHttpCodes, awsLogging, livenessCheck, secretEnv } from './task';

export interface LabStackProps extends StackProps {
  network: NetworkStack;
  tag?: string;
}

/**
 * Mirrors (api-go, api-axum, api-elysia) + web-vue static site. Single-AZ,
 * cheap instances, and the three backends sleep 23:00-07:00 (ICT) to save
 * ~70% of Fargate cost. No WAF, no blue/green — a lab, not a storefront.
 */
export class LabStack extends Stack {
  constructor(scope: Construct, id: string, props: LabStackProps) {
    super(scope, id, props);
    const tag = props.tag ?? 'latest';
    const { vpc, zone, cert } = props.network;

    const cluster = new ecs.Cluster(this, 'Cluster', { vpc, containerInsights: true });

    const dbSg = new ec2.SecurityGroup(this, 'DbSg', { vpc, description: 'lab postgres' });
    dbSg.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(5432), 'vpc -> db');
    const db = new rds.DatabaseInstance(this, 'Db', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16_6,
      }),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE4_GRAVITON,
        ec2.InstanceSize.MICRO,
      ),
      multiAz: false,
      allocatedStorage: 20,
      storageEncrypted: true,
      databaseName: 'webdevstudios',
      credentials: { username: 'webdev' },
      backupRetention: Duration.days(1),
      deletionProtection: false,
      securityGroups: [dbSg],
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const redisSg = new ec2.SecurityGroup(this, 'RedisSg', { vpc, description: 'lab redis' });
    redisSg.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(6379), 'vpc -> redis');
    const redisSubnetName = `${id}-redis`;
    new elasticache.CfnSubnetGroup(this, 'RedisSubnets', {
      cacheSubnetGroupName: redisSubnetName,
      description: 'lab redis subnets',
      subnetIds: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }).subnetIds,
    });
    const redis = new elasticache.CfnCacheCluster(this, 'Redis', {
      cacheNodeType: 'cache.t4g.micro',
      engine: 'redis',
      engineVersion: '7.1',
      numCacheNodes: 1,
      cacheSubnetGroupName: redisSubnetName,
      vpcSecurityGroupIds: [redisSg.securityGroupId],
    });

    const appSecret = new secretsmanager.Secret(this, 'AppSecret', {
      secretName: 'webdev/lab/app',
      generateSecretString: {
        secretStringTemplate: JSON.stringify(placeholderConfig()),
        generateStringKey: '_fill_me',
      },
      description: 'Lab app config — fill real values (PayOS sandbox!) in Secrets Manager',
    });
    const dbUrl = `postgresql://webdev:${db.secret!.secretValueFromJson('password')}@${db.dbInstanceEndpointAddress}:5432/webdevstudios?schema=public`;

    const alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', { vpc, internetFacing: true });
    alb.addListener('Http', {
      port: 80,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: 'HTTPS',
        port: '443',
        permanent: true,
      }),
    });
    const https = alb.addListener('Https', {
      port: 443,
      certificates: [cert],
      defaultAction: elbv2.ListenerAction.fixedResponse(404, { contentType: 'text/plain' }),
    });

    for (const [i, name, host, port] of [
      [1, 'api-go', SUBDOMAINS.apiGo, 4000],
      [2, 'api-axum', SUBDOMAINS.apiAxum, 4000],
      [3, 'api-elysia', SUBDOMAINS.apiElysia, 4000],
    ] as const) {
      const repo = new ecr.Repository(this, `${name}Repo`, {
        repositoryName: `webdev-lab-${name}`,
        removalPolicy: RemovalPolicy.DESTROY,
        emptyOnDelete: true,
        lifecycleRules: [{ rulePriority: 1, description: 'keep 50 images', maxImageCount: 50 }],
      });
      const taskDef = new ecs.FargateTaskDefinition(this, `${name}Task`, {
        cpu: 256,
        memoryLimitMiB: 512,
      });
      taskDef.addContainer(name, {
        image: ecs.ContainerImage.fromEcrRepository(repo, tag),
        portMappings: [{ containerPort: port }],
        logging: awsLogging(this, 'lab', name),
        environment: {
          PORT: String(port),
          DATABASE_URL: dbUrl,
          REDIS_HOST: redis.attrRedisEndpointAddress,
          REDIS_PORT: '6379',
        },
        secrets: secretEnv(
          secretsmanager.Secret.fromSecretNameV2(this, `${name}AppSecret`, 'webdev/lab/app'),
        ),
        // No container healthCheck: distroless images carry no wget. The ALB
        // liveness rule is the gate.
      });
      const service = new ecs.FargateService(this, `${name}Service`, {
        cluster,
        taskDefinition: taskDef,
        desiredCount: 1,
        assignPublicIp: false,
      });
      // Sleep 23:00, wake 08:00 ICT (= 16:00 / 01:00 UTC).
      const scaling = service.autoScaleTaskCount({ minCapacity: 0, maxCapacity: 1 });
      scaling.scaleOnSchedule(`${name}Wake`, {
        schedule: Schedule.cron({ minute: '0', hour: '1' }),
        minCapacity: 1,
        maxCapacity: 1,
      });
      scaling.scaleOnSchedule(`${name}Sleep`, {
        schedule: Schedule.cron({ minute: '0', hour: '16' }),
        minCapacity: 0,
        maxCapacity: 0,
      });

      const tg = new elbv2.ApplicationTargetGroup(this, `${name}Tg`, {
        vpc,
        port,
        targetType: elbv2.TargetType.IP,
        protocol: elbv2.ApplicationProtocol.HTTP,
        healthCheck: livenessCheck(),
        targetGroupName: name.replace(/[^a-zA-Z0-9_-]/g, ''),
      });
      allowAllHttpCodes(tg);
      service.attachToApplicationTargetGroup(tg);
      new elbv2.ApplicationListenerRule(this, `${name}Rule`, {
        listener: https,
        conditions: [elbv2.ListenerCondition.hostHeaders([host])],
        priority: i,
        action: elbv2.ListenerAction.forward([tg]),
      });
      new route53.CfnRecordSet(this, `${name}Alias`, {
        hostedZoneId: zone.hostedZoneId,
        name: host,
        type: 'A',
        aliasTarget: {
          hostedZoneId: alb.loadBalancerCanonicalHostedZoneId,
          dnsName: alb.loadBalancerDnsName,
          evaluateTargetHealth: true,
        },
      });
    }

    // web-vue: static SPA on S3 behind CloudFront, served by CI-uploaded assets.
    const bucket = new s3.Bucket(this, 'VueBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    const spa = new cloudfront.Function(this, 'SpaRewrite', {
      code: cloudfront.FunctionCode.fromInline(
        'function handler(event) { var u = event.request.uri; if (u.indexOf(".") === -1 && u !== "/") { event.request.uri = "/index.html"; } return event.request; }',
      ),
    });
    const cfCert = acm.Certificate.fromCertificateArn(
      this,
      'CfCert',
      ssm.StringParameter.fromStringParameterName(this, 'CfCertRef', '/webdev/cloudfront/cert-arn')
        .stringValue,
    );
    const vue = new cloudfront.Distribution(this, 'VueDist', {
      domainNames: [SUBDOMAINS.vue],
      certificate: cfCert,
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        functionAssociations: [
          { function: spa, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST },
        ],
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });
    new route53.ARecord(this, 'VueAlias', {
      zone,
      recordName: SUBDOMAINS.vue,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(vue)),
    });
    new s3deploy.BucketDeployment(this, 'VueDeploy', {
      sources: [s3deploy.Source.asset(join(__dirname, '..', '..', 'apps', 'web-vue', 'dist'))],
      destinationBucket: bucket,
      distribution: vue,
      distributionPaths: ['/*'],
      memoryLimit: 512,
    });
  }
}
