output "users_table_name" {
  description = "Name of the users DynamoDB table"
  value       = aws_dynamodb_table.users.name
}

output "users_table_arn" {
  description = "ARN of the users DynamoDB table"
  value       = aws_dynamodb_table.users.arn
}

output "receipts_table_name" {
  description = "Name of the receipts DynamoDB table"
  value       = aws_dynamodb_table.receipts.name
}

output "receipts_table_arn" {
  description = "ARN of the receipts DynamoDB table"
  value       = aws_dynamodb_table.receipts.arn
}

output "purchases_table_name" {
  description = "Name of the purchases DynamoDB table"
  value       = aws_dynamodb_table.purchases.name
}

output "purchases_table_arn" {
  description = "ARN of the purchases DynamoDB table"
  value       = aws_dynamodb_table.purchases.arn
}

output "table_arns" {
  description = "List of all table ARNs for IAM policies"
  value = [
    aws_dynamodb_table.users.arn,
    aws_dynamodb_table.receipts.arn,
    aws_dynamodb_table.purchases.arn,
    "${aws_dynamodb_table.users.arn}/index/*",
    "${aws_dynamodb_table.receipts.arn}/index/*",
    "${aws_dynamodb_table.purchases.arn}/index/*"
  ]
}
