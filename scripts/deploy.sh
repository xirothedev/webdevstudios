#!/bin/bash

# WebDev Studios Deployment Script
# Usage: ./deploy.sh [staging|production]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
PROJECT_DIR=""
COMPOSE_FILE=""
ENV_FILE=""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}WebDev Studios Deployment${NC}"
echo -e "${GREEN}Environment: $ENVIRONMENT${NC}"
echo -e "${GREEN}========================================${NC}"

# Set environment-specific variables
if [ "$ENVIRONMENT" = "production" ]; then
    PROJECT_DIR="/opt/webdevstudios-prod"
    COMPOSE_FILE="docker-compose.prod.yml"
    ENV_FILE=".env.production"
elif [ "$ENVIRONMENT" = "staging" ]; then
    PROJECT_DIR="/opt/webdevstudios-staging"
    COMPOSE_FILE="docker-compose.staging.yml"
    ENV_FILE=".env.staging"
else
    echo -e "${RED}Invalid environment. Use 'staging' or 'production'${NC}"
    exit 1
fi

# Change to project directory
cd "$PROJECT_DIR" || {
    echo -e "${RED}Error: Project directory $PROJECT_DIR not found${NC}"
    echo -e "${YELLOW}Run setup first: ./setup.sh $ENVIRONMENT${NC}"
    exit 1
}

# Load environment variables
if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
else
    echo -e "${YELLOW}Warning: $ENV_FILE not found${NC}"
fi

echo -e "\n${GREEN}Step 1: Pulling latest images...${NC}"
docker compose -f "$COMPOSE_FILE" pull

echo -e "\n${GREEN}Step 2: Running database migrations...${NC}"
docker compose -f "$COMPOSE_FILE" exec -T api npx prisma migrate deploy || {
    echo -e "${YELLOW}Warning: Migration failed or already applied${NC}"
}

echo -e "\n${GREEN}Step 3: Starting services...${NC}"
docker compose -f "$COMPOSE_FILE" up -d

echo -e "\n${GREEN}Step 4: Waiting for services to be healthy...${NC}"
sleep 10

echo -e "\n${GREEN}Step 5: Checking service status...${NC}"
docker compose -f "$COMPOSE_FILE" ps

echo -e "\n${GREEN}Step 6: Cleaning up old images...${NC}"
docker image prune -af --filter "until=24h" || true

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}========================================${NC}"
