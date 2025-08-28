# AWS Free Tier Setup Guide 🆓☁️

This guide helps you set up AWS Free Tier monitoring and optimization for the Purchase Tracker infrastructure.

## Table of Contents

- [AWS Account Setup](#aws-account-setup)
- [Free Tier Monitoring](#free-tier-monitoring)
- [Cost Optimization](#cost-optimization)
- [Service Limits](#service-limits)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## AWS Account Setup

### 1. Create AWS Account
```bash
# Visit: https://aws.amazon.com/
# Click "Create AWS Account"
# Follow the registration process
# Verify your email and phone number
# Add payment method (required but won't be charged in free tier)
```

### 2. Enable Billing Alerts
```bash
# In AWS Console, go to: Account > Billing preferences
# Check "Receive Billing Alerts"
# This enables CloudWatch billing metrics
```

### 3. Set Up Budgets
```bash
# Go to: AWS Billing & Cost Management > Budgets
# Create budget with these settings:
# - Budget type: Cost budget
# - Budget amount: $5-10
# - Time period: Monthly
# - Budget scope: All AWS services
# - Alert threshold: 80% of budget amount
```

## Free Tier Monitoring

### 1. Free Tier Dashboard
```bash
# Monitor usage at: https://console.aws.amazon.com/billing/home#/freetier
# Check monthly:
# - EC2 hours used (750 available)
# - RDS hours used (750 available)
# - S3 storage used (5 GB available)
# - Data transfer used (15 GB available)
```

### 2. Service-Specific Monitoring

#### Amazon Cognito
```bash
# Free Tier: 50,000 MAU permanently
# Monitor: Cognito Console > User Pool > Metrics
# Alert: Set up CloudWatch alarm for MAU > 40,000
```

#### Amazon S3
```bash
# Free Tier: 5 GB storage, 20,000 GET, 2,000 PUT requests
# Monitor: S3 Console > Bucket > Metrics
# Commands to check usage:
aws s3api list-objects-v2 --bucket YOUR_BUCKET_NAME --query 'Contents[].Size' --output table
aws s3 ls s3://YOUR_BUCKET_NAME --recursive --human-readable --summarize
```

#### Amazon RDS
```bash
# Free Tier: 750 hours t3.micro/t2.micro, 20 GB storage
# Monitor: RDS Console > Instance > Monitoring
# Alert: CloudWatch alarm for DBConnections > 15
```

#### Amazon Textract
```bash
# Free Tier: 1,000 pages per month
# Monitor: CloudWatch Console > Metrics > AWS/Textract
# No direct console view - monitor via API calls
```

### 3. CloudWatch Billing Alarms
```bash
# Create alarm for total estimated charges
aws cloudwatch put-metric-alarm \
  --alarm-name "BillingAlarm" \
  --alarm-description "Alarm when charges exceed $10" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=Currency,Value=USD \
  --evaluation-periods 1
```

## Cost Optimization

### 1. Resource Right-Sizing
```yaml
# Our infrastructure is optimized for free tier:
RDS:
  instance_class: db.t3.micro  # Free tier eligible
  storage: 20 GB               # Maximum free tier
  multi_az: false              # Not free tier eligible

S3:
  storage_class: INTELLIGENT_TIERING  # Automatic cost optimization
  lifecycle_policies: enabled         # Delete incomplete uploads

Cognito:
  hosted_ui: false            # Use custom UI to avoid domain costs
  custom_domain: false       # Use default domain
```

### 2. Lifecycle Policies
```json
{
  "Rules": [
    {
      "ID": "ReceiptLifecycle",
      "Status": "Enabled",
      "Filter": {"Prefix": "receipts/"},
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

### 3. Usage Monitoring Script
```bash
#!/bin/bash
# Save as: infrastructure/scripts/monitor-usage.sh

echo "🔍 AWS Free Tier Usage Report"
echo "=============================="

# S3 Storage Usage
echo "📦 S3 Storage Usage:"
aws s3 ls --recursive s3://YOUR_BUCKET_NAME | \
  awk '{sum += $3} END {print "Total: " sum/1024/1024/1024 " GB / 5 GB limit"}'

# RDS Instance Hours
echo "🗄️  RDS Usage:"
aws rds describe-db-instances --query 'DBInstances[0].DBInstanceStatus'

# CloudWatch Logs
echo "📊 CloudWatch Logs:"
aws logs describe-log-groups --query 'logGroups[].storedBytes' --output table

# Estimated charges
echo "💰 Estimated Charges:"
aws cloudwatch get-metric-statistics \
  --namespace AWS/Billing \
  --metric-name EstimatedCharges \
  --dimensions Name=Currency,Value=USD \
  --start-time $(date -d '1 day ago' --utc +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date --utc +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Maximum \
  --query 'Datapoints[0].Maximum'
```

## Service Limits

### Free Tier Limits (First 12 Months)
| Service | Limit | Overage Cost |
|---------|-------|--------------|
| **EC2** | 750 hours t2.micro | $0.0116/hour |
| **RDS** | 750 hours t2.micro | $0.017/hour |
| **S3** | 5 GB + 20K GET + 2K PUT | $0.023/GB/month |
| **Data Transfer** | 15 GB out | $0.09/GB |
| **CloudWatch** | 10 metrics + 5 GB logs | $0.30/metric/month |

### Always Free Limits
| Service | Limit | Notes |
|---------|-------|-------|
| **Cognito** | 50,000 MAU | Permanent |
| **Lambda** | 1M requests + 400K GB-sec | Permanent |
| **DynamoDB** | 25 GB + 25 RCU + 25 WCU | Permanent |
| **CloudWatch** | 10 metrics + 1M API requests | Permanent |

## Best Practices

### 1. Resource Tagging
```hcl
# Always tag resources for cost tracking
tags = {
  Environment = "development"
  Project     = "purchase-tracker"
  CostCenter  = "development"
  Owner       = "your-name"
  FreeThreshold = "true"
}
```

### 2. Automated Cleanup
```bash
# Set up automated cleanup for dev/test resources
# Add to crontab: 0 2 * * 0 /path/to/cleanup-dev-resources.sh

#!/bin/bash
# Cleanup old development resources
aws s3 rm s3://YOUR_BUCKET_NAME/test/ --recursive
aws rds stop-db-instance --db-instance-identifier purchase-tracker-dev
```

### 3. Development Best Practices
```bash
# Use local development when possible
export NODE_ENV=development
export USE_LOCAL_DB=true  # Use local PostgreSQL for development

# Only use AWS services for testing integration
export USE_AWS_SERVICES=false  # Toggle AWS vs. mock services
```

## Troubleshooting

### Common Issues

#### 1. Unexpected Charges
```bash
# Check detailed billing
aws ce get-cost-and-usage \
  --time-period Start=2023-01-01,End=2023-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE

# Most common causes:
# - RDS Multi-AZ enabled ($18/month)
# - EBS volumes from terminated instances
# - NAT Gateway usage ($45/month)
# - Data transfer overages
```

#### 2. Free Tier Exhausted
```bash
# Check free tier usage:
aws support describe-cases --include-resolved-cases false

# Solutions:
# 1. Stop non-essential resources
# 2. Delete old snapshots/backups
# 3. Use smaller instance types
# 4. Implement usage monitoring
```

#### 3. Service Limits Reached
```bash
# Request limit increases:
aws service-quotas get-service-quota \
  --service-code ec2 \
  --quota-code L-1216C47A

# For free tier, limits are usually:
# - 20 EC2 instances per region
# - 20 EBS volumes per region
# - 5 VPCs per region
```

### Emergency Cost Control
```bash
# Stop all non-essential resources immediately
aws ec2 stop-instances --instance-ids $(aws ec2 describe-instances --query 'Reservations[].Instances[].InstanceId' --output text)
aws rds stop-db-instance --db-instance-identifier purchase-tracker-dev
aws s3 rm s3://YOUR_BUCKET_NAME/temp/ --recursive
```

## Monitoring Dashboard Setup

### CloudWatch Dashboard
```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          [ "AWS/Billing", "EstimatedCharges", "Currency", "USD" ]
        ],
        "period": 86400,
        "stat": "Maximum",
        "region": "us-east-1",
        "title": "Estimated Charges"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          [ "AWS/S3", "BucketSizeBytes", "BucketName", "YOUR_BUCKET_NAME", "StorageType", "StandardStorage" ]
        ],
        "period": 86400,
        "stat": "Average",
        "region": "us-east-1",
        "title": "S3 Storage Usage"
      }
    }
  ]
}
```

## Summary

✅ **Set up billing alerts** - Know before you're charged  
✅ **Monitor free tier usage** - Stay within limits  
✅ **Use cost-optimized resources** - Right-size everything  
✅ **Implement lifecycle policies** - Automatic cleanup  
✅ **Tag everything** - Track costs by project  
✅ **Regular monitoring** - Weekly usage reviews  

**Target Monthly Cost: $0** (within free tier limits)  
**Maximum Safety Net: $10** (with budget alerts)

---

**Remember:** The AWS Free Tier is generous, but it's easy to accidentally exceed limits. Regular monitoring and proper resource management will keep your costs at zero! 💰✨
