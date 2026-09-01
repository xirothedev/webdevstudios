# Services run on ECS Fargate with GHCR images and blue/green deploys

Every Service is a Docker image that CD pushes to GHCR; ECS Fargate runs them. Prod (`api`, `web`) uses ALB + CloudDeploy blue/green, WAF, and CloudFront. Alternatives: OpenNext/Lambda rejected for cold starts on SSR and for abandoning the existing Dockerfiles; EKS rejected as overkill for six Services. CI pushes images straight to ECR (native registry, no repository credentials in task definitions); the GHCR-based VPS workflow was dropped with the VPS.
