# Infrastructure Setup Guide 🏗️☁️

This guide covers setting up the complete AWS infrastructure for the Purchase Tracker application using **OpenTofu** (open-source Terraform fork) while staying within the **AWS Free Tier**.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [AWS Free Tier Resources](#aws-free-tier-resources)
- [OpenTofu vs Terraform](#opentofu-vs-terraform)
- [Infrastructure Components](#infrastructure-components)
- [Project Structure](#project-structure)
- [Step-by-Step Setup](#step-by-step-setup)
- [Environment Configuration](#environment-configuration)
- [Deployment Commands](#deployment-commands)
- [Monitoring and Costs](#monitoring-and-costs)
- [Cleanup](#cleanup)
- [Troubleshooting](#troubleshooting)

## Overview

Our infrastructure will include:
- **AWS Cognito** - User authentication and management
- **Amazon S3** - Receipt image storage
- **Amazon Textract** - OCR for receipt processing
- **Amazon RDS** - PostgreSQL database
- **AWS Lambda** - Serverless functions (optional)
- **CloudWatch** - Logging and monitoring
- **IAM** - Security roles and policies

All resources are designed to fit within AWS Free Tier limits for the first 12 months.

## Prerequisites

### Required Tools
```bash
# 1. Install OpenTofu (open-source Terraform)
# macOS
brew install opentofu

# Linux
curl --proto '=https' --tlsv1.2 -fsSL https://get.opentofu.org/install-opentofu.sh -o install-opentofu.sh
chmod +x install-opentofu.sh && ./install-opentofu.sh --install-method brew

# Verify installation
tofu version
```

### AWS Account Setup
1. **AWS Account** - Create if you don't have one
2. **AWS CLI** - For authentication and management
3. **AWS IAM User** - With programmatic access
4. **Free Tier Monitoring** - Enable billing alerts

```bash
# Install AWS CLI
# macOS
brew install awscli

# Configure AWS credentials
aws configure
# Enter your Access Key ID, Secret Access Key, Region (us-east-1), and output format (json)
```

### Required AWS Permissions
Your IAM user needs these permissions:
- `AmazonCognitoPowerUser`
- `AmazonS3FullAccess`
- `AmazonTextractFullAccess`
- `AmazonRDSFullAccess`
- `CloudWatchFullAccess`
- `IAMFullAccess`
- `AWSLambdaFullAccess`

## AWS Free Tier Resources

### What's Included (First 12 Months)
| Service | Free Tier Limits | Our Usage |
|---------|------------------|-----------|
| **Amazon Cognito** | 50,000 MAU (Monthly Active Users) | ✅ Perfect for personal/small app |
| **Amazon S3** | 5 GB storage, 20,000 GET, 2,000 PUT | ✅ Plenty for receipt images |
| **Amazon Textract** | 1,000 pages per month | ✅ Good for moderate usage |
| **Amazon RDS** | 750 hours t2.micro, 20 GB storage | ✅ Single instance PostgreSQL |
| **AWS Lambda** | 1M requests, 400,000 GB-seconds | ✅ Serverless functions |
| **CloudWatch** | 10 custom metrics, 5 GB logs | ✅ Basic monitoring |

### Always Free (Beyond 12 Months)
- **Cognito**: 50,000 MAU permanently free
- **S3**: 5,000 GET and 20,000 PUT requests per month
- **Lambda**: 1M requests and 400,000 GB-seconds per month

## OpenTofu vs Terraform

**Why OpenTofu?**
- ✅ **Completely Free** - No licensing fees, ever
- ✅ **Open Source** - Community-driven development
- ✅ **Terraform Compatible** - Same syntax and providers
- ✅ **No Vendor Lock-in** - Independent governance
- ✅ **Active Development** - Regular updates and improvements

**Migration from Terraform:**
```bash
# If you have existing Terraform files, just rename the binary
alias terraform=tofu
# Or update your scripts to use 'tofu' instead of 'terraform'
```

## Infrastructure Components

### 1. Amazon Cognito User Pool
```hcl
# User authentication and management
# Features: Sign-up, sign-in, password reset, MFA options
# Free Tier: 50,000 MAU (Monthly Active Users)
```

### 2. Amazon S3 Bucket
```hcl
# Receipt image storage with lifecycle policies
# Features: Versioning, encryption, public read access for app
# Free Tier: 5 GB storage, 20,000 GET, 2,000 PUT requests
```

### 3. Amazon RDS PostgreSQL
```hcl
# Managed PostgreSQL database
# Instance: t3.micro (or t2.micro for older regions)
# Free Tier: 750 hours, 20 GB storage, automated backups
```

### 4. IAM Roles and Policies
```hcl
# Least-privilege access for services
# Backend service role for accessing S3, Textract, RDS
# Lambda execution roles (if using serverless functions)
```

### 5. CloudWatch Logs
```hcl
# Application logging and monitoring
# Log groups for backend application and Lambda functions
# Free Tier: 5 GB log ingestion and storage
```

## Project Structure

```
infrastructure/
├── main.tf                 # Main configuration file
├── variables.tf            # Input variables
├── outputs.tf             # Output values
├── terraform.tfvars       # Variable values (gitignored)
├── versions.tf            # Provider requirements
├── modules/               # Reusable modules
│   ├── cognito/          # Cognito User Pool module
│   ├── s3/               # S3 bucket module
│   ├── rds/              # RDS database module
│   └── iam/              # IAM roles and policies
├── environments/          # Environment-specific configs
│   ├── dev/              # Development environment
│   ├── staging/          # Staging environment
│   └── prod/             # Production environment
└── scripts/              # Helper scripts
    ├── setup.sh          # Initial setup script
    ├── deploy.sh         # Deployment script
    └── destroy.sh        # Cleanup script
```

## Step-by-Step Setup

### 1. Clone and Initialize
```bash
# Navigate to your project root
cd /Users/anduser/purchase-tracker

# Create infrastructure directory
mkdir -p infrastructure/{modules/{cognito,s3,rds,iam},environments/{dev,staging,prod},scripts}

# Initialize OpenTofu
cd infrastructure
tofu init
```

### 2. Configure Variables
```bash
# Create terraform.tfvars (this file should be gitignored)
cat > terraform.tfvars << EOF
# Basic Configuration
project_name = "purchase-tracker"
environment  = "dev"
aws_region   = "us-east-1"

# Application Configuration
app_name = "PurchaseTracker"
domain_name = "your-domain.com"  # Optional: for custom domain

# Database Configuration
db_name = "purchase_tracker"
db_username = "ptadmin"
db_password = "your-secure-password-here"  # Change this!

# S3 Configuration
s3_bucket_name = "purchase-tracker-receipts-dev-unique-suffix"

# Cognito Configuration
cognito_user_pool_name = "purchase-tracker-users"
cognito_client_name = "purchase-tracker-client"

# Tags
tags = {
  Project     = "PurchaseTracker"
  Environment = "development"
  ManagedBy   = "OpenTofu"
  Owner       = "YourName"
}
EOF
```

### 3. Environment-Specific Configuration
```bash
# Development environment
cat > environments/dev/main.tf << EOF
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = var.tags
  }
}

# Include all modules
module "cognito" {
  source = "../../modules/cognito"
  
  project_name = var.project_name
  environment  = var.environment
  user_pool_name = var.cognito_user_pool_name
  client_name    = var.cognito_client_name
}

module "s3" {
  source = "../../modules/s3"
  
  project_name = var.project_name
  environment  = var.environment
  bucket_name  = var.s3_bucket_name
}

module "rds" {
  source = "../../modules/rds"
  
  project_name = var.project_name
  environment  = var.environment
  db_name      = var.db_name
  db_username  = var.db_username
  db_password  = var.db_password
}

module "iam" {
  source = "../../modules/iam"
  
  project_name = var.project_name
  environment  = var.environment
  s3_bucket_arn = module.s3.bucket_arn
  cognito_user_pool_arn = module.cognito.user_pool_arn
}
EOF
```

## Environment Configuration

### Development Environment
- **RDS**: t3.micro instance, 20 GB storage
- **S3**: Single bucket with public read access
- **Cognito**: Basic user pool with email verification
- **No SSL/Custom Domain**: Use default AWS endpoints

### Staging Environment  
- **RDS**: t3.micro with automated backups
- **S3**: Separate bucket with lifecycle policies
- **Cognito**: Same configuration as dev
- **Optional SSL**: Let's Encrypt certificates

### Production Environment
- **RDS**: t3.micro with Multi-AZ (if budget allows)
- **S3**: Production bucket with CloudFront CDN
- **Cognito**: Production user pool with advanced security
- **SSL Required**: Custom domain with SSL certificates

## Deployment Commands

### Initial Deployment
```bash
# 1. Initialize and validate
cd infrastructure
tofu init
tofu validate

# 2. Plan the deployment
tofu plan -var-file="terraform.tfvars"

# 3. Apply the configuration
tofu apply -var-file="terraform.tfvars"

# 4. Save important outputs
tofu output > ../backend/.env.infrastructure
```

### Update Deployment
```bash
# Plan changes
tofu plan -var-file="terraform.tfvars"

# Apply changes
tofu apply -var-file="terraform.tfvars"
```

### Environment-Specific Deployment
```bash
# Deploy to specific environment
cd environments/dev
tofu init
tofu plan -var-file="../../terraform.tfvars"
tofu apply -var-file="../../terraform.tfvars"
```

## Monitoring and Costs

### Cost Monitoring Setup
```bash
# Enable billing alerts (run once)
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget '{
    "BudgetName": "PurchaseTrackerBudget",
    "BudgetLimit": {
      "Amount": "10.00",
      "Unit": "USD"
    },
    "TimeUnit": "MONTHLY",
    "BudgetType": "COST"
  }'
```

### Resource Monitoring
```bash
# Check S3 storage usage
aws s3 ls s3://your-bucket-name --recursive --human-readable --summarize

# Check RDS instance status
aws rds describe-db-instances --db-instance-identifier purchase-tracker-dev

# Check Cognito usage (manual via AWS Console)
# Navigate to Cognito → User Pools → Metrics
```

### Free Tier Usage Tracking
- **AWS Billing Dashboard**: Track free tier usage
- **CloudWatch**: Monitor API calls and storage
- **Cost Explorer**: Analyze spending patterns
- **Budgets**: Set up alerts for unexpected costs

## Cleanup

### Destroy Infrastructure
```bash
# Remove all resources (be careful!)
tofu destroy -var-file="terraform.tfvars"

# Verify deletion
aws s3 ls  # Should not show your bucket
aws rds describe-db-instances  # Should not show your instance
```

### Partial Cleanup
```bash
# Remove specific resources
tofu destroy -target=module.rds -var-file="terraform.tfvars"
tofu destroy -target=module.s3 -var-file="terraform.tfvars"
```

## Troubleshooting

### Common Issues

**1. AWS Credentials Not Configured**
```bash
# Configure AWS CLI
aws configure
# Or set environment variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

**2. S3 Bucket Name Already Exists**
```bash
# S3 bucket names are globally unique
# Add a unique suffix to your bucket name
s3_bucket_name = "purchase-tracker-receipts-dev-$(date +%s)"
```

**3. RDS Subnet Group Issues**
```bash
# Ensure you have at least 2 subnets in different AZs
# The module will create default VPC subnets if needed
```

**4. Free Tier Limits Exceeded**
```bash
# Check AWS Billing Dashboard
# Monitor CloudWatch metrics
# Review usage in AWS Cost Explorer
```

**5. OpenTofu State Lock**
```bash
# If using S3 backend and state is locked
tofu force-unlock LOCK_ID
```

### Getting Help

**Resource Documentation:**
- [OpenTofu Documentation](https://opentofu.org/docs/)
- [AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Free Tier Guide](https://aws.amazon.com/free/)

**Community Support:**
- [OpenTofu GitHub](https://github.com/opentofu/opentofu)
- [AWS Community Forums](https://forums.aws.amazon.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/terraform+aws)

## Security Best Practices

### 1. Credential Management
- ✅ Use IAM roles instead of access keys when possible
- ✅ Rotate access keys regularly
- ✅ Never commit credentials to git
- ✅ Use AWS Secrets Manager for sensitive data

### 2. Network Security
- ✅ Enable VPC for RDS (default in our setup)
- ✅ Use security groups to restrict access
- ✅ Enable encryption at rest and in transit
- ✅ Regular security audits with AWS Config

### 3. Data Protection
- ✅ S3 bucket encryption enabled
- ✅ RDS automated backups enabled
- ✅ CloudTrail for audit logging
- ✅ Regular backup testing

## Next Steps

1. **Review the configuration files** in the next section
2. **Customize variables** for your specific needs
3. **Deploy the infrastructure** using the commands above
4. **Test the deployment** with your backend application
5. **Set up monitoring** and cost alerts
6. **Document your customizations** for team members

The infrastructure setup provides a solid foundation for your Purchase Tracker application while maintaining cost efficiency through AWS Free Tier optimization. 🚀

---

**Tools Used:** OpenTofu, AWS CLI, AWS Free Tier
**Estimated Monthly Cost:** $0 (within free tier limits)
**Setup Time:** 30-60 minutes
**Maintenance:** Minimal with automated monitoring
