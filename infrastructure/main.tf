terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = var.tags
  }
}

# Generate random suffix for globally unique resource names
resource "random_id" "suffix" {
  byte_length = 4
}

# Data sources for existing AWS resources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC and networking (using default VPC for free tier)
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Modules
module "cognito" {
  source = "./modules/cognito"
  
  project_name       = var.project_name
  environment        = var.environment
  user_pool_name     = var.cognito_user_pool_name
  client_name        = var.cognito_client_name
  tags               = var.tags
}

module "s3" {
  source = "./modules/s3"
  
  project_name = var.project_name
  environment  = var.environment
  bucket_name  = "${var.s3_bucket_name}-${random_id.suffix.hex}"
  tags         = var.tags
}

module "dynamodb" {
  source = "./modules/dynamodb"
  
  project_name = var.project_name
  environment  = var.environment
  table_prefix = var.dynamodb_table_prefix
  tags         = var.tags
}

module "iam" {
  source = "./modules/iam"
  
  project_name          = var.project_name
  environment           = var.environment
  s3_bucket_arn         = module.s3.bucket_arn
  cognito_user_pool_arn = module.cognito.user_pool_arn
  dynamodb_table_arns   = module.dynamodb.table_arns
  tags                  = var.tags
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/application/${var.project_name}-${var.environment}"
  retention_in_days = 7  # Free tier: 5 GB log storage
  
  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-logs"
  })
}

# CloudWatch Log Group for Lambda (if needed)
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.project_name}-${var.environment}"
  retention_in_days = 7
  
  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-lambda-logs"
  })
}
