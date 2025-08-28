output "db_instance_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
}

output "db_instance_port" {
  description = "RDS instance port"
  value       = aws_db_instance.main.port
}

output "db_instance_name" {
  description = "RDS instance database name"
  value       = aws_db_instance.main.db_name
}

output "db_instance_username" {
  description = "RDS instance master username"
  value       = aws_db_instance.main.username
}

output "db_instance_identifier" {
  description = "RDS instance identifier"
  value       = aws_db_instance.main.identifier
}

output "db_instance_arn" {
  description = "RDS instance ARN"
  value       = aws_db_instance.main.arn
}

output "db_instance_availability_zone" {
  description = "RDS instance availability zone"
  value       = aws_db_instance.main.availability_zone
}

output "db_instance_hosted_zone_id" {
  description = "RDS instance hosted zone ID"
  value       = aws_db_instance.main.hosted_zone_id
}

output "db_subnet_group_name" {
  description = "DB subnet group name"
  value       = aws_db_subnet_group.main.name
}

output "db_subnet_group_arn" {
  description = "DB subnet group ARN"
  value       = aws_db_subnet_group.main.arn
}

output "db_security_group_id" {
  description = "DB security group ID"
  value       = aws_security_group.rds.id
}

output "db_parameter_group_name" {
  description = "DB parameter group name"
  value       = aws_db_parameter_group.main.name
}

output "database_url_ssm_parameter" {
  description = "SSM parameter name containing database URL"
  value       = aws_ssm_parameter.database_url.name
}
