# Backend Implementation Guide

## Overview

This document outlines the implementation of a Node.js backend service for the Purchase Tracker application. The backend will provide REST API endpoints for user authentication, receipt processing, and purchase management with integrations to AWS S3, Amazon Textract, and a database.

## Architecture

```
Frontend (React Native) 
    ↓ HTTP/REST API (with Cognito JWT tokens)
Backend (Node.js/Express)
    ↓
├── AWS Cognito (Authentication & User Management)
├── File Upload Service (AWS S3)
├── OCR Service (Amazon Textract)
└── Database Service (PostgreSQL/MongoDB)
```

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Authentication**: AWS Cognito (managed authentication service)
- **Database**: PostgreSQL with Prisma ORM (or MongoDB with Mongoose)
- **Cloud Services**: AWS S3, Amazon Textract, AWS Cognito
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
   npm install aws-sdk @aws-sdk/client-s3 @aws-sdk/client-textract
   npm install aws-jwt-verify jsonwebtoken
   
   # Database (choose one)
   npm install prisma @prisma/client    # For PostgreSQL
   # OR
   npm install mongoose                 # For MongoDB
   
   # Development dependencies
   npm install -D nodemon jest supertest eslint prettier
   ```

3. **Environment Configuration**
   Create `.env.example` and `.env` files:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/purchase_tracker"
   
   # AWS Cognito Configuration
   AWS_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
   AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
   AWS_COGNITO_REGION=us-east-1
   
   # AWS Configuration
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=purchase-tracker-receipts
   
   # Email Configuration (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

### Phase 2: Database Setup

#### Option A: PostgreSQL with Prisma

1. **Initialize Prisma**
   ```bash
   npx prisma init
   ```

2. **Define Schema** (`prisma/schema.prisma`):
   ```prisma
   generator client {
     provider = "prisma-client-js"
   }
   
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   
   model User {
     id        String   @id @default(cuid())
     cognitoId String   @unique  // Cognito user ID
     email     String   @unique
     firstName String?
     lastName  String?
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
     
     purchases Purchase[]
     receipts  Receipt[]
   }
   
   model Purchase {
     id          String   @id @default(cuid())
     title       String
     amount      Float
     currency    String   @default("USD")
     category    String?
     description String?
     purchaseDate DateTime
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
     
     userId    String
     user      User      @relation(fields: [userId], references: [id])
     receiptId String?   @unique
     receipt   Receipt?  @relation(fields: [receiptId], references: [id])
   }
   
   model Receipt {
     id           String   @id @default(cuid())
     originalName String
     s3Key        String   @unique
     s3Url        String
     textractData Json?
     processed    Boolean  @default(false)
     createdAt    DateTime @default(now())
     updatedAt    DateTime @updatedAt
     
     userId   String
     user     User      @relation(fields: [userId], references: [id])
     purchase Purchase?
   }
   ```

3. **Generate and Run Migration**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

### Phase 3: AWS Cognito Integration

1. **Cognito Service** (`src/services/cognitoService.js`):
   ```javascript
   const { CognitoJwtVerifier } = require('aws-jwt-verify');
   const { PrismaClient } = require('@prisma/client');
   
   const prisma = new PrismaClient();
   
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
       
       let user = await prisma.user.findUnique({
         where: { cognitoId }
       });
   
       if (!user) {
         user = await prisma.user.create({
           data: {
             cognitoId,
             email,
             firstName: given_name || null,
             lastName: family_name || null,
           }
         });
       }
   
       return user;
     }
   
     async getUserByCognitoId(cognitoId) {
       return await prisma.user.findUnique({
         where: { cognitoId }
       });
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
   const { PrismaClient } = require('@prisma/client');
   
   const prisma = new PrismaClient();
   
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
         const receipt = await prisma.receipt.create({
           data: {
             originalName: req.file.originalname,
             s3Key,
             s3Url,
             userId,
           },
         });
   
         // Process with Textract (async)
         this.processReceiptAsync(receipt.id, s3Key);
   
         res.status(201).json({
           message: 'Receipt uploaded successfully',
           receipt,
         });
       } catch (error) {
         res.status(500).json({ error: error.message });
       }
     }
   
     async processReceiptAsync(receiptId, s3Key) {
       try {
         const textractData = await textractService.analyzeExpense(s3Key);
         
         await prisma.receipt.update({
           where: { id: receiptId },
           data: {
             textractData,
             processed: true,
           },
         });
       } catch (error) {
         console.error('Error processing receipt:', error);
       }
     }
   
     async getReceipts(req, res) {
       try {
         const userId = req.user.id;
         const receipts = await prisma.receipt.findMany({
           where: { userId },
           orderBy: { createdAt: 'desc' },
         });
   
         res.json(receipts);
       } catch (error) {
         res.status(500).json({ error: error.message });
       }
     }
   
     async getReceiptById(req, res) {
       try {
         const { id } = req.params;
         const userId = req.user.id;
   
         const receipt = await prisma.receipt.findFirst({
           where: { id, userId },
         });
   
         if (!receipt) {
           return res.status(404).json({ error: 'Receipt not found' });
         }
   
         res.json(receipt);
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
   
   module.exports = router;
   ```

2. **Purchase Routes** (`src/routes/purchases.js`):
   ```javascript
   const express = require('express');
   const purchaseController = require('../controllers/purchaseController');
   const cognitoAuth = require('../middleware/cognitoAuth');
   
   const router = express.Router();
   
   router.get('/', cognitoAuth, purchaseController.getPurchases);
   router.post('/', cognitoAuth, purchaseController.createPurchase);
   router.get('/:id', cognitoAuth, purchaseController.getPurchaseById);
   router.put('/:id', cognitoAuth, purchaseController.updatePurchase);
   router.delete('/:id', cognitoAuth, purchaseController.deletePurchase);
   
   module.exports = router;
   ```

3. **User Routes** (`src/routes/users.js`):
   ```javascript
   const express = require('express');
   const userController = require('../controllers/userController');
   const cognitoAuth = require('../middleware/cognitoAuth');
   
   const router = express.Router();
   
   router.get('/profile', cognitoAuth, userController.getProfile);
   router.put('/profile', cognitoAuth, userController.updateProfile);
   
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
   app.use(cors());
   app.use(morgan('combined'));
   app.use(express.json({ limit: '50mb' }));
   app.use(express.urlencoded({ extended: true, limit: '50mb' }));
   
   // Routes
   app.use('/api/receipts', receiptRoutes);
   app.use('/api/purchases', purchaseRoutes);
   app.use('/api/users', userRoutes);
   
   // Health check
   app.get('/health', (req, res) => {
     res.json({ status: 'OK', timestamp: new Date().toISOString() });
   });
   
   // Error handling
   app.use(errorHandler);
   
   const PORT = process.env.PORT || 3000;
   
   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
   
   module.exports = app;
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
