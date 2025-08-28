# Random password if not provided
resource "random_password" "db_password" {
  count   = var.db_password == "" ? 1 : 0
  length  = 16
  special = true
}

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = var.subnet_ids

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  })
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-${var.environment}-rds-"
  vpc_id      = var.vpc_id
  description = "Security group for RDS PostgreSQL instance"

  # PostgreSQL access from application
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]  # VPC CIDR range
    description = "PostgreSQL access from VPC"
  }

  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-rds-sg"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# RDS Parameter Group
resource "aws_db_parameter_group" "main" {
  family = "postgres15"
  name   = "${var.project_name}-${var.environment}-postgres15"

  # Optimize for free tier performance
  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"  # Log queries longer than 1 second
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-postgres-params"
  })
}

# RDS Option Group
resource "aws_db_option_group" "main" {
  name                     = "${var.project_name}-${var.environment}-postgres"
  option_group_description = "Option group for PostgreSQL"
  engine_name              = "postgres"
  major_engine_version     = "15"

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-postgres-options"
  })
}

# RDS Instance
resource "aws_db_instance" "main" {
  # Basic Configuration
  identifier             = "${var.project_name}-${var.environment}-db"
  allocated_storage      = var.allocated_storage
  max_allocated_storage  = var.max_allocated_storage
  storage_type           = "gp2"  # General Purpose SSD
  storage_encrypted      = var.enable_encryption
  
  # Engine Configuration
  engine               = "postgres"
  engine_version       = "15.7"  # Latest in free tier
  instance_class       = var.instance_class
  parameter_group_name = aws_db_parameter_group.main.name
  option_group_name    = aws_db_option_group.main.name

  # Database Configuration
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password != "" ? var.db_password : random_password.db_password[0].result
  port     = 5432

  # Network Configuration
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false  # Keep private for security

  # Backup Configuration
  backup_retention_period = var.backup_retention_period
  backup_window          = "03:00-04:00"  # UTC
  maintenance_window     = "Sun:04:00-Sun:05:00"  # UTC
  
  # Free Tier Optimizations
  multi_az               = var.enable_multi_az
  availability_zone      = var.enable_multi_az ? null : var.availability_zones[0]
  
  # Monitoring
  monitoring_interval = 0  # Disable enhanced monitoring to stay in free tier
  enabled_cloudwatch_logs_exports = []  # Disable to save costs
  
  # Performance Insights (not free tier)
  performance_insights_enabled = false
  
  # Deletion Protection
  deletion_protection = var.enable_deletion_protection
  skip_final_snapshot = !var.enable_deletion_protection
  final_snapshot_identifier = var.enable_deletion_protection ? "${var.project_name}-${var.environment}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  # Auto Minor Version Upgrade
  auto_minor_version_upgrade = true
  
  # Apply changes immediately (for development)
  apply_immediately = var.environment == "dev"

  tags = merge(var.tags, {
    Name        = "${var.project_name}-${var.environment}-postgres"
    Environment = var.environment
    Engine      = "postgres"
  })

  depends_on = [
    aws_db_subnet_group.main,
    aws_security_group.rds
  ]
}

# CloudWatch Alarms for RDS monitoring
resource "aws_cloudwatch_metric_alarm" "database_cpu" {
  count = var.enable_monitoring ? 1 : 0

  alarm_name          = "${var.project_name}-${var.environment}-rds-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"  # 5 minutes
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors RDS CPU utilization"
  alarm_actions       = []  # Add SNS topic ARN for notifications

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "database_connections" {
  count = var.enable_monitoring ? 1 : 0

  alarm_name          = "${var.project_name}-${var.environment}-rds-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "15"  # t3.micro typically supports ~20 connections
  alarm_description   = "This metric monitors RDS connection count"
  alarm_actions       = []

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }

  tags = var.tags
}

# SSM Parameter for database URL (for secure access)
resource "aws_ssm_parameter" "database_url" {
  name  = "/${var.project_name}/${var.environment}/database/url"
  type  = "SecureString"
  value = "postgresql://${aws_db_instance.main.username}:${var.db_password != "" ? var.db_password : random_password.db_password[0].result}@${aws_db_instance.main.endpoint}:${aws_db_instance.main.port}/${aws_db_instance.main.db_name}?schema=public"

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-database-url"
  })
}
