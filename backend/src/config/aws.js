const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

const cognitoConfig = {
  userPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  region: process.env.AWS_COGNITO_REGION || process.env.AWS_REGION || 'us-east-1',
};

const s3Config = {
  ...awsConfig,
  bucketName: process.env.AWS_S3_BUCKET,
};

module.exports = {
  awsConfig,
  cognitoConfig,
  s3Config,
};
