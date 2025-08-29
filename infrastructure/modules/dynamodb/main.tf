# DynamoDB Tables for Purchase Tracker Application

# Users table
resource "aws_dynamodb_table" "users" {
  name           = "${var.table_prefix}-users"
  billing_mode   = "PAY_PER_REQUEST"  # Serverless billing
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "cognitoId"
    type = "S"
  }

  # Global Secondary Index for querying by Cognito ID
  global_secondary_index {
    name     = "CognitoIdIndex"
    hash_key = "cognitoId"
  }

  # Point-in-time recovery for data protection
  point_in_time_recovery {
    enabled = true
  }

  # Server-side encryption
  server_side_encryption {
    enabled = true
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-users"
    Type = "DynamoDB"
  })
}

# Receipts table
resource "aws_dynamodb_table" "receipts" {
  name           = "${var.table_prefix}-receipts"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  # Global Secondary Index for querying receipts by user
  global_secondary_index {
    name     = "UserIdIndex"
    hash_key = "userId"
    range_key = "createdAt"
  }

  # Point-in-time recovery
  point_in_time_recovery {
    enabled = true
  }

  # Server-side encryption
  server_side_encryption {
    enabled = true
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-receipts"
    Type = "DynamoDB"
  })
}

# Purchases table
resource "aws_dynamodb_table" "purchases" {
  name           = "${var.table_prefix}-purchases"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "purchaseDate"
    type = "S"
  }

  # Global Secondary Index for querying purchases by user and date
  global_secondary_index {
    name     = "UserIdIndex"
    hash_key = "userId"
    range_key = "purchaseDate"
  }

  # Point-in-time recovery
  point_in_time_recovery {
    enabled = true
  }

  # Server-side encryption
  server_side_encryption {
    enabled = true
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-purchases"
    Type = "DynamoDB"
  })
}
