# AWS Account Information
output "aws_account_id" {
  description = "AWS Account ID"
  value       = data.aws_caller_identity.current.account_id
}

output "aws_region" {
  description = "AWS Region"
  value       = data.aws_region.current.name
}

# Cognito Outputs
output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.cognito.user_pool_id
}

output "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN"
  value       = module.cognito.user_pool_arn
}

output "cognito_client_id" {
  description = "Cognito User Pool Client ID"
  value       = module.cognito.client_id
  sensitive   = true
}

output "cognito_user_pool_domain" {
  description = "Cognito User Pool Domain"
  value       = module.cognito.user_pool_domain
}

# S3 Outputs
output "s3_bucket_name" {
  description = "S3 bucket name for receipt storage"
  value       = module.s3.bucket_name
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = module.s3.bucket_arn
}

output "s3_bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = module.s3.bucket_domain_name
}

output "s3_bucket_regional_domain_name" {
  description = "S3 bucket regional domain name"
  value       = module.s3.bucket_regional_domain_name
}

# RDS Outputs
output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = module.rds.db_instance_endpoint
  sensitive   = true
}

output "rds_port" {
  description = "RDS instance port"
  value       = module.rds.db_instance_port
}

output "rds_database_name" {
  description = "RDS database name"
  value       = module.rds.db_instance_name
}

output "rds_username" {
  description = "RDS master username"
  value       = module.rds.db_instance_username
  sensitive   = true
}

# IAM Outputs
output "backend_role_arn" {
  description = "Backend service IAM role ARN"
  value       = module.iam.backend_role_arn
}

output "lambda_role_arn" {
  description = "Lambda execution role ARN"
  value       = module.iam.lambda_role_arn
}

# CloudWatch Outputs
output "app_log_group_name" {
  description = "Application CloudWatch log group name"
  value       = aws_cloudwatch_log_group.app_logs.name
}

output "app_log_group_arn" {
  description = "Application CloudWatch log group ARN"
  value       = aws_cloudwatch_log_group.app_logs.arn
}

# Database Connection String
output "database_url" {
  description = "PostgreSQL connection URL for Prisma"
  value       = "postgresql://${module.rds.db_instance_username}:${var.db_password}@${module.rds.db_instance_endpoint}:${module.rds.db_instance_port}/${module.rds.db_instance_name}?schema=public"
  sensitive   = true
}

# Environment Configuration for Backend
output "backend_env_config" {
  description = "Environment variables for backend configuration"
  value = {
    NODE_ENV                    = var.environment
    AWS_REGION                 = var.aws_region
    AWS_COGNITO_USER_POOL_ID   = module.cognito.user_pool_id
    AWS_COGNITO_CLIENT_ID      = module.cognito.client_id
    AWS_S3_BUCKET              = module.s3.bucket_name
    DATABASE_URL               = "postgresql://${module.rds.db_instance_username}:${var.db_password}@${module.rds.db_instance_endpoint}:${module.rds.db_instance_port}/${module.rds.db_instance_name}?schema=public"
    CLOUDWATCH_LOG_GROUP       = aws_cloudwatch_log_group.app_logs.name
  }
  sensitive = true
}

# Summary Information
output "infrastructure_summary" {
  description = "Summary of deployed infrastructure"
  value = {
    project_name = var.project_name
    environment  = var.environment
    region       = var.aws_region
    resources = {
      cognito_user_pool = module.cognito.user_pool_id
      s3_bucket        = module.s3.bucket_name
      rds_instance     = module.rds.db_instance_identifier
      log_groups       = [aws_cloudwatch_log_group.app_logs.name, aws_cloudwatch_log_group.lambda_logs.name]
    }
    endpoints = {
      database = module.rds.db_instance_endpoint
      s3_bucket = module.s3.bucket_domain_name
    }
  }
}

# Cost Optimization Information
output "cost_optimization" {
  description = "Free tier usage and cost optimization information"
  value = {
    free_tier_resources = {
      cognito_mau     = "50,000 MAU (Monthly Active Users)"
      s3_storage      = "5 GB storage, 20,000 GET requests, 2,000 PUT requests"
      rds_hours       = "750 hours of t3.micro/t2.micro instances"
      rds_storage     = "20 GB of storage"
      cloudwatch_logs = "5 GB of log ingestion and storage"
    }
    cost_monitoring = {
      enable_billing_alerts = "Recommended to set up billing alerts"
      budget_recommendation = "$10 monthly budget as safety net"
      free_tier_expiry      = "12 months from AWS account creation"
    }
  }
}
