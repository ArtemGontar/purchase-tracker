#!/bin/bash

# Infrastructure Cleanup Script for Purchase Tracker
# This script safely destroys all infrastructure resources

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

echo -e "${RED}🧹 Purchase Tracker Infrastructure Cleanup${NC}"
echo "============================================"
echo -e "${RED}⚠️  WARNING: This will destroy ALL infrastructure resources${NC}"
echo ""

# Change to infrastructure directory
cd "$INFRA_DIR"

# Check if infrastructure is initialized
if [ ! -d ".terraform" ]; then
    echo -e "${YELLOW}⚠️  No infrastructure found to destroy${NC}"
    exit 0
fi

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    echo -e "${RED}❌ terraform.tfvars not found${NC}"
    echo "Cannot proceed without configuration file"
    exit 1
fi

# Show current resources
echo -e "${BLUE}📋 Current infrastructure:${NC}"
tofu show -no-color | head -20

echo ""
echo -e "${RED}⚠️  DANGER ZONE ⚠️${NC}"
echo "This will permanently delete:"
echo "- RDS database (including all data)"
echo "- S3 bucket (including all receipt images)"
echo "- Cognito User Pool (including all user accounts)"
echo "- CloudWatch logs"
echo "- All other resources"
echo ""
echo -e "${YELLOW}Make sure you have backups of any important data!${NC}"
echo ""

# Multiple confirmations for safety
read -p "Are you absolutely sure you want to destroy all resources? Type 'yes' to continue: " confirm1
if [ "$confirm1" != "yes" ]; then
    echo -e "${GREEN}✅ Cleanup cancelled - infrastructure preserved${NC}"
    exit 0
fi

read -p "This action cannot be undone. Type 'DESTROY' to confirm: " confirm2
if [ "$confirm2" != "DESTROY" ]; then
    echo -e "${GREEN}✅ Cleanup cancelled - infrastructure preserved${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🔍 Planning destruction...${NC}"

# Plan destruction
tofu plan -destroy -var-file="terraform.tfvars" -out=destroy.tfplan

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Destruction planning failed${NC}"
    exit 1
fi

# Final confirmation
echo ""
echo -e "${RED}🚨 FINAL WARNING 🚨${NC}"
echo "About to destroy all resources shown above."
read -p "Type 'CONFIRM DESTROY' to proceed: " final_confirm

if [ "$final_confirm" != "CONFIRM DESTROY" ]; then
    echo -e "${GREEN}✅ Cleanup cancelled - infrastructure preserved${NC}"
    rm -f destroy.tfplan
    exit 0
fi

# Execute destruction
echo ""
echo -e "${RED}💥 Destroying infrastructure...${NC}"
tofu apply destroy.tfplan

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Destruction failed${NC}"
    echo "Some resources may still exist. Check AWS console and run again if needed."
    exit 1
fi

# Clean up files
rm -f destroy.tfplan

# Clean up backend configuration file
BACKEND_DIR="$(dirname "$INFRA_DIR")/backend"
if [ -f "$BACKEND_DIR/.env.infrastructure" ]; then
    echo "# Infrastructure destroyed on: $(date)" > "$BACKEND_DIR/.env.infrastructure"
    echo "# All AWS resources have been removed" >> "$BACKEND_DIR/.env.infrastructure"
    echo -e "${BLUE}💾 Cleared backend configuration${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Infrastructure cleanup completed!${NC}"
echo "====================================="
echo ""
echo "All resources have been destroyed:"
echo "✅ RDS database deleted"
echo "✅ S3 bucket deleted"
echo "✅ Cognito User Pool deleted"
echo "✅ IAM roles and policies deleted"
echo "✅ CloudWatch logs deleted"
echo ""
echo -e "${BLUE}💰 Cost savings: ~\$0/month (you're back to pure free tier)${NC}"
echo ""
echo "To redeploy later:"
echo "1. Run: ./scripts/setup.sh"
echo "2. Reconfigure your backend application"
echo "3. Restore any data from backups"
