output "backend_role_arn" {
  description = "Backend service IAM role ARN"
  value       = aws_iam_role.backend_service.arn
}

output "backend_role_name" {
  description = "Backend service IAM role name"
  value       = aws_iam_role.backend_service.name
}

output "lambda_role_arn" {
  description = "Lambda execution role ARN"
  value       = aws_iam_role.lambda_execution.arn
}

output "lambda_role_name" {
  description = "Lambda execution role name"
  value       = aws_iam_role.lambda_execution.name
}

output "instance_profile_name" {
  description = "Instance profile name for EC2"
  value       = aws_iam_instance_profile.backend_service.name
}

output "instance_profile_arn" {
  description = "Instance profile ARN for EC2"
  value       = aws_iam_instance_profile.backend_service.arn
}

output "ci_user_name" {
  description = "CI user name"
  value       = aws_iam_user.ci_user.name
}

output "ci_user_arn" {
  description = "CI user ARN"
  value       = aws_iam_user.ci_user.arn
}

output "ci_access_key_id" {
  description = "CI user access key ID"
  value       = aws_iam_access_key.ci_user.id
  sensitive   = true
}

output "ci_secret_access_key" {
  description = "CI user secret access key"
  value       = aws_iam_access_key.ci_user.secret
  sensitive   = true
}

output "ci_credentials_ssm_parameters" {
  description = "SSM parameter names for CI credentials"
  value = {
    access_key_id     = aws_ssm_parameter.ci_access_key.name
    secret_access_key = aws_ssm_parameter.ci_secret_key.name
  }
}
