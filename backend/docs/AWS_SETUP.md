# AWS Setup Guide for Purchase Tracker Backend

This guide will help you set up the required AWS services for the Purchase Tracker backend.

## Prerequisites

- AWS Account
- AWS CLI configured (optional but recommended)
- Access to AWS Console

## Step 1: Create AWS Cognito User Pool

### 1.1 Navigate to Cognito
1. Go to AWS Console → Services → Cognito
2. Click "Create User Pool"

### 1.2 Configure Authentication Providers
1. **Provider types**: Select "Cognito user pool"
2. **Sign-in options**: Check "Email"
3. Click "Next"

### 1.3 Configure Security Requirements
1. **Password policy**: Use default or customize as needed
2. **Multi-factor authentication**: Optional (recommended for production)
3. **User account recovery**: Enable email recovery
4. Click "Next"

### 1.4 Configure Sign-up Experience
1. **Self-service sign-up**: Enable
2. **Attribute verification**: Select "Send email message, verify email address"
3. **Required attributes**: 
   - Email (already selected)
   - Given name (optional)
   - Family name (optional)
4. Click "Next"

### 1.5 Configure Message Delivery
1. **Email provider**: Choose "Send email with Cognito" (for development)
2. For production, consider using SES
3. Click "Next"

### 1.6 Integrate Your App
1. **User pool name**: `purchase-tracker-users`
2. **App client name**: `purchase-tracker-app`
3. **Client secret**: **DO NOT generate** (uncheck the box)
4. **Advanced app client settings**:
   - **Authentication flows**: Check "ALLOW_USER_SRP_AUTH"
   - **Token expiration**: 
     - Access token: 1 hour (default)
     - Refresh token: 30 days (default)
5. Click "Next"

### 1.7 Review and Create
1. Review all settings
2. Click "Create user pool"

### 1.8 Note Important Values
After creation, note these values for your `.env` file:
- **User Pool ID**: `us-east-1_xxxxxxxxx`
- **App Client ID**: `xxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Region**: `us-east-1` (or your chosen region)

## Step 2: Create S3 Bucket

### 2.1 Navigate to S3
1. Go to AWS Console → Services → S3
2. Click "Create bucket"

### 2.2 Configure Bucket
1. **Bucket name**: `purchase-tracker-receipts-[your-unique-suffix]`
   - Note: Bucket names must be globally unique
2. **Region**: Choose same region as Cognito
3. **Object Ownership**: ACLs disabled (default)
4. **Block Public Access**: Keep default (block all)
5. **Versioning**: Enable (optional, recommended)
6. **Encryption**: Enable with SSE-S3 (default)
7. Click "Create bucket"

### 2.3 Configure CORS (if needed for direct frontend uploads)
1. Go to bucket → Permissions → CORS
2. Add CORS configuration:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:3000", "your-frontend-domain"],
        "ExposeHeaders": []
    }
]
```

## Step 3: Set Up IAM User/Role

### 3.1 Create IAM User (for development)
1. Go to AWS Console → Services → IAM
2. Click "Users" → "Create user"
3. **User name**: `purchase-tracker-backend`
4. **Access type**: Programmatic access
5. Click "Next"

### 3.2 Attach Policies
Create and attach a custom policy with these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:GetUser",
                "cognito-idp:AdminGetUser"
            ],
            "Resource": "arn:aws:cognito-idp:REGION:ACCOUNT:userpool/USER_POOL_ID"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "textract:DetectDocumentText",
                "textract:AnalyzeDocument"
            ],
            "Resource": "*"
        }
    ]
}
```

### 3.3 Save Credentials
After creating the user, save the:
- **Access Key ID**
- **Secret Access Key**

## Step 4: Update Environment Variables

Update your `.env` file with the AWS values:

```env
# AWS Cognito Configuration
AWS_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_COGNITO_REGION=us-east-1

# AWS Configuration
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## Step 5: Test the Setup

### 5.1 Test Cognito Integration
Create a test user in Cognito console:
1. Go to your User Pool → Users
2. Click "Create user"
3. Fill in email and temporary password
4. Use this user to test authentication in your frontend

### 5.2 Test S3 Integration
The backend will automatically test S3 connectivity when you upload your first receipt.

### 5.3 Test Textract Integration
Textract will be tested when you upload a receipt image.

## Production Considerations

### For Production Deployment:

1. **Use IAM Roles instead of IAM Users**
   - If deploying to EC2, use EC2 instance roles
   - If using containers, use task roles
   - If using Lambda, use Lambda execution roles

2. **Separate Environments**
   - Create separate User Pools for dev/staging/prod
   - Use separate S3 buckets for each environment
   - Consider bucket naming: `purchase-tracker-receipts-prod`

3. **Enhanced Security**
   - Enable MFA in Cognito for production
   - Use SES for email delivery in production
   - Set up proper S3 bucket policies
   - Enable CloudTrail for auditing

4. **Monitoring**
   - Enable CloudWatch logging
   - Set up CloudWatch alarms
   - Monitor Textract usage and costs

## Troubleshooting

### Common Issues:

1. **"Invalid token" errors**
   - Verify User Pool ID and Client ID are correct
   - Ensure the JWT token is valid and not expired

2. **S3 access denied**
   - Check IAM permissions
   - Verify bucket name is correct
   - Ensure region matches

3. **Textract errors**
   - Verify service is available in your region
   - Check file format is supported (JPEG, PNG, PDF)
   - Ensure file size is within limits

4. **CORS issues**
   - Update S3 CORS configuration
   - Check frontend domain is allowed

## Cost Optimization

- **Cognito**: Free tier includes 50,000 MAUs
- **S3**: Use Intelligent Tiering for receipt storage
- **Textract**: Monitor usage as it can be costly with high volume
- **Consider**: Implement image compression before Textract processing

## Security Best Practices

1. **Rotate IAM keys regularly**
2. **Use least privilege principle**
3. **Enable CloudTrail for auditing**
4. **Monitor unusual activity**
5. **Keep dependencies updated**
6. **Use HTTPS everywhere**

This completes the AWS setup for your Purchase Tracker backend!
