import { Stack, StackProps } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';
import { DOMAIN } from './config';

export interface WafStackProps extends StackProps {
  hostedZoneId: string;
}

/**
 * CloudFront forces WAF and its certificate into us-east-1. This tiny stack
 * publishes both through SSM parameters the prod stack reads at deploy time.
 * Deploy WafStack before ProdStack.
 */
export class WafStack extends Stack {
  constructor(scope: Construct, id: string, props: WafStackProps) {
    super(scope, id, props);

    // Route53 is global: the TXT validation record this us-east-1 stack emits
    // still lands in the delegated zone. zoneId comes from the network stack.
    const zone = route53.PublicHostedZone.fromHostedZoneAttributes(this, 'ZoneRef', {
      hostedZoneId: props.hostedZoneId,
      zoneName: DOMAIN,
    });
    const cert = new acm.Certificate(this, 'CloudFrontCert', {
      domainName: DOMAIN,
      subjectAlternativeNames: [`*.${DOMAIN}`],
      validation: acm.CertificateValidation.fromDns(zone),
    });
    new ssm.StringParameter(this, 'CertArn', {
      parameterName: '/webdev/cloudfront/cert-arn',
      stringValue: cert.certificateArn,
    });

    const waf = new wafv2.CfnWebACL(this, 'EdgeWaf', {
      scope: 'CLOUDFRONT',
      defaultAction: { allow: {} },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'webdev-edge',
        sampledRequestsEnabled: true,
      },
      rules: [
        {
          name: 'AWSCommon',
          priority: 0,
          statement: {
            managedRuleGroupStatement: { vendorName: 'AWS', name: 'AWSManagedRulesCommonRuleSet' },
          },
          overrideAction: { none: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'common',
            sampledRequestsEnabled: true,
          },
        },
        {
          name: 'AWSIpReputation',
          priority: 1,
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesAmazonIpReputationList',
            },
          },
          overrideAction: { none: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'iprep',
            sampledRequestsEnabled: true,
          },
        },
        {
          name: 'RateLimit',
          priority: 2,
          statement: {
            rateBasedStatement: { aggregateKeyType: 'IP', limit: 2000 },
          },
          action: { block: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'rate',
            sampledRequestsEnabled: true,
          },
        },
      ],
    });
    new ssm.StringParameter(this, 'WafArn', {
      parameterName: '/webdev/cloudfront/waf-arn',
      stringValue: waf.attrArn,
    });
  }
}
