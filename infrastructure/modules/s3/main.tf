# S3 bucket for receipt storage
resource "aws_s3_bucket" "receipts" {
  bucket = var.bucket_name

  tags = merge(var.tags, {
    Name        = "${var.project_name}-${var.environment}-receipts"
    Purpose     = "Receipt image storage"
    Environment = var.environment
  })
}

# Bucket versioning (disabled for cost optimization)
resource "aws_s3_bucket_versioning" "receipts" {
  bucket = aws_s3_bucket.receipts.id
  versioning_configuration {
    status = var.versioning_enabled ? "Enabled" : "Disabled"
  }
}

# Bucket encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "receipts" {
  bucket = aws_s3_bucket.receipts.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"  # Free tier compatible
    }
    bucket_key_enabled = true
  }
}

# Block public access (we'll use specific policies)
resource "aws_s3_bucket_public_access_block" "receipts" {
  bucket = aws_s3_bucket.receipts.id

  block_public_acls       = true
  block_public_policy     = false  # We need specific public read access
  ignore_public_acls      = true
  restrict_public_buckets = false
}

# CORS configuration for web/mobile access
resource "aws_s3_bucket_cors_configuration" "receipts" {
  bucket = aws_s3_bucket.receipts.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "POST", "PUT", "DELETE", "HEAD"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag", "x-amz-meta-custom-header"]
    max_age_seconds = 3000
  }
}

# Lifecycle configuration to manage costs
resource "aws_s3_bucket_lifecycle_configuration" "receipts" {
  bucket = aws_s3_bucket.receipts.id

  rule {
    id     = "receipt_lifecycle"
    status = "Enabled"

    # Delete incomplete multipart uploads after 1 day
    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }

    # Transition to Intelligent Tiering after 0 days (immediate)
    transition {
      days          = 0
      storage_class = "INTELLIGENT_TIERING"
    }

    # Optional: Delete old versions if versioning is enabled
    dynamic "noncurrent_version_expiration" {
      for_each = var.versioning_enabled ? [1] : []
      content {
        noncurrent_days = 90
      }
    }
  }
}

# Bucket policy for controlled public access
resource "aws_s3_bucket_policy" "receipts" {
  bucket = aws_s3_bucket.receipts.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowPublicRead"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.receipts.arn}/*"
        Condition = {
          StringLike = {
            "s3:ExistingObjectTag/Environment" = var.environment
          }
        }
      },
      {
        Sid    = "AllowTextractAccess"
        Effect = "Allow"
        Principal = {
          Service = "textract.amazonaws.com"
        }
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion"
        ]
        Resource = "${aws_s3_bucket.receipts.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.receipts]
}

# S3 bucket notification for processing (optional)
resource "aws_s3_bucket_notification" "receipts" {
  bucket = aws_s3_bucket.receipts.id

  # CloudWatch Events for monitoring
  eventbridge = true

  # Optional: Lambda function trigger for automatic processing
  # Uncomment if you want to process receipts automatically
  # lambda_function {
  #   lambda_function_arn = var.processing_lambda_arn
  #   events              = ["s3:ObjectCreated:*"]
  #   filter_prefix       = "receipts/"
  #   filter_suffix       = ".jpg"
  # }
}

# CloudWatch metric for bucket monitoring
resource "aws_cloudwatch_metric_alarm" "bucket_size" {
  count = var.enable_monitoring ? 1 : 0

  alarm_name          = "${var.project_name}-${var.environment}-s3-bucket-size"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "BucketSizeBytes"
  namespace           = "AWS/S3"
  period              = "86400"  # 1 day
  statistic           = "Average"
  threshold           = "4000000000"  # 4 GB (80% of free tier)
  alarm_description   = "This metric monitors S3 bucket size"
  alarm_actions       = []  # Add SNS topic ARN for notifications

  dimensions = {
    BucketName  = aws_s3_bucket.receipts.bucket
    StorageType = "StandardStorage"
  }

  tags = var.tags
}
