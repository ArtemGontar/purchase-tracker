# Project Configuration
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "purchase-tracker"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

# Application Configuration
variable "app_name" {
  description = "Application display name"
  type        = string
  default     = "Purchase Tracker"
}

variable "domain_name" {
  description = "Domain name for the application (optional)"
  type        = string
  default     = ""
}

# Database Configuration
variable "db_name" {
  description = "Database name"
  type        = string
  default     = "purchase_tracker"
  
  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]*$", var.db_name))
    error_message = "Database name must start with a letter and contain only alphanumeric characters and underscores."
  }
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "ptadmin"
  
  validation {
    condition     = length(var.db_username) >= 3 && length(var.db_username) <= 16
    error_message = "Database username must be between 3 and 16 characters."
  }
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
  
  validation {
    condition     = length(var.db_password) >= 8
    error_message = "Database password must be at least 8 characters long."
  }
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"  # Free tier eligible
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20  # Free tier: up to 20 GB
  
  validation {
    condition     = var.db_allocated_storage >= 20 && var.db_allocated_storage <= 20
    error_message = "Free tier allows up to 20 GB of storage."
  }
}

# S3 Configuration
variable "s3_bucket_name" {
  description = "S3 bucket name (will have random suffix added)"
  type        = string
  default     = "purchase-tracker-receipts"
}

variable "s3_versioning_enabled" {
  description = "Enable S3 bucket versioning"
  type        = bool
  default     = false  # Keep costs low
}

# Cognito Configuration
variable "cognito_user_pool_name" {
  description = "Cognito User Pool name"
  type        = string
  default     = "purchase-tracker-users"
}

variable "cognito_client_name" {
  description = "Cognito User Pool Client name"
  type        = string
  default     = "purchase-tracker-client"
}

variable "cognito_password_policy" {
  description = "Cognito password policy configuration"
  type = object({
    minimum_length    = number
    require_lowercase = bool
    require_numbers   = bool
    require_symbols   = bool
    require_uppercase = bool
  })
  default = {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }
}

# Security Configuration
variable "allowed_origins" {
  description = "CORS allowed origins for S3 bucket"
  type        = list(string)
  default     = ["*"]  # Restrict in production
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection for critical resources"
  type        = bool
  default     = false  # Set to true for production
}

# Monitoring Configuration
variable "cloudwatch_log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7  # Free tier: 5 GB storage
  
  validation {
    condition     = contains([1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653], var.cloudwatch_log_retention_days)
    error_message = "Log retention must be a valid CloudWatch retention period."
  }
}

variable "enable_detailed_monitoring" {
  description = "Enable detailed CloudWatch monitoring"
  type        = bool
  default     = false  # Keep costs low
}

# Tags
variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "PurchaseTracker"
    Environment = "development"
    ManagedBy   = "OpenTofu"
    Repository  = "purchase-tracker"
  }
}

# Feature Flags
variable "enable_backup" {
  description = "Enable automated backups for RDS"
  type        = bool
  default     = true
}

variable "backup_retention_period" {
  description = "RDS backup retention period in days"
  type        = number
  default     = 7  # Free tier: automated backups included
  
  validation {
    condition     = var.backup_retention_period >= 0 && var.backup_retention_period <= 35
    error_message = "Backup retention period must be between 0 and 35 days."
  }
}

variable "enable_multi_az" {
  description = "Enable Multi-AZ deployment for RDS"
  type        = bool
  default     = false  # Not free tier eligible
}

variable "enable_encryption" {
  description = "Enable encryption for RDS and S3"
  type        = bool
  default     = true
}
