#!/bin/bash
# ECR rehearsal: build the 5 CD images, ensure LocalStack ECR repos exist, push :rehearsal tags.
# Safe to re-run any time (docker prune or LocalStack reset wipes ECR emulation).
# Usage: ./scripts/localstack/ecr-rehearsal-push.sh  (needs localstack-aws container up)
set -euo pipefail
cd "$(dirname "$0")/../.."

REG=000000000000.dkr.ecr.us-east-1.localhost.localstack.cloud:4566
PAIRS="api:webdev-prod-api web:webdev-prod-web api-go:webdev-lab-api-go api-axum:webdev-lab-api-axum api-elysia:webdev-lab-api-elysia"

docker exec localstack-aws awslocal ecr get-login-password | docker login --username AWS --password-stdin "$REG" >/dev/null

for pair in $PAIRS; do
  app=${pair%%:*}
  repo=${pair##*:}
  docker exec localstack-aws awslocal ecr describe-repositories --repository-names "$repo" >/dev/null 2>&1 ||
    docker exec localstack-aws awslocal ecr create-repository --repository-name "$repo" >/dev/null
  img="wds-$app-rehearsal"
  docker image inspect "$img" >/dev/null 2>&1 || docker build -q -f "apps/$app/Dockerfile" -t "$img" . >/dev/null
  docker tag "$img" "$REG/$repo:rehearsal"
  docker push -q "$REG/$repo:rehearsal" >/dev/null
  echo "pushed $repo:rehearsal"
done

for pair in $PAIRS; do
  docker exec localstack-aws awslocal ecr describe-images --repository-name "${pair##*:}" \
    --query 'imageDetails[0].imageTags[0]' --output text | xargs echo "verified ${pair##*:}:"
done
