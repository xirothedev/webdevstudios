# AWS infrastructure is defined with AWS CDK in TypeScript

Infrastructure for AWS lives in `infra/` in this monorepo, written with AWS CDK v2 in TypeScript, alongside the app code it deploys. Terraform and SST were the alternatives: Terraform adds a second language and toolchain for no capability gain in a single-cloud shop; SST hides the AWS primitives we are trying to learn. CDK shares the repo's TypeScript, Bun, and Prettier toolchain, and every construct it emits is a plain CloudFormation resource a reader can inspect in the console.
