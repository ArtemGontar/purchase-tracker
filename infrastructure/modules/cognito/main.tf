# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-${var.environment}-${var.user_pool_name}"

  # User attributes
  alias_attributes = ["email"]
  username_attributes = ["email"]

  # Password policy
  password_policy {
    minimum_length    = var.password_policy.minimum_length
    require_lowercase = var.password_policy.require_lowercase
    require_numbers   = var.password_policy.require_numbers
    require_symbols   = var.password_policy.require_symbols
    require_uppercase = var.password_policy.require_uppercase
  }

  # Email configuration
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"  # Free tier
  }

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # User pool policies
  admin_create_user_config {
    allow_admin_create_user_only = false
    invite_message_template {
      email_message = "Welcome to ${var.project_name}! Your username is {username} and temporary password is {####}"
      email_subject = "Welcome to ${var.project_name}"
    }
  }

  # Email verification
  auto_verified_attributes = ["email"]

  # Schema for user attributes
  schema {
    attribute_data_type = "String"
    name               = "email"
    required           = true
    mutable           = true
  }

  schema {
    attribute_data_type = "String"
    name               = "given_name"
    required           = false
    mutable           = true
  }

  schema {
    attribute_data_type = "String"
    name               = "family_name"
    required           = false
    mutable           = true
  }

  # Verification message templates
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_message        = "Your verification code for ${var.project_name} is {####}"
    email_subject        = "Your verification code"
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-user-pool"
  })
}

# Cognito User Pool Client
resource "aws_cognito_user_pool_client" "main" {
  name         = "${var.project_name}-${var.environment}-${var.client_name}"
  user_pool_id = aws_cognito_user_pool.main.id

  # Client settings
  generate_secret = false  # For mobile/web apps
  
  # OAuth settings
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"  # For development ease
  ]

  # Token validity
  access_token_validity  = 1    # 1 hour
  id_token_validity     = 1    # 1 hour
  refresh_token_validity = 30   # 30 days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  # Prevent user existence errors
  prevent_user_existence_errors = "ENABLED"

  # Read and write attributes
  read_attributes = [
    "email",
    "email_verified",
    "given_name",
    "family_name"
  ]

  write_attributes = [
    "email",
    "given_name",
    "family_name"
  ]

  # Enable SRP protocol
  enable_token_revocation = true
  enable_propagate_additional_user_context_data = false
}

# User Pool Domain (for hosted UI)
resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.project_name}-${var.environment}-${random_id.domain_suffix.hex}"
  user_pool_id = aws_cognito_user_pool.main.id
}

# Random suffix for domain uniqueness
resource "random_id" "domain_suffix" {
  byte_length = 4
}

# Identity Pool (for AWS service access)
resource "aws_cognito_identity_pool" "main" {
  identity_pool_name               = "${var.project_name}_${var.environment}_identity_pool"
  allow_unauthenticated_identities = false

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.main.id
    provider_name          = aws_cognito_user_pool.main.endpoint
    server_side_token_check = false
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-identity-pool"
  })
}

# IAM role for authenticated users
resource "aws_iam_role" "authenticated" {
  name = "${var.project_name}-${var.environment}-cognito-authenticated"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.main.id
          }
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "authenticated"
          }
        }
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-cognito-authenticated-role"
  })
}

# IAM policy for authenticated users
resource "aws_iam_role_policy" "authenticated" {
  name = "${var.project_name}-${var.environment}-cognito-authenticated-policy"
  role = aws_iam_role.authenticated.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cognito-sync:*",
          "cognito-identity:*"
        ]
        Resource = "*"
      }
    ]
  })
}

# Attach role to identity pool
resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.main.id

  roles = {
    authenticated = aws_iam_role.authenticated.arn
  }
}
