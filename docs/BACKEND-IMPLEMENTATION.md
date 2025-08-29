# Backend Implementation Guide

## Overview

This    ├─   ├── services/
   │   ├── cognitoService.js
   │   ├── s3Service.js
   │   ├── textractService.js
   │   ├── dynamoDBService.js
   │   └── emailService.js
   ├── utils/
   │   ├── logger.js
   │   ├── validators.js
   │   └── helpers.js
   ├── config/
   │   ├── dynamodb.js
   │   ├── aws.js
   │   └── config.js   │   ├── cognitoService.js
   │   ├── s3Service.js
   │   ├── textractService.js
   │   ├── dynamoDBService.js
   │   └── emailService.jsent outlines the implementation of a Node.js backend service for the Purchase Tracker application. The backend will provide REST API endpoints for user authentication, receipt processing, and purchase management with integrations to AWS S3, Amazon Textract, and a database.

## Architecture

```
Frontend (React Native) 
    ↓ HTTP/REST API (with Cognito JWT tokens)
Backend (Node.js/Express)
    ↓
├── AWS Cognito (Authentication & User Management)
├── File Upload Service (AWS S3)
├── OCR Service (Amazon Textract)
└── Database Service (Amazon DynamoDB)
```

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Authentication**: AWS Cognito (managed authentication service)
- **Database**: Amazon DynamoDB (NoSQL, perfect for variable receipt data)
- **Cloud Services**: AWS S3, Amazon Textract, AWS Cognito, DynamoDB
- **File Upload**: Multer
- **Validation**: Joi or Zod
- **Security**: Helmet, CORS
- **Environment**: dotenv
- **Testing**: Jest, Supertest

## Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── purchaseController.js
│   │   ├── receiptController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── cognitoAuth.js
│   │   ├── upload.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Purchase.js
│   │   └── Receipt.js
│   ├── routes/
│   │   ├── purchases.js
│   │   ├── receipts.js
│   │   └── users.js
│   ├── services/
│   │   ├── cognitoService.js
│   │   ├── s3Service.js
│   │   ├── textractService.js
│   │   └── emailService.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── config/
│   │   ├── database.js
│   │   ├── aws.js
│   │   └── config.js
│   └── app.js
├── tests/
├── docs/
├── package.json
├── .env.example
└── README.md
```

## Implementation Steps

### Phase 1: Project Setup and Basic Structure

1. **Initialize Node.js Project**
   ```bash
   mkdir backend
   cd backend
   npm init -y
   ```

2. **Install Dependencies**
   ```bash
   # Core dependencies
   npm install express cors helmet morgan
   npm install dotenv joi multer
   npm install @aws-sdk/client-s3 @aws-sdk/client-textract @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
   npm install aws-jwt-verify jsonwebtoken
   
   # Development dependencies
   npm install -D nodemon jest supertest eslint prettier
   ```

3. **Environment Configuration**
   Create `.env.example` and `.env` files:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # AWS Cognito Configuration
   AWS_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
   AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
   AWS_COGNITO_REGION=us-east-1
   
   # AWS Configuration
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=purchase-tracker-receipts
   
   # DynamoDB Configuration
   DYNAMODB_TABLE_PREFIX=purchase-tracker
   
   # Email Configuration (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

### Phase 2: DynamoDB Setup

DynamoDB is perfect for this use case because:
- Receipts have variable structures (restaurant vs retail vs gas station)
- No complex relationships needed
- Excellent for storing JSON documents with OCR data
- Scales automatically
- Free tier: 25 GB storage, 25 read/write capacity units

1. **DynamoDB Service** (`src/services/dynamoDBService.js`):
   ```javascript
   const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
   const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
   
   class DynamoDBService {
     constructor() {
       const client = new DynamoDBClient({
         region: process.env.AWS_REGION,
         credentials: {
           accessKeyId: process.env.AWS_ACCESS_KEY_ID,
           secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
         },
       });
       
       this.docClient = DynamoDBDocumentClient.from(client);
       this.tablePrefix = process.env.DYNAMODB_TABLE_PREFIX || 'purchase-tracker';
     }
   
     getTableName(entityType) {
       return `${this.tablePrefix}-${entityType}`;
     }
   
     async put(tableName, item) {
       const command = new PutCommand({
         TableName: tableName,
         Item: item,
       });
       return await this.docClient.send(command);
     }
   
     async get(tableName, key) {
       const command = new GetCommand({
         TableName: tableName,
         Key: key,
       });
       const result = await this.docClient.send(command);
       return result.Item;
     }
   
     async update(tableName, key, updateExpression, attributeValues) {
       const command = new UpdateCommand({
         TableName: tableName,
         Key: key,
         UpdateExpression: updateExpression,
         ExpressionAttributeValues: attributeValues,
         ReturnValues: 'ALL_NEW',
       });
       const result = await this.docClient.send(command);
       return result.Attributes;
     }
   
     async delete(tableName, key) {
       const command = new DeleteCommand({
         TableName: tableName,
         Key: key,
       });
       return await this.docClient.send(command);
     }
   
     async queryByUserId(tableName, userId) {
       const command = new QueryCommand({
         TableName: tableName,
         IndexName: 'UserIdIndex',
         KeyConditionExpression: 'userId = :userId',
         ExpressionAttributeValues: {
           ':userId': userId,
         },
         ScanIndexForward: false, // Sort by sort key descending
       });
       const result = await this.docClient.send(command);
       return result.Items || [];
     }
   }
   
   module.exports = new DynamoDBService();
   ```

2. **DynamoDB Models** (`src/models/`):

   **User Model** (`src/models/User.js`):
   ```javascript
   const dynamoDBService = require('../services/dynamoDBService');
   const { v4: uuidv4 } = require('uuid');
   
   class User {
     constructor(data) {
       this.id = data.id || uuidv4();
       this.cognitoId = data.cognitoId;
       this.email = data.email;
       this.firstName = data.firstName;
       this.lastName = data.lastName;
       this.createdAt = data.createdAt || new Date().toISOString();
       this.updatedAt = data.updatedAt || new Date().toISOString();
     }
   
     static get tableName() {
       return dynamoDBService.getTableName('users');
     }
   
     async save() {
       this.updatedAt = new Date().toISOString();
       await dynamoDBService.put(User.tableName, this.toJSON());
       return this;
     }
   
     static async findByCognitoId(cognitoId) {
       const item = await dynamoDBService.get(User.tableName, { cognitoId });
       return item ? new User(item) : null;
     }
   
     static async findById(id) {
       const item = await dynamoDBService.get(User.tableName, { id });
       return item ? new User(item) : null;
     }
   
     async update(data) {
       const updateExpression = [];
       const attributeValues = {};
       
       Object.keys(data).forEach(key => {
         if (key !== 'id' && key !== 'cognitoId') {
           updateExpression.push(`${key} = :${key}`);
           attributeValues[`:${key}`] = data[key];
         }
       });
       
       attributeValues[':updatedAt'] = new Date().toISOString();
       updateExpression.push('updatedAt = :updatedAt');
       
       const result = await dynamoDBService.update(
         User.tableName,
         { id: this.id },
         `SET ${updateExpression.join(', ')}`,
         attributeValues
       );
       
       Object.assign(this, result);
       return this;
     }
   
     toJSON() {
       return {
         id: this.id,
         cognitoId: this.cognitoId,
         email: this.email,
         firstName: this.firstName,
         lastName: this.lastName,
         createdAt: this.createdAt,
         updatedAt: this.updatedAt,
       };
     }
   }
   
   module.exports = User;
   ```

   **Receipt Model** (`src/models/Receipt.js`):
   ```javascript
   const dynamoDBService = require('../services/dynamoDBService');
   const { v4: uuidv4 } = require('uuid');
   
   class Receipt {
     constructor(data) {
       this.id = data.id || uuidv4();
       this.userId = data.userId;
       this.originalName = data.originalName;
       this.s3Key = data.s3Key;
       this.s3Url = data.s3Url;
       this.textractData = data.textractData || null;
       this.processed = data.processed || false;
       this.merchantName = data.merchantName || null;
       this.totalAmount = data.totalAmount || null;
       this.receiptDate = data.receiptDate || null;
       this.items = data.items || [];
       this.confidence = data.confidence || null;
       this.createdAt = data.createdAt || new Date().toISOString();
       this.updatedAt = data.updatedAt || new Date().toISOString();
     }
   
     static get tableName() {
       return dynamoDBService.getTableName('receipts');
     }
   
     async save() {
       this.updatedAt = new Date().toISOString();
       await dynamoDBService.put(Receipt.tableName, this.toJSON());
       return this;
     }
   
     static async findById(id) {
       const item = await dynamoDBService.get(Receipt.tableName, { id });
       return item ? new Receipt(item) : null;
     }
   
     static async findByUserId(userId) {
       return await dynamoDBService.queryByUserId(Receipt.tableName, userId);
     }
   
     async update(data) {
       const updateExpression = [];
       const attributeValues = {};
       
       Object.keys(data).forEach(key => {
         if (key !== 'id') {
           updateExpression.push(`${key} = :${key}`);
           attributeValues[`:${key}`] = data[key];
         }
       });
       
       attributeValues[':updatedAt'] = new Date().toISOString();
       updateExpression.push('updatedAt = :updatedAt');
       
       const result = await dynamoDBService.update(
         Receipt.tableName,
         { id: this.id },
         `SET ${updateExpression.join(', ')}`,
         attributeValues
       );
       
       Object.assign(this, result);
       return this;
     }
   
     async delete() {
       return await dynamoDBService.delete(Receipt.tableName, { id: this.id });
     }
   
     toJSON() {
       return {
         id: this.id,
         userId: this.userId,
         originalName: this.originalName,
         s3Key: this.s3Key,
         s3Url: this.s3Url,
         textractData: this.textractData,
         processed: this.processed,
         merchantName: this.merchantName,
         totalAmount: this.totalAmount,
         receiptDate: this.receiptDate,
         items: this.items,
         confidence: this.confidence,
         createdAt: this.createdAt,
         updatedAt: this.updatedAt,
       };
     }
   }
   
   module.exports = Receipt;
   ```

   **Purchase Model** (`src/models/Purchase.js`):
   ```javascript
   const dynamoDBService = require('../services/dynamoDBService');
   const { v4: uuidv4 } = require('uuid');
   
   class Purchase {
     constructor(data) {
       this.id = data.id || uuidv4();
       this.userId = data.userId;
       this.title = data.title;
       this.amount = data.amount;
       this.currency = data.currency || 'USD';
       this.category = data.category || null;
       this.description = data.description || null;
       this.purchaseDate = data.purchaseDate;
       this.receiptId = data.receiptId || null;
       this.tags = data.tags || [];
       this.location = data.location || null;
       this.paymentMethod = data.paymentMethod || null;
       this.createdAt = data.createdAt || new Date().toISOString();
       this.updatedAt = data.updatedAt || new Date().toISOString();
     }
   
     static get tableName() {
       return dynamoDBService.getTableName('purchases');
     }
   
     async save() {
       this.updatedAt = new Date().toISOString();
       await dynamoDBService.put(Purchase.tableName, this.toJSON());
       return this;
     }
   
     static async findById(id) {
       const item = await dynamoDBService.get(Purchase.tableName, { id });
       return item ? new Purchase(item) : null;
     }
   
     static async findByUserId(userId) {
       return await dynamoDBService.queryByUserId(Purchase.tableName, userId);
     }
   
     async update(data) {
       const updateExpression = [];
       const attributeValues = {};
       
       Object.keys(data).forEach(key => {
         if (key !== 'id') {
           updateExpression.push(`${key} = :${key}`);
           attributeValues[`:${key}`] = data[key];
         }
       });
       
       attributeValues[':updatedAt'] = new Date().toISOString();
       updateExpression.push('updatedAt = :updatedAt');
       
       const result = await dynamoDBService.update(
         Purchase.tableName,
         { id: this.id },
         `SET ${updateExpression.join(', ')}`,
         attributeValues
       );
       
       Object.assign(this, result);
       return this;
     }
   
     async delete() {
       return await dynamoDBService.delete(Purchase.tableName, { id: this.id });
     }
   
     toJSON() {
       return {
         id: this.id,
         userId: this.userId,
         title: this.title,
         amount: this.amount,
         currency: this.currency,
         category: this.category,
         description: this.description,
         purchaseDate: this.purchaseDate,
         receiptId: this.receiptId,
         tags: this.tags,
         location: this.location,
         paymentMethod: this.paymentMethod,
         createdAt: this.createdAt,
         updatedAt: this.updatedAt,
       };
     }
   }
   
   module.exports = Purchase;
   ```

**Why DynamoDB is Perfect for This:**
- **Variable Receipt Structures**: Every store has different receipt formats
- **No Complex Joins**: We rarely need to join data across tables
- **JSON Storage**: Perfect for storing Textract OCR results
- **Automatic Scaling**: Handles traffic spikes without configuration
- **Cost Effective**: 25 GB free tier, then pay only for what you use

### Phase 3: AWS Cognito Integration

1. **Cognito Service** (`src/services/cognitoService.js`):
   ```javascript
   const { CognitoJwtVerifier } = require('aws-jwt-verify');
   const User = require('../models/User');
   
   class CognitoService {
     constructor() {
       this.verifier = CognitoJwtVerifier.create({
         userPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
         tokenUse: 'access',
         clientId: process.env.AWS_COGNITO_CLIENT_ID,
       });
     }
   
     async verifyToken(token) {
       try {
         const payload = await this.verifier.verify(token);
         return payload;
       } catch (error) {
         throw new Error('Invalid token');
       }
     }
   
     async getOrCreateUser(cognitoPayload) {
       const { sub: cognitoId, email, given_name, family_name } = cognitoPayload;
       
       let user = await User.findByCognitoId(cognitoId);
   
       if (!user) {
         user = new User({
           cognitoId,
           email,
           firstName: given_name || null,
           lastName: family_name || null,
         });
         await user.save();
       }
   
       return user;
     }
   
     async getUserByCognitoId(cognitoId) {
       return await User.findByCognitoId(cognitoId);
     }
   }
   
   module.exports = new CognitoService();
   ```

2. **Cognito Auth Middleware** (`src/middleware/cognitoAuth.js`):
   ```javascript
   const cognitoService = require('../services/cognitoService');
   
   const cognitoAuth = async (req, res, next) => {
     try {
       const authHeader = req.header('Authorization');
       
       if (!authHeader || !authHeader.startsWith('Bearer ')) {
         return res.status(401).json({ error: 'Access denied. No token provided.' });
       }
   
       const token = authHeader.replace('Bearer ', '');
       
       // Verify token with Cognito
       const cognitoPayload = await cognitoService.verifyToken(token);
       
       // Get or create user in our database
       const user = await cognitoService.getOrCreateUser(cognitoPayload);
       
       if (!user) {
         return res.status(401).json({ error: 'User not found.' });
       }
       
       req.user = user;
       req.cognitoPayload = cognitoPayload;
       next();
     } catch (error) {
       console.error('Auth error:', error);
       res.status(401).json({ error: 'Invalid token.' });
     }
   };
   
   module.exports = cognitoAuth;
   ```

### Phase 4: AWS S3 Integration

1. **S3 Service** (`src/services/s3Service.js`):
   ```javascript
   const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
   const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
   
   class S3Service {
     constructor() {
       this.s3Client = new S3Client({
         region: process.env.AWS_REGION,
         credentials: {
           accessKeyId: process.env.AWS_ACCESS_KEY_ID,
           secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
         },
       });
       this.bucketName = process.env.AWS_S3_BUCKET;
     }
   
     async uploadFile(file, key) {
       const command = new PutObjectCommand({
         Bucket: this.bucketName,
         Key: key,
         Body: file.buffer,
         ContentType: file.mimetype,
       });
   
       await this.s3Client.send(command);
       return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
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
       return `receipts/${userId}/${timestamp}.${extension}`;
     }
   }
   
   module.exports = new S3Service();
   ```

### Phase 5: Amazon Textract Integration

1. **Textract Service** (`src/services/textractService.js`):
   ```javascript
   const { TextractClient, DetectDocumentTextCommand, AnalyzeDocumentCommand } = require('@aws-sdk/client-textract');
   
   class TextractService {
     constructor() {
       this.textractClient = new TextractClient({
         region: process.env.AWS_REGION,
         credentials: {
           accessKeyId: process.env.AWS_ACCESS_KEY_ID,
           secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
         },
       });
     }
   
     async extractText(s3Key) {
       const command = new DetectDocumentTextCommand({
         Document: {
           S3Object: {
             Bucket: process.env.AWS_S3_BUCKET,
             Name: s3Key,
           },
         },
       });
   
       const response = await this.textractClient.send(command);
       return this.parseTextractResponse(response);
     }
   
     async analyzeExpense(s3Key) {
       const command = new AnalyzeDocumentCommand({
         Document: {
           S3Object: {
             Bucket: process.env.AWS_S3_BUCKET,
             Name: s3Key,
           },
         },
         FeatureTypes: ['FORMS', 'TABLES'],
       });
   
       const response = await this.textractClient.send(command);
       return this.parseExpenseData(response);
     }
   
     parseTextractResponse(response) {
       const lines = response.Blocks
         .filter(block => block.BlockType === 'LINE')
         .map(block => block.Text);
   
       return {
         fullText: lines.join('\n'),
         lines: lines,
       };
     }
   
     parseExpenseData(response) {
       // Extract key-value pairs and tables
       const keyValuePairs = {};
       const tables = [];
   
       // Process form data
       const formBlocks = response.Blocks.filter(block => block.BlockType === 'KEY_VALUE_SET');
       
       // Extract amounts, dates, merchant names, etc.
       const extractedData = {
         merchantName: this.extractMerchantName(response.Blocks),
         totalAmount: this.extractTotalAmount(response.Blocks),
         date: this.extractDate(response.Blocks),
         items: this.extractItems(response.Blocks),
       };
   
       return extractedData;
     }
   
     extractMerchantName(blocks) {
       // Implementation to extract merchant name
       // This would involve pattern matching and heuristics
       return null;
     }
   
     extractTotalAmount(blocks) {
       // Implementation to extract total amount
       // Look for patterns like "Total: $XX.XX"
       return null;
     }
   
     extractDate(blocks) {
       // Implementation to extract date
       // Look for date patterns
       return null;
     }
   
     extractItems(blocks) {
       // Implementation to extract line items
       return [];
     }
   }
   
   module.exports = new TextractService();
   ```

### Phase 6: API Routes and Controllers

1. **Receipt Controller** (`src/controllers/receiptController.js`):
   ```javascript
   const s3Service = require('../services/s3Service');
   const textractService = require('../services/textractService');
   const Receipt = require('../models/Receipt');
   
   class ReceiptController {
     async uploadReceipt(req, res) {
       try {
         if (!req.file) {
           return res.status(400).json({ error: 'No file uploaded' });
         }
   
         const userId = req.user.id;
         const s3Key = s3Service.generateFileKey(userId, req.file.originalname);
         
         // Upload to S3
         const s3Url = await s3Service.uploadFile(req.file, s3Key);
         
         // Save receipt record
         const receipt = new Receipt({
           originalName: req.file.originalname,
           s3Key,
           s3Url,
           userId,
         });
         
         await receipt.save();
   
         // Process with Textract (async)
         this.processReceiptAsync(receipt.id, s3Key);
   
         res.status(201).json({
           message: 'Receipt uploaded successfully',
           receipt: receipt.toJSON(),
         });
       } catch (error) {
         res.status(500).json({ error: error.message });
       }
     }
   
     async processReceiptAsync(receiptId, s3Key) {
       try {
         const textractData = await textractService.analyzeExpense(s3Key);
         
         const receipt = await Receipt.findById(receiptId);
         if (receipt) {
           await receipt.update({
             textractData,
             processed: true,
             merchantName: textractData.merchantName,
             totalAmount: textractData.totalAmount,
             receiptDate: textractData.date,
             items: textractData.items,
             confidence: textractData.confidence,
           });
         }
       } catch (error) {
         console.error('Error processing receipt:', error);
       }
     }
   
     async getReceipts(req, res) {
       try {
         const userId = req.user.id;
         const receipts = await Receipt.findByUserId(userId);
   
         res.json(receipts);
       } catch (error) {
         res.status(500).json({ error: error.message });
       }
     }
   
     async getReceiptById(req, res) {
       try {
         const { id } = req.params;
         const userId = req.user.id;
   
         const receipt = await Receipt.findById(id);
   
         if (!receipt || receipt.userId !== userId) {
           return res.status(404).json({ error: 'Receipt not found' });
         }
   
         res.json(receipt.toJSON());
       } catch (error) {
         res.status(500).json({ error: error.message });
       }
     }
     
     async deleteReceipt(req, res) {
       try {
         const { id } = req.params;
         const userId = req.user.id;
   
         const receipt = await Receipt.findById(id);
   
         if (!receipt || receipt.userId !== userId) {
           return res.status(404).json({ error: 'Receipt not found' });
         }
   
         // Delete from S3
         await s3Service.deleteFile(receipt.s3Key);
         
         // Delete from DynamoDB
         await receipt.delete();
   
         res.json({ message: 'Receipt deleted successfully' });
       } catch (error) {
         res.status(500).json({ error: error.message });
       }
     }
   }
   
   module.exports = new ReceiptController();
   ```

### Phase 7: File Upload Middleware

1. **Upload Middleware** (`src/middleware/upload.js`):
   ```javascript
   const multer = require('multer');
   
   // Configure multer for memory storage
   const storage = multer.memoryStorage();
   
   const fileFilter = (req, file, cb) => {
     // Accept images only
     if (file.mimetype.startsWith('image/')) {
       cb(null, true);
     } else {
       cb(new Error('Only image files are allowed'), false);
     }
   };
   
   const upload = multer({
     storage,
     fileFilter,
     limits: {
       fileSize: 10 * 1024 * 1024, // 10MB limit
     },
   });
   
   module.exports = upload;
   ```

### Phase 8: API Routes

1. **Receipt Routes** (`src/routes/receipts.js`):
   ```javascript
   const express = require('express');
   const receiptController = require('../controllers/receiptController');
   const cognitoAuth = require('../middleware/cognitoAuth');
   const upload = require('../middleware/upload');
   
   const router = express.Router();
   
   router.post('/upload', cognitoAuth, upload.single('receipt'), receiptController.uploadReceipt);
   router.get('/', cognitoAuth, receiptController.getReceipts);
   router.get('/:id', cognitoAuth, receiptController.getReceiptById);
   router.delete('/:id', cognitoAuth, receiptController.deleteReceipt);
   
   module.exports = router;
   ```

2. **Purchase Routes** (`src/routes/purchases.js`):
   ```javascript
   const express = require('express');
   const Purchase = require('../models/Purchase');
   const cognitoAuth = require('../middleware/cognitoAuth');
   
   const router = express.Router();
   
   // Get all purchases for authenticated user
   router.get('/', cognitoAuth, async (req, res) => {
     try {
       const purchases = await Purchase.findByUserId(req.user.id);
       res.json(purchases);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   
   // Create new purchase
   router.post('/', cognitoAuth, async (req, res) => {
     try {
       const purchase = new Purchase({
         ...req.body,
         userId: req.user.id,
       });
       await purchase.save();
       res.status(201).json(purchase.toJSON());
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   
   // Get specific purchase
   router.get('/:id', cognitoAuth, async (req, res) => {
     try {
       const purchase = await Purchase.findById(req.params.id);
       if (!purchase || purchase.userId !== req.user.id) {
         return res.status(404).json({ error: 'Purchase not found' });
       }
       res.json(purchase.toJSON());
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   
   // Update purchase
   router.put('/:id', cognitoAuth, async (req, res) => {
     try {
       const purchase = await Purchase.findById(req.params.id);
       if (!purchase || purchase.userId !== req.user.id) {
         return res.status(404).json({ error: 'Purchase not found' });
       }
       
       await purchase.update(req.body);
       res.json(purchase.toJSON());
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   
   // Delete purchase
   router.delete('/:id', cognitoAuth, async (req, res) => {
     try {
       const purchase = await Purchase.findById(req.params.id);
       if (!purchase || purchase.userId !== req.user.id) {
         return res.status(404).json({ error: 'Purchase not found' });
       }
       
       await purchase.delete();
       res.json({ message: 'Purchase deleted successfully' });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   
   module.exports = router;
   ```

3. **User Routes** (`src/routes/users.js`):
   ```javascript
   const express = require('express');
   const User = require('../models/User');
   const Receipt = require('../models/Receipt');
   const Purchase = require('../models/Purchase');
   const cognitoAuth = require('../middleware/cognitoAuth');
   
   const router = express.Router();
   
   // Get user profile
   router.get('/profile', cognitoAuth, async (req, res) => {
     try {
       res.json(req.user.toJSON());
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   
   // Update user profile
   router.put('/profile', cognitoAuth, async (req, res) => {
     try {
       const { firstName, lastName } = req.body;
       await req.user.update({ firstName, lastName });
       res.json(req.user.toJSON());
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   
   // Get dashboard summary
   router.get('/dashboard', cognitoAuth, async (req, res) => {
     try {
       const [receipts, purchases] = await Promise.all([
         Receipt.findByUserId(req.user.id),
         Purchase.findByUserId(req.user.id),
       ]);
   
       const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
       const recentReceipts = receipts.slice(0, 5);
       const recentPurchases = purchases.slice(0, 5);
   
       res.json({
         summary: {
           totalReceipts: receipts.length,
           totalPurchases: purchases.length,
           totalSpent,
           processedReceipts: receipts.filter(r => r.processed).length,
         },
         recentReceipts,
         recentPurchases,
       });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   
   module.exports = router;
   ```

### Phase 9: Main Application File

1. **App.js** (`src/app.js`):
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const helmet = require('helmet');
   const morgan = require('morgan');
   require('dotenv').config();
   
   const receiptRoutes = require('./routes/receipts');
   const purchaseRoutes = require('./routes/purchases');
   const userRoutes = require('./routes/users');
   const errorHandler = require('./middleware/errorHandler');
   
   const app = express();
   
   // Middleware
   app.use(helmet());
   app.use(cors({
     origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
     credentials: true,
   }));
   app.use(morgan('combined'));
   app.use(express.json({ limit: '50mb' }));
   app.use(express.urlencoded({ extended: true, limit: '50mb' }));
   
   // Routes
   app.use('/api/receipts', receiptRoutes);
   app.use('/api/purchases', purchaseRoutes);
   app.use('/api/users', userRoutes);
   
   // Health check
   app.get('/health', (req, res) => {
     res.json({ 
       status: 'OK', 
       timestamp: new Date().toISOString(),
       version: process.env.npm_package_version || '1.0.0',
       environment: process.env.NODE_ENV || 'development',
     });
   });
   
   // Root endpoint
   app.get('/', (req, res) => {
     res.json({
       message: 'Purchase Tracker API',
       version: process.env.npm_package_version || '1.0.0',
       endpoints: {
         health: '/health',
         receipts: '/api/receipts',
         purchases: '/api/purchases',
         users: '/api/users',
       },
     });
   });
   
   // 404 handler
   app.use('*', (req, res) => {
     res.status(404).json({
       error: 'Endpoint not found',
       path: req.originalUrl,
       method: req.method,
     });
   });
   
   // Error handling
   app.use(errorHandler);
   
   const PORT = process.env.PORT || 3000;
   
   if (process.env.NODE_ENV !== 'test') {
     app.listen(PORT, () => {
       console.log(`🚀 Server running on port ${PORT}`);
       console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
       console.log(`🔗 Health check: http://localhost:${PORT}/health`);
     });
   }
   
   module.exports = app;
   ```

2. **Package.json Scripts**:
   ```json
   {
     "name": "purchase-tracker-backend",
     "version": "1.0.0",
     "description": "Backend API for Purchase Tracker application",
     "main": "src/app.js",
     "scripts": {
       "start": "node src/app.js",
       "dev": "nodemon src/app.js",
       "test": "jest",
       "test:watch": "jest --watch",
       "test:coverage": "jest --coverage",
       "lint": "eslint src/",
       "lint:fix": "eslint src/ --fix",
       "format": "prettier --write src/"
     },
     "dependencies": {
       "express": "^4.18.2",
       "cors": "^2.8.5",
       "helmet": "^7.0.0",
       "morgan": "^1.10.0",
       "dotenv": "^16.3.1",
       "joi": "^17.9.2",
       "multer": "^1.4.5-lts.1",
       "@aws-sdk/client-s3": "^3.400.0",
       "@aws-sdk/client-textract": "^3.400.0",
       "@aws-sdk/client-dynamodb": "^3.400.0",
       "@aws-sdk/lib-dynamodb": "^3.400.0",
       "@aws-sdk/s3-request-presigner": "^3.400.0",
       "aws-jwt-verify": "^4.0.1",
       "uuid": "^9.0.0"
     },
     "devDependencies": {
       "nodemon": "^3.0.1",
       "jest": "^29.6.2",
       "supertest": "^6.3.3",
       "eslint": "^8.45.0",
       "prettier": "^3.0.0"
     }
   }
   ```

## API Endpoints

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Receipts
- `POST /api/receipts/upload` - Upload receipt image
- `GET /api/receipts` - Get user's receipts
- `GET /api/receipts/:id` - Get specific receipt

### Purchases
- `GET /api/purchases` - Get user's purchases
- `POST /api/purchases` - Create new purchase
- `PUT /api/purchases/:id` - Update purchase
- `DELETE /api/purchases/:id` - Delete purchase

**Note**: All endpoints require AWS Cognito JWT token in Authorization header

## Security Considerations

1. **Authentication**: AWS Cognito handles user authentication and JWT token management
2. **Authorization**: Middleware validates Cognito JWT tokens and extracts user information
3. **File Upload**: Validate file types and sizes
4. **Input Validation**: Use Joi/Zod for request validation
5. **Rate Limiting**: Implement rate limiting for API endpoints
6. **CORS**: Configure CORS properly for production
7. **Environment Variables**: Keep sensitive data in environment variables
8. **Database**: Use parameterized queries to prevent SQL injection
9. **AWS IAM**: Properly configure IAM roles and policies for S3 and Textract access

## AWS Cognito Setup Guide

### 1. Create Cognito User Pool

1. **Go to AWS Cognito Console**
2. **Create User Pool**:
   - Pool name: `purchase-tracker-users`
   - Provider types: `Cognito user pool`
   - Username configuration: `Email`
   - Password policy: Set according to your requirements
   - MFA: Optional (recommended for production)
   - Email configuration: Use Cognito default or configure SES

3. **App Client Configuration**:
   - App client name: `purchase-tracker-app`
   - Client secret: `Don't generate` (for mobile apps)
   - Auth flows: Enable `ALLOW_USER_SRP_AUTH`
   - Token expiration: Configure as needed (default: 1 hour access, 30 days refresh)

4. **Domain Configuration** (optional):
   - Set up a custom domain for hosted UI

### 2. Frontend Integration

The React Native app will need to integrate with Cognito using AWS Amplify or AWS SDK:

```javascript
// Example frontend integration
import { Auth } from 'aws-amplify';

// Configure Amplify
Auth.configure({
  region: 'us-east-1',
  userPoolId: 'us-east-1_xxxxxxxxx',
  userPoolWebClientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
});

// Sign up
const signUp = async (email, password) => {
  try {
    const { user } = await Auth.signUp({
      username: email,
      password,
      attributes: { email }
    });
    return user;
  } catch (error) {
    console.error('Error signing up:', error);
  }
};

// Sign in
const signIn = async (email, password) => {
  try {
    const user = await Auth.signIn(email, password);
    return user;
  } catch (error) {
    console.error('Error signing in:', error);
  }
};

// Get current session
const getCurrentSession = async () => {
  try {
    const session = await Auth.currentSession();
    return session.getAccessToken().getJwtToken();
  } catch (error) {
    console.error('No current session:', error);
  }
};
```

## Implementation Steps (Updated)

1. **Set up AWS Cognito User Pool** (as described above)
2. **Configure backend with Cognito JWT verification**
3. **Implement Cognito middleware for route protection**
4. **Set up S3 and Textract services**
5. **Configure database and models**
6. **Implement API endpoints**
7. **Test with Cognito tokens**
8. **Deploy to staging environment**

## Testing Strategy

1. **Unit Tests**: Test individual functions and services
2. **Integration Tests**: Test API endpoints with Cognito tokens
3. **Security Tests**: Test Cognito token validation and authorization
4. **Performance Tests**: Test file upload and processing performance

## Deployment Considerations

1. **Environment Setup**: Production, staging, development environments
2. **Database**: Use managed database services (AWS RDS, MongoDB Atlas)
3. **File Storage**: Configure S3 bucket policies and IAM roles
4. **Cognito**: Set up separate User Pools for different environments
5. **Monitoring**: Implement logging and monitoring (CloudWatch, DataDog)
6. **CI/CD**: Set up automated deployment pipeline
7. **Load Balancing**: Use load balancers for high availability

## Next Steps

1. Set up AWS Cognito User Pool and configure app client
2. Set up the project structure and install dependencies
3. Configure database and run migrations
4. Implement Cognito authentication middleware
5. Set up AWS services (S3, Textract)
6. Implement file upload and processing
7. Add comprehensive testing
8. Deploy to staging environment
9. Performance optimization and monitoring

## Benefits of Using AWS Cognito

1. **Managed Service**: No need to implement custom authentication logic
2. **Security**: Built-in security features like MFA, password policies
3. **Scalability**: Automatically scales with your user base
4. **Integration**: Easy integration with other AWS services
5. **Standards Compliance**: Supports OAuth 2.0, OpenID Connect, SAML
6. **User Management**: Built-in user management features
7. **Cost Effective**: Pay only for what you use

This backend service will provide a robust foundation for your purchase tracking application with secure Cognito-based authentication, reliable file processing, and scalable architecture.
