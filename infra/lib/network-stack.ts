import { Stack, StackProps } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { DOMAIN } from './config';

export interface NetworkProps extends StackProps {
  /** NAT gateways for the VPC; 2 for prod-grade redundancy (default), 1 to halve cost. */
  natGateways?: number;
}

/** Shared plumbing for both stages: VPC, DNS zone, wildcard certificate. */
export class NetworkStack extends Stack {
  readonly vpc: ec2.Vpc;
  readonly zone: route53.PublicHostedZone;
  readonly cert: acm.Certificate;

  constructor(scope: Construct, id: string, props: NetworkProps = {}) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 3,
      natGateways: props.natGateways ?? 2,
      subnetConfiguration: [
        { name: 'public', subnetType: ec2.SubnetType.PUBLIC },
        { name: 'private', subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      ],
    });
    this.vpc.addFlowLog('FlowLogs', {
      destination: ec2.FlowLogDestination.toCloudWatchLogs(),
    });

    // NS-delegate webdevstudio.resonance.io.vn from the parent Cloudflare zone to this zone.
    this.zone = new route53.PublicHostedZone(this, 'Zone', { zoneName: DOMAIN });
    this.cert = new acm.Certificate(this, 'Cert', {
      domainName: DOMAIN,
      subjectAlternativeNames: [`*.${DOMAIN}`],
      validation: acm.CertificateValidation.fromDns(this.zone),
    });
    // Copy the NS records shown by `aws route53 list-hosted-zones` into the
    // parent Cloudflare zone to delegate webdevstudio.resonance.io.vn.
  }
}
