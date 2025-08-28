const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Config } = require('../config/aws');

class S3Service {
  constructor() {
    this.s3Client = new S3Client(s3Config);
    this.bucketName = s3Config.bucketName;
  }

  async uploadFile(file, key) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    });

    await this.s3Client.send(command);
    return `https://${this.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;
  }

  async getSignedUrl(key, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async deleteFile(key) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await this.s3Client.send(command);
  }

  generateFileKey(userId, originalName) {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `receipts/${userId}/${timestamp}_${sanitizedName}`;
  }

  extractKeyFromUrl(url) {
    // Extract S3 key from S3 URL
    const urlParts = url.split('/');
    return urlParts.slice(3).join('/'); // Remove https://bucket.s3.region.amazonaws.com/
  }
}

module.exports = new S3Service();
