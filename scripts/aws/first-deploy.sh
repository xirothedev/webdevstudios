#!/bin/bash
# One-time real-AWS bootstrap after scripts/aws/one-time-aws-admin.sh provided
# the [profile bootstrap] keys. Idempotent; safe to re-run after failures.
# Agent drives this; it STOPS before cutting a release tag (human call).
set -euo pipefail
cd "$(dirname "$0")/../../infra"

ACCOUNT=772889137569
DOMAIN=webdevstudio.resonance.io.vn
export AWS_PROFILE=bootstrap
MAIN_REGION=ap-southeast-1
CF_REGION=us-east-1

echo "==> 0. identity"
WHOAMI=$(aws sts get-caller-identity --query Account --output text)
[[ "$WHOAMI" == "$ACCOUNT" ]] || { echo "wrong account: $WHOAMI (expected $ACCOUNT)"; exit 1; }

cdk_cmd() { bunx --bun cdk "$@"; }

echo "==> 1. bootstrap CDK toolchains (both regions)"
cdk_cmd bootstrap "aws://$ACCOUNT/$MAIN_REGION" --tags owner=webdev
cdk_cmd bootstrap "aws://$ACCOUNT/$CF_REGION" --tags owner=webdev

echo "==> 2. network + GitHub OIDC roles"
cdk_cmd deploy webdev-network --require-approval never
cdk_cmd deploy webdev-oidc --require-approval never

echo "==> 3. ACM certificate (CloudFront needs it in $CF_REGION)"
CERT_ARN=$(aws acm list-certificates --region "$CF_REGION" \
  --certificate-statuses ISSUED \
  --query "CertificateSummaryList[?DomainName=='$DOMAIN'].CertificateArn | [0]" --output text)
if [[ -z "$CERT_ARN" || "$CERT_ARN" == "None" ]]; then
  PENDING=$(aws acm list-certificates --region "$CF_REGION" \
    --certificate-statuses PENDING_VALIDATION \
    --query "CertificateSummaryList[?DomainName=='$DOMAIN'].CertificateArn | [0]" --output text)
  if [[ -z "$PENDING" || "$PENDING" == "None" ]]; then
    CERT_ARN=$(aws acm request-certificate --region "$CF_REGION" \
      --domain-name "$DOMAIN" --validation-method DNS --key-algorithm rsa-2048 \
      --query CertificateArn --output text)
  else
    CERT_ARN="$PENDING"
  fi
  ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='$DOMAIN.'].Id | [0]" --output text | sed 's|/hostedzone/||')
  [[ "$ZONE_ID" != "None" ]] || { echo "no Route53 zone for $DOMAIN — did webdev-network create it?"; exit 1; }
  RES_NAME=$(aws acm describe-certificate --region "$CF_REGION" --certificate-arn "$CERT_ARN" \
    --query 'DomainValidationOptions[0].ResourceRecord.Name' --output text)
  RES_TYPE=$(aws acm describe-certificate --region "$CF_REGION" --certificate-arn "$CERT_ARN" \
    --query 'DomainValidationOptions[0].ResourceRecord.Type' --output text)
  RES_VAL=$(aws acm describe-certificate --region "$CF_REGION" --certificate-arn "$CERT_ARN" \
    --query 'DomainValidationOptions[0].ResourceRecord.Value' --output text)
  aws route53 change-batch --hosted-zone-id "$ZONE_ID" --wait \
    --change-batch "{\"Changes\":[{\"Action\":\"UPSERT\",\"ResourceRecordSet\":{\"Name\":\"$RES_NAME\",\"Type\":\"$RES_TYPE\",\"TTL\":60,\"ResourceRecords\":[{\"Value\":\"$RES_VAL\"}]}}]}" >/dev/null
  echo "    waiting for DNS validation…"
  for i in $(seq 1 30); do
    ST=$(aws acm describe-certificate --region "$CF_REGION" --certificate-arn "$CERT_ARN" --query Certificate.Status --output text)
    [[ "$ST" == "ISSUED" ]] && break
    sleep 10
  done
  [[ "$ST" == "ISSUED" ]] || { echo "cert still $ST — re-run later"; exit 1; }
fi
echo "    cert: $CERT_ARN"

echo "==> 4. WAF (CloudFront scope) + SSM pointers the prod stack reads"
cdk_cmd deploy webdev-waf --require-approval never
WAF_ARN=$(aws wafv2 list-web-acls --region "$CF_REGION" --scope CLOUDFRONT \
  --query "WebACLs[?starts_with(Name, 'webdev')].ARN | [0]" --output text)
[[ "$WAF_ARN" != "None" ]] || { echo "webdev WAF ACL not found"; exit 1; }

echo "==> 5. SSM parameters (prod stack inputs)"
for pair in "/webdev/cloudfront/cert-arn=$CERT_ARN" "/webdev/cloudfront/waf-arn=$WAF_ARN"; do
  aws ssm put-parameter --region "$MAIN_REGION" --name "${pair%%=*}" --value "${pair#*=}" --type String --overwrite >/dev/null
  echo "    ${pair%%=*} = ${pair#*=}"
done

echo "==> 6. probe sanity (from CI side):"
echo "    OIDC provider: $(aws iam list-open-id-connect-providers --query 'OpenIDConnectProviderList[?contains(Arn,`github`)].Arn | [0]' --output text)"
echo
echo "Bootstrap complete. Next (human decision — real money):"
echo "  gh workflow run aws-probe.yml   # should go green now"
echo "  git tag v0.1.1 && git push origin v0.1.1 && gh release create v0.1.1 ..."
