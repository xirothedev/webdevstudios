import { Stack, StackProps } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

const GITHUB_REPO = 'xirothedev/webdevstudios';

// Services the deploy roles manage.
const DEPLOY_SERVICES = [
  'ec2',
  'ecs',
  'elasticloadbalancing',
  'elasticache',
  'rds',
  'ecr',
  'codedeploy',
  'cloudfront',
  'acm',
  'route53',
  'secretsmanager',
  'wafv2',
  'logs',
  'events',
  'iam',
  'sns',
  's3',
  'budgets',
  'application-autoscaling',
  'cloudformation',
];

/**
 * One role per GitHub environment. The `production` environment carries the
 * manual approval gate; CI assumes these roles via OIDC — no static AWS keys.
 *
 * ponytail: the deploy policy is write-all on the listed services (what CDK
 * itself needs). Scope it per-stack when the blast radius starts to matter.
 */
export class OidcStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const provider = new iam.OpenIdConnectProvider(this, 'GitHub', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });

    for (const environment of ['lab', 'production']) {
      const role = new iam.Role(this, `Deploy${environment}`, {
        roleName: `webdev-deploy-${environment}`,
        description: `${GITHUB_REPO} deploy role for GitHub environment '${environment}'`,
        assumedBy: new iam.WebIdentityPrincipal(provider.openIdConnectProviderArn, {
          StringEquals: { 'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com' },
          StringLike: {
            'token.actions.githubusercontent.com:sub': `${GITHUB_REPO}:environment:${environment}`,
          },
        }),
      });
      role.addToPolicy(
        new iam.PolicyStatement({
          actions: DEPLOY_SERVICES.map((s) => `${s}:*`),
          resources: ['*'],
        }),
      );
      // CDK hands generated task / CodeDeploy / scaling roles to their services.
      role.addToPolicy(
        new iam.PolicyStatement({
          actions: [
            'iam:PassRole',
            'iam:CreateRole',
            'iam:AttachRolePolicy',
            'iam:PutRolePolicy',
            'iam:DeleteRole',
            'iam:TagRole',
          ],
          resources: ['*'],
          conditions: {
            StringEquals: {
              'iam:PassedToService': [
                'ecs-tasks.amazonaws.com',
                'ecs.amazonaws.com',
                'codedeploy.amazonaws.com',
                'autoscaling.amazonaws.com',
                'application-autoscaling.amazonaws.com',
                'events.amazonaws.com',
              ],
            },
          },
        }),
      );
    }
  }
}
