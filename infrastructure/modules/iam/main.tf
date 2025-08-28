# Backend Service Role
resource "aws_iam_role" "backend_service" {
  name = "${var.project_name}-${var.environment}-backend-service"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-backend-service-role"
  })
}

# Backend Service Policy
resource "aws_iam_role_policy" "backend_service" {
  name = "${var.project_name}-${var.environment}-backend-service-policy"
  role = aws_iam_role.backend_service.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # S3 Access for receipt storage
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:PutObjectTagging",
          "s3:GetObjectTagging"
        ]
        Resource = "${var.s3_bucket_arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = var.s3_bucket_arn
      },
      # Textract access for OCR
      {
        Effect = "Allow"
        Action = [
          "textract:AnalyzeDocument",
          "textract:AnalyzeExpense",
          "textract:DetectDocumentText"
        ]
        Resource = "*"
      },
      # Cognito access for user verification
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:GetUser",
          "cognito-idp:ListUsers",
          "cognito-idp:AdminGetUser"
        ]
        Resource = var.cognito_user_pool_arn
      },
      # CloudWatch Logs
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams",
          "logs:DescribeLogGroups"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      # SSM Parameter Store access for configuration
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Resource = "arn:aws:ssm:*:*:parameter/${var.project_name}/${var.environment}/*"
      }
    ]
  })
}

# Lambda Execution Role
resource "aws_iam_role" "lambda_execution" {
  name = "${var.project_name}-${var.environment}-lambda-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-lambda-execution-role"
  })
}

# Lambda Basic Execution Policy
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda Custom Policy
resource "aws_iam_role_policy" "lambda_custom" {
  name = "${var.project_name}-${var.environment}-lambda-custom-policy"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # S3 Access
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${var.s3_bucket_arn}/*"
      },
      # Textract Access
      {
        Effect = "Allow"
        Action = [
          "textract:AnalyzeDocument",
          "textract:AnalyzeExpense",
          "textract:DetectDocumentText"
        ]
        Resource = "*"
      },
      # RDS Data API (if using RDS Proxy in future)
      {
        Effect = "Allow"
        Action = [
          "rds-data:BeginTransaction",
          "rds-data:CommitTransaction",
          "rds-data:ExecuteStatement",
          "rds-data:RollbackTransaction"
        ]
        Resource = "*"
      },
      # SSM Parameter Store
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters"
        ]
        Resource = "arn:aws:ssm:*:*:parameter/${var.project_name}/${var.environment}/*"
      }
    ]
  })
}

# Instance Profile for EC2 (if needed)
resource "aws_iam_instance_profile" "backend_service" {
  name = "${var.project_name}-${var.environment}-backend-service"
  role = aws_iam_role.backend_service.name

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-backend-instance-profile"
  })
}

# User for programmatic access (development/CI)
resource "aws_iam_user" "ci_user" {
  name = "${var.project_name}-${var.environment}-ci"
  path = "/${var.project_name}/"

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-ci-user"
  })
}

# Policy for CI user
resource "aws_iam_user_policy" "ci_user" {
  name = "${var.project_name}-${var.environment}-ci-policy"
  user = aws_iam_user.ci_user.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # Limited S3 access for testing
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${var.s3_bucket_arn}/test/*"
      },
      # Textract access for testing
      {
        Effect = "Allow"
        Action = [
          "textract:AnalyzeDocument",
          "textract:DetectDocumentText"
        ]
        Resource = "*"
      },
      # CloudWatch Logs read access
      {
        Effect = "Allow"
        Action = [
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:GetLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

# Access Key for CI user (use with caution)
resource "aws_iam_access_key" "ci_user" {
  user = aws_iam_user.ci_user.name
}

# Store CI credentials in SSM (encrypted)
resource "aws_ssm_parameter" "ci_access_key" {
  name  = "/${var.project_name}/${var.environment}/ci/access_key_id"
  type  = "SecureString"
  value = aws_iam_access_key.ci_user.id

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-ci-access-key"
  })
}

resource "aws_ssm_parameter" "ci_secret_key" {
  name  = "/${var.project_name}/${var.environment}/ci/secret_access_key"
  type  = "SecureString"
  value = aws_iam_access_key.ci_user.secret

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-ci-secret-key"
  })
}
