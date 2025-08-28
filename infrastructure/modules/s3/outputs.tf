output "bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.receipts.bucket
}

output "bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.receipts.arn
}

output "bucket_id" {
  description = "S3 bucket ID"
  value       = aws_s3_bucket.receipts.id
}

output "bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = aws_s3_bucket.receipts.bucket_domain_name
}

output "bucket_regional_domain_name" {
  description = "S3 bucket regional domain name"
  value       = aws_s3_bucket.receipts.bucket_regional_domain_name
}

output "bucket_hosted_zone_id" {
  description = "S3 bucket hosted zone ID"
  value       = aws_s3_bucket.receipts.hosted_zone_id
}

output "bucket_region" {
  description = "S3 bucket region"
  value       = aws_s3_bucket.receipts.region
}
