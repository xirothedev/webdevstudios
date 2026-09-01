import { App } from 'aws-cdk-lib';
import { Node } from 'constructs';
import { LabStack } from '../lib/lab-stack';
import { NetworkStack } from '../lib/network-stack';
import { OidcStack } from '../lib/oidc-stack';
import { ProdStack } from '../lib/prod-stack';
import { WafStack } from '../lib/waf-stack';

const app = new App();
const account = process.env.CDK_DEFAULT_ACCOUNT ?? process.env.AWS_ACCOUNT_ID;
const region = process.env.CDK_DEFAULT_REGION ?? 'ap-southeast-1';
const env = { account, region };
const ctx = (key: string) => Node.of(app).tryGetContext(key);
const tag = (ctx('tag') as string | undefined) ?? 'latest';

const network = new NetworkStack(app, 'webdev-network', {
  natGateways: Number(ctx('natGateways') ?? 2),
  env,
});

new OidcStack(app, 'webdev-oidc', { env });

// CloudFront insists on us-east-1; the prod stack reads its cert/WAF arns from SSM.
const waf = new WafStack(app, 'webdev-waf', { env: { account, region: 'us-east-1' } });

const prod = new ProdStack(app, 'webdev-prod', {
  network,
  tag,
  alertEmail: process.env.ALERT_EMAIL,
  env,
});
prod.addDependency(waf);

new LabStack(app, 'webdev-lab', { network, tag, env });
