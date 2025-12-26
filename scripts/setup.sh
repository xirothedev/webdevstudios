#!/bin/bash

# WebDev Studios VPS Setup Script
# Usage: ./setup.sh [staging|production]

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

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}WebDev Studios VPS Setup${NC}"
echo -e "${GREEN}Environment: $ENVIRONMENT${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

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

echo -e "\n${GREEN}Step 1: Installing dependencies...${NC}"

# Update package list
apt-get update

# Install required packages
apt-get install -y \
    curl \
    git \
    docker \
    docker-compose \
    ufw

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

echo -e "\n${GREEN}Step 2: Setting up project directory...${NC}"

# Create project directory
mkdir -p "$PROJECT_DIR"
mkdir -p "$PROJECT_DIR/nginx/ssl"
mkdir -p "$PROJECT_DIR/nginx/logs"

echo -e "\n${GREEN}Step 3: Configuring firewall...${NC}"

# Configure UFW
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo -e "\n${GREEN}Step 4: Creating environment file template...${NC}"

# Create environment file template
cat > "$PROJECT_DIR/$ENV_FILE" << EOF
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=\${POSTGRES_PASSWORD}
POSTGRES_DB=webdevstudios

# Redis
REDIS_PASSWORD=\${REDIS_PASSWORD}

# JWT
JWT_SECRET=\${JWT_SECRET}
JWT_EXPIRES_IN=7d

# AWS S3/R2
AWS_ACCESS_KEY_ID=\${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=\${AWS_SECRET_ACCESS_KEY}
AWS_REGION=auto
AWS_S3_BUCKET=\${AWS_S3_BUCKET}

# API URL
API_URL=http://api:4000

# GitHub Repository (for docker images)
GITHUB_REPOSITORY=your-username/webdevstudios
EOF

echo -e "\n${YELLOW}Environment file created at: $PROJECT_DIR/$ENV_FILE${NC}"
echo -e "${YELLOW}Please edit this file and add your actual values${NC}"

echo -e "\n${GREEN}Step 5: Setting up SSL (Let's Encrypt)...${NC}"

# Install certbot
apt-get install -y certbot

echo -e "${YELLOW}To obtain SSL certificates, run:${NC}"
echo -e "${YELLOW}  certbot certonly --standalone -d your-domain.com${NC}"
echo -e "${YELLOW}Then copy the certificates to:$PROJECT_DIR/nginx/ssl/${NC}"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Edit $PROJECT_DIR/$ENV_FILE with your values"
echo -e "2. Copy docker-compose files to $PROJECT_DIR/"
echo -e "3. Copy nginx.conf to $PROJECT_DIR/"
echo -e "4. Run: ./deploy.sh $ENVIRONMENT"
