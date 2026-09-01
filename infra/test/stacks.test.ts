import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { describe, expect, test } from 'bun:test';
import { LabStack } from '../lib/lab-stack';
import { NetworkStack } from '../lib/network-stack';
import { ProdStack } from '../lib/prod-stack';
import { WafStack } from '../lib/waf-stack';

const env = { account: '111111111111', region: 'ap-southeast-1' };

function build() {
  const app = new App();
  const network = new NetworkStack(app, 'webdev-network', { env });
  const waf = new WafStack(app, 'webdev-waf', {
    env: { account: env.account, region: 'us-east-1' },
  });
  const prod = new ProdStack(app, 'webdev-prod', {
    network,
    tag: 'abc123',
    alertEmail: 'a@b.c',
    env,
  });
  const lab = new LabStack(app, 'webdev-lab', { network, tag: 'abc123', env });
  return {
    network: Template.fromStack(network),
    waf: Template.fromStack(waf),
    prod: Template.fromStack(prod),
    lab: Template.fromStack(lab),
  };
}

describe('prod stack', () => {
  const t = build();

  test('postgres is Multi-AZ with PITR and deletion protection', () => {
    t.prod.resourceCountIs('AWS::RDS::DBInstance', 1);
    t.prod.hasResourceProperties('AWS::RDS::DBInstance', {
      MultiAZ: true,
      DeletionProtection: true,
      BackupRetentionPeriod: 7,
      Engine: 'postgres',
    });
  });

  test('redis fails over across two AZs', () => {
    t.prod.hasResourceProperties('AWS::ElastiCache::ReplicationGroup', {
      NumCacheClusters: 2,
      MultiAZEnabled: true,
      AutomaticFailoverEnabled: true,
    });
  });

  test('listener boots blue 100 / green 0', () => {
    const listeners = t.prod.findResources('AWS::ElasticLoadBalancingV2::Listener');
    const forwarded = Object.values(listeners).filter(
      (l: any) => l.Properties?.DefaultActions?.[0]?.ForwardConfig?.TargetGroups?.length === 2,
    );
    expect(forwarded.length).toBe(2); // web + api ALBs
    for (const l of forwarded as any[]) {
      const [blue, green] = l.Properties.DefaultActions[0].ForwardConfig.TargetGroups;
      expect(blue.Weight).toBe(100);
      expect(green.Weight).toBe(0);
    }
  });

  test('one CodeDeploy blue/green group per prod service', () => {
    t.prod.resourceCountIs('AWS::CodeDeploy::DeploymentGroup', 2);
  });

  test('budget alarm exists when email given', () => {
    t.prod.resourceCountIs('AWS::Budgets::Budget', 1);
  });
});

describe('lab stack', () => {
  const t = build();

  test('mirrors sleep nightly (capacity 0 scheduled action on the scalable target)', () => {
    const targets = t.lab.findResources('AWS::ApplicationAutoScaling::ScalableTarget');
    const sleeps = Object.values(targets).filter((p: any) =>
      (p.Properties.ScheduledActions ?? []).some(
        (a: any) => a.ScalableTargetAction.MinCapacity === 0 && a.Schedule === 'cron(0 16 * * ? *)',
      ),
    );
    expect(sleeps.length).toBe(3); // api-go, api-axum, api-elysia
  });

  test('single-node cache, no budget alarm, no codedeploy', () => {
    t.lab.hasResourceProperties('AWS::ElastiCache::CacheCluster', { NumCacheNodes: 1 });
    t.lab.resourceCountIs('AWS::Budgets::Budget', 0);
    t.lab.resourceCountIs('AWS::CodeDeploy::DeploymentGroup', 0);
  });

  test('one ALB host rule per mirror', () => {
    t.lab.resourceCountIs('AWS::ElasticLoadBalancingV2::ListenerRule', 3);
  });
});

describe('waf stack', () => {
  test('cloudfront-scoped ACL published to SSM', () => {
    const t = build().waf;
    t.hasResourceProperties('AWS::WAFv2::WebACL', { Scope: 'CLOUDFRONT' });
    t.resourceCountIs('AWS::SSM::Parameter', 2);
  });
});
