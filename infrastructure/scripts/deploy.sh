#!/bin/bash

# Infrastructure Deployment Script for Purchase Tracker
# This script deploys updates to existing infrastructure

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}🚀 Purchase Tracker Infrastructure Deployment${NC}"
echo "============================================="

# Change to infrastructure directory
cd "$INFRA_DIR"

# Check if infrastructure is initialized
if [ ! -d ".terraform" ]; then
    echo -e "${RED}❌ Infrastructure not initialized${NC}"
    echo "Please run setup.sh first"
    exit 1
fi

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    echo -e "${RED}❌ terraform.tfvars not found${NC}"
    echo "Please create terraform.tfvars from terraform.tfvars.example"
    exit 1
fi

# Validate configuration
echo -e "${BLUE}🔍 Validating configuration...${NC}"
tofu validate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Configuration validation failed${NC}"
    exit 1
fi

# Plan deployment
echo -e "${BLUE}📋 Planning deployment...${NC}"
tofu plan -var-file="terraform.tfvars" -out=tfplan

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Planning failed${NC}"
    exit 1
fi

# Check if there are changes
if tofu show -no-color tfplan | grep -q "No changes"; then
    echo -e "${GREEN}✅ No changes to apply${NC}"
    rm -f tfplan
    exit 0
fi

# Confirm deployment
echo -e "${YELLOW}⚠️  Ready to apply changes${NC}"
echo "Review the plan above carefully."
echo ""
read -p "Do you want to proceed with deployment? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}⏸️  Deployment cancelled${NC}"
    rm -f tfplan
    exit 0
fi

# Apply configuration
echo -e "${BLUE}🚀 Applying changes...${NC}"
tofu apply tfplan

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

# Clean up plan file
rm -f tfplan

# Update backend configuration
echo -e "${BLUE}💾 Updating configuration...${NC}"
BACKEND_DIR="$(dirname "$INFRA_DIR")/backend"

if [ -d "$BACKEND_DIR" ]; then
    echo "# Infrastructure outputs - updated by deploy.sh" > "$BACKEND_DIR/.env.infrastructure"
    echo "# Updated on: $(date)" >> "$BACKEND_DIR/.env.infrastructure"
    echo "" >> "$BACKEND_DIR/.env.infrastructure"
    
    # Extract key outputs
    tofu output -json | jq -r '
        .backend_env_config.value | to_entries[] | 
        "\(.key)=\(.value)"
    ' >> "$BACKEND_DIR/.env.infrastructure"
    
    echo -e "${GREEN}✅ Configuration updated in backend/.env.infrastructure${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo "====================================="
echo ""
echo "Remember to:"
echo "1. Restart your backend application if configuration changed"
echo "2. Test the updated infrastructure"
echo "3. Monitor costs and usage"
