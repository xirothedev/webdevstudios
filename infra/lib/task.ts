import { Duration } from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { APP_ENV_KEYS, LIVENESS } from './config';

/** Liveness probe: the 200-404 matcher keeps targets up while the process answers HTTP. */
export function livenessCheck(): elbv2.HealthCheck {
  return {
    path: LIVENESS.path,
    interval: Duration.seconds(LIVENESS.interval),
    timeout: Duration.seconds(LIVENESS.timeout),
    healthyThresholdCount: LIVENESS.healthyThresholdCount,
    unhealthyThresholdCount: LIVENESS.unhealthyThresholdCount,
  };
}

// L2 HealthCheck has no matcher field; set it through the Cfn target.
export function allowAllHttpCodes(tg: elbv2.ApplicationTargetGroup): void {
  (tg.node.defaultChild as elbv2.CfnTargetGroup).addPropertyOverride('HealthCheck.Matcher', {
    HttpCode: LIVENESS.matcher,
  });
}

/** Secret-backed env for every key of the per-stage app secret. */
export function secretEnv(secret: secretsmanager.ISecret): Record<string, ecs.Secret> {
  const env: Record<string, ecs.Secret> = {};
  for (const key of APP_ENV_KEYS) env[key] = ecs.Secret.fromSecretsManager(secret, key);
  return env;
}

export function awsLogging(scope: Construct, stage: string, name: string): ecs.LogDriver {
  return ecs.LogDrivers.awsLogs({
    streamPrefix: name,
    logGroup: new logs.LogGroup(scope, `${name}LogGroup`, {
      retention: logs.RetentionDays.ONE_YEAR,
      removalPolicy: undefined, // default RETAIN: logs survive stack destroy
    }),
  });
}
