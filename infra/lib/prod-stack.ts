import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { CfnBudget } from 'aws-cdk-lib/aws-budgets';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as codedeploy from 'aws-cdk-lib/aws-codedeploy';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { SUBDOMAINS, placeholderConfig } from './config';
import { NetworkStack } from './network-stack';
import { allowAllHttpCodes, awsLogging, livenessCheck, secretEnv } from './task';

export interface ProdStackProps extends StackProps {
  network: NetworkStack;
  /** Image tag to deploy; CI passes the git sha. */
  tag?: string;
  /** Email for the account budget alarm (confirmed manually in SNS). */
  alertEmail?: string;
}

interface BlueGreen {
  service: ecs.FargateService;
  blue: elbv2.ApplicationTargetGroup;
  green: elbv2.ApplicationTargetGroup;
  listener: elbv2.IListenerRef;
}

/**
 * api + web behind CloudFront + WAF, blue/green deploys via CodeDeploy,
 * Multi-AZ RDS with PITR, Redis with failover, account budget alarm.
 */
export class ProdStack extends Stack {
  constructor(scope: Construct, id: string, props: ProdStackProps) {
    super(scope, id, props);
    const tag = props.tag ?? 'latest';
    const { vpc, zone, cert } = props.network;

    const cluster = new ecs.Cluster(this, 'Cluster', { vpc, containerInsights: true });

    // --- data plane -------------------------------------------------------
    // ponytail: DB/Redis accept anything from the VPC CIDR; scope per-service SGs
    // when more tenants share the network.
    const dbSg = new ec2.SecurityGroup(this, 'DbSg', { vpc, description: 'postgres' });
    dbSg.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(5432), 'vpc -> db');
    const db = new rds.DatabaseInstance(this, 'Db', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16_6,
      }),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE4_GRAVITON,
        ec2.InstanceSize.MEDIUM,
      ),
      multiAz: true,
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      storageEncrypted: true,
      databaseName: 'webdevstudios',
      credentials: { username: 'webdev' },
      backupRetention: Duration.days(7),
      deletionProtection: true,
      securityGroups: [dbSg],
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const redisSg = new ec2.SecurityGroup(this, 'RedisSg', { vpc, description: 'redis' });
    redisSg.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(6379), 'vpc -> redis');
    const redisSubnetName = `${id}-redis`;
    const redisSubnets = new elasticache.CfnSubnetGroup(this, 'RedisSubnets', {
      cacheSubnetGroupName: redisSubnetName,
      description: 'redis subnets',
      subnetIds: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }).subnetIds,
    });
    const redis = new elasticache.CfnReplicationGroup(this, 'Redis', {
      replicationGroupDescription: 'webdev prod redis',
      engine: 'redis',
      engineVersion: '7.1',
      cacheNodeType: 'cache.t4g.micro',
      numCacheClusters: 2,
      automaticFailoverEnabled: true,
      multiAzEnabled: true,
      cacheSubnetGroupName: redisSubnetName,
      securityGroupIds: [redisSg.securityGroupId],
    });
    redis.addDependency(redisSubnets);

    const appSecret = new secretsmanager.Secret(this, 'AppSecret', {
      secretName: 'webdev/prod/app',
      generateSecretString: {
        // All keys present with REPLACE_ME values; the human edits the JSON in place.
        secretStringTemplate: JSON.stringify(placeholderConfig()),
        generateStringKey: '_fill_me',
      },
      description: 'Fill real values in Secrets Manager after first deploy',
    });

    // DATABASE_URL via dynamic secretsmanager reference: the password never
    // appears in the CloudFormation template.
    const dbUrl = `postgresql://webdev:${db.secret!.secretValueFromJson('password')}@${db.dbInstanceEndpointAddress}:5432/webdevstudios?schema=public`;

    // --- services ---------------------------------------------------------
    const api = this.blueGreen('api', vpc, {
      cluster,
      tag,
      port: 4000,
      env: {
        PORT: '4000',
        DATABASE_URL: dbUrl,
        REDIS_HOST: redis.attrPrimaryEndPointAddress,
        REDIS_PORT: '6379',
      },
    });
    const web = this.blueGreen('web', vpc, {
      cluster,
      tag,
      port: 3000,
      env: { PORT: '3000' },
    });

    const codeDeployRole = new iam.Role(this, 'CodeDeployRole', {
      assumedBy: new iam.ServicePrincipal('codedeploy.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodeDeployRole')],
    });

    const webAlb = this.edge('web', vpc, cert, web);
    const apiAlb = this.edge('api', vpc, cert, api);

    // CloudFront wants its certificate and WAF in us-east-1 (see WafStack).
    const cfCert = acm.Certificate.fromCertificateArn(
      this,
      'CfCert',
      ssm.StringParameter.fromStringParameterName(this, 'CfCertRef', '/webdev/cloudfront/cert-arn')
        .stringValue,
    );
    const wafArn = ssm.StringParameter.fromStringParameterName(
      this,
      'WafRef',
      '/webdev/cloudfront/waf-arn',
    ).stringValue;

    const noCache = new cloudfront.CachePolicy(this, 'NoCache', {
      defaultTtl: Duration.seconds(0),
      minTtl: Duration.seconds(0),
      maxTtl: Duration.seconds(1),
      cookieBehavior: cloudfront.CacheCookieBehavior.all(),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    for (const [name, alb, host] of [
      ['web', webAlb, SUBDOMAINS.web],
      ['api', apiAlb, SUBDOMAINS.api],
    ] as const) {
      // ponytail: the ALB is internet-facing for CloudFront; tighten it to the
      // CloudFront managed prefix list when per-region prefix IDs are pinned.
      const dist = new cloudfront.Distribution(this, `${name}Dist`, {
        domainNames: [host],
        certificate: cfCert,
        webAclId: wafArn,
        defaultBehavior: {
          origin: new origins.HttpOrigin(alb.loadBalancerDnsName, {
            connectionAttempts: 3,
            connectionTimeout: Duration.seconds(5),
          }),
          cachePolicy: noCache,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          compress: true,
        },
      });
      new route53.ARecord(this, `${name}Alias`, {
        zone,
        recordName: host === SUBDOMAINS.web ? undefined : host,
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(dist)),
      });
    }

    for (const [name, bg] of [
      ['api', api],
      ['web', web],
    ] as const) {
      new codedeploy.EcsDeploymentGroup(this, `${name}Deploy`, {
        application: new codedeploy.EcsApplication(this, `${name}App`),
        service: bg.service,
        role: codeDeployRole,
        deploymentConfig: codedeploy.EcsDeploymentConfig.CANARY_10PERCENT_5MINUTES,
        blueGreenDeploymentConfig: {
          blueTargetGroup: bg.blue,
          greenTargetGroup: bg.green,
          listener: bg.listener,
          terminationWaitTime: Duration.minutes(5),
        },
      });
    }

    if (props.alertEmail) {
      new CfnBudget(this, 'Budget', {
        budget: {
          budgetName: 'webdev-monthly',
          budgetType: 'COST',
          timeUnit: 'MONTHLY',
          budgetLimit: { unit: 'USD', amount: 100 },
        },
        notificationsWithSubscribers: [
          {
            notification: {
              comparisonOperator: 'GREATER_THAN',
              notificationType: 'ACTUAL',
              threshold: 100,
              thresholdType: 'PERCENTAGE',
            },
            subscribers: [{ address: props.alertEmail, subscriptionType: 'EMAIL' }],
          },
        ],
      });
    }

    new CfnOutput(this, 'WebUrl', { value: `https://${SUBDOMAINS.web}` });
    new CfnOutput(this, 'ApiUrl', { value: `https://${SUBDOMAINS.api}` });
  }

  /** Fargate service + blue/green target group pair, both attached to the service. */
  private blueGreen(
    name: string,
    vpc: ec2.IVpc,
    opts: { cluster: ecs.Cluster; tag: string; port: number; env: Record<string, string> },
  ): BlueGreen {
    const taskDef = new ecs.FargateTaskDefinition(this, `${name}Task`, {
      cpu: 1024,
      memoryLimitMiB: 2048,
    });
    const repo = new ecr.Repository(this, `${name}Repo`, {
      repositoryName: `webdev-prod-${name}`,
      removalPolicy: RemovalPolicy.DESTROY,
        emptyOnDelete: true,
      lifecycleRules: [{ rulePriority: 1, description: 'keep 50 images', maxImageCount: 50 }],
    });
    taskDef.addContainer(name, {
      image: ecs.ContainerImage.fromEcrRepository(repo, opts.tag),
      logging: awsLogging(this, 'prod', name),
      environment: opts.env,
      secrets: secretEnv(
        secretsmanager.Secret.fromSecretNameV2(this, `${name}AppSecret`, 'webdev/prod/app'),
      ),
    });

    const service = new ecs.FargateService(this, `${name}Service`, {
      cluster: opts.cluster,
      taskDefinition: taskDef,
      desiredCount: 2,
      assignPublicIp: false,
      deploymentController: { type: ecs.DeploymentControllerType.CODE_DEPLOY },
    });
    service
      .autoScaleTaskCount({ minCapacity: 2, maxCapacity: 6 })
      .scaleOnCpuUtilization(`${name}Cpu`, {
        targetUtilizationPercent: 60,
      });

    const blue = new elbv2.ApplicationTargetGroup(this, `${name}BlueTg`, {
      vpc,
      port: opts.port,
      targetType: elbv2.TargetType.IP,
      protocol: elbv2.ApplicationProtocol.HTTP,
      healthCheck: livenessCheck(),
      targetGroupName: `${name}blue`,
    });
    const green = new elbv2.ApplicationTargetGroup(this, `${name}GreenTg`, {
      vpc,
      port: opts.port,
      targetType: elbv2.TargetType.IP,
      protocol: elbv2.ApplicationProtocol.HTTP,
      healthCheck: livenessCheck(),
      targetGroupName: `${name}green`,
    });
    allowAllHttpCodes(blue);
    allowAllHttpCodes(green);

    // CodeDeploy shifts weights between the pair on the ALB listener rule.
    const cfnService = service.node.defaultChild as ecs.CfnService;
    cfnService.loadBalancers = [
      { containerName: name, containerPort: opts.port, targetGroupArn: blue.targetGroupArn },
      { containerName: name, containerPort: opts.port, targetGroupArn: green.targetGroupArn },
    ];

    return { service, blue, green } as BlueGreen;
  }

  /** One public ALB per app, HTTPS with the wildcard cert, weighted blue/green default. */
  private edge(
    name: string,
    vpc: ec2.IVpc,
    cert: acm.ICertificate,
    bg: Omit<BlueGreen, 'listener'>,
  ): elbv2.ApplicationLoadBalancer {
    const alb = new elbv2.ApplicationLoadBalancer(this, `${name}Alb`, {
      vpc,
      internetFacing: true,
    });
    alb.addListener(`${name}Http`, {
      port: 80,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: 'HTTPS',
        port: '443',
        permanent: true,
      }),
    });
    const listener = alb.addListener(`${name}Https`, {
      port: 443,
      certificates: [cert],
      defaultAction: elbv2.ListenerAction.forward([bg.blue]),
    });
    // Weighted blue/green forward: blue 100 / green 0 at boot; CodeDeploy moves weights.
    (listener.node.defaultChild as elbv2.CfnListener).addPropertyOverride('DefaultActions', [
      {
        Type: 'forward',
        ForwardConfig: {
          TargetGroups: [
            { TargetGroupArn: bg.blue.targetGroupArn, Weight: 100 },
            { TargetGroupArn: bg.green.targetGroupArn, Weight: 0 },
          ],
        },
      },
    ]);
    (bg as BlueGreen).listener = listener;
    return alb;
  }
}
