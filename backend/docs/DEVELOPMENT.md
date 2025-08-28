# Development Guide

This guide covers development workflows, best practices, and common tasks for the Purchase Tracker backend.

## Development Workflow

### 1. Initial Setup
```bash
# Clone and setup
git clone <repo-url>
cd backend
./setup.sh

# Or manual setup
npm install
cp .env.example .env
# Update .env with your values
npm run db:generate
npm run db:migrate
```

### 2. Daily Development
```bash
# Start development server with auto-reload
npm run dev

# In separate terminals:
npm run db:studio  # Database GUI
npm test -- --watch  # Run tests in watch mode
```

### 3. Database Changes
```bash
# After modifying schema.prisma
npm run db:migrate
npm run db:generate

# Reset database (development only)
npm run db:reset
```

## Project Structure Explained

```
src/
├── app.js                 # Main application entry point
├── config/               # Configuration files
│   ├── aws.js           # AWS service configuration
│   ├── config.js        # General app configuration
│   └── database.js      # Database connection
├── controllers/         # Request handlers
│   ├── purchaseController.js
│   ├── receiptController.js
│   └── userController.js
├── middleware/          # Express middleware
│   ├── cognitoAuth.js   # Authentication middleware
│   ├── errorHandler.js  # Global error handling
│   ├── upload.js        # File upload handling
│   └── validation.js    # Request validation
├── routes/              # API route definitions
│   ├── purchases.js
│   ├── receipts.js
│   └── users.js
├── services/            # Business logic services
│   ├── cognitoService.js # Cognito integration
│   ├── s3Service.js     # S3 file operations
│   └── textractService.js # OCR processing
└── utils/               # Utility functions
    ├── helpers.js       # General helpers
    └── logger.js        # Logging utilities
```

## API Development

### Adding New Endpoints

1. **Create Controller Method**
```javascript
// src/controllers/exampleController.js
class ExampleController {
  async getExample(req, res) {
    try {
      // Business logic here
      res.json({ data: 'example' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

2. **Add Route**
```javascript
// src/routes/examples.js
const express = require('express');
const exampleController = require('../controllers/exampleController');
const cognitoAuth = require('../middleware/cognitoAuth');

const router = express.Router();
router.get('/', cognitoAuth, exampleController.getExample);
module.exports = router;
```

3. **Register Route in App**
```javascript
// src/app.js
const exampleRoutes = require('./routes/examples');
app.use('/api/examples', exampleRoutes);
```

### Request Validation

```javascript
// src/middleware/validation.js
const exampleSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  email: Joi.string().email().required(),
});

const validateExample = validateRequest(exampleSchema);

// In route
router.post('/', cognitoAuth, validateExample, controller.create);
```

### Error Handling

```javascript
// Controllers should throw errors, middleware handles them
if (!resource) {
  const error = new Error('Resource not found');
  error.status = 404;
  error.code = 'RESOURCE_NOT_FOUND';
  throw error;
}
```

## Database Development

### Schema Changes

1. **Modify Prisma Schema**
```prisma
// prisma/schema.prisma
model NewModel {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  
  // Relations
  userId String
  user   User   @relation(fields: [userId], references: [id])
}
```

2. **Create Migration**
```bash
npx prisma migrate dev --name add_new_model
```

3. **Update Services/Controllers**
```javascript
// Use in controller
const newRecord = await prisma.newModel.create({
  data: { name, userId },
  include: { user: true }
});
```

### Database Queries

```javascript
// Basic CRUD
const users = await prisma.user.findMany({
  where: { active: true },
  include: { purchases: true },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 20,
});

// Aggregations
const stats = await prisma.purchase.aggregate({
  where: { userId },
  _sum: { amount: true },
  _count: true,
  _avg: { amount: true },
});

// Group by
const categoryStats = await prisma.purchase.groupBy({
  by: ['category'],
  where: { userId },
  _sum: { amount: true },
});
```

## AWS Services Integration

### S3 Operations
```javascript
// Upload file
const s3Key = s3Service.generateFileKey(userId, filename);
const s3Url = await s3Service.uploadFile(fileBuffer, s3Key);

// Generate signed URL
const signedUrl = await s3Service.getSignedUrl(s3Key, 3600);

// Delete file
await s3Service.deleteFile(s3Key);
```

### Textract Processing
```javascript
// Process receipt
const textractData = await textractService.analyzeExpense(s3Key);

// Extract specific data
const merchantName = textractData.merchantName;
const totalAmount = textractData.totalAmount;
const items = textractData.items;
```

### Cognito Authentication
```javascript
// Verify token (done in middleware)
const payload = await cognitoService.verifyToken(token);

// Get user from token
const user = await cognitoService.getOrCreateUser(payload);
```

## Testing

### Unit Tests
```javascript
// tests/services/s3Service.test.js
describe('S3Service', () => {
  test('should generate unique file key', () => {
    const key = s3Service.generateFileKey('user123', 'receipt.jpg');
    expect(key).toMatch(/receipts\/user123\/\d+_receipt\.jpg/);
  });
});
```

### Integration Tests
```javascript
// tests/routes/purchases.test.js
describe('POST /api/purchases', () => {
  test('should create purchase with valid data', async () => {
    const mockToken = 'valid-cognito-token';
    
    const response = await request(app)
      .post('/api/purchases')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        title: 'Test Purchase',
        amount: 29.99,
        category: 'Food'
      })
      .expect(201);
      
    expect(response.body.purchase).toHaveProperty('id');
  });
});
```

### Running Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage

# Specific test file
npm test -- purchases.test.js
```

## Debugging

### Logging
```javascript
const logger = require('../utils/logger');

logger.info('User created', { userId, email });
logger.error('Database error', error);
logger.debug('Debug info', { data });
```

### Development Tools
```bash
# Database GUI
npm run db:studio

# API testing
curl -X GET http://localhost:3000/health

# Request logging (already enabled in dev)
# Check console for request logs
```

### Common Debug Scenarios

1. **Authentication Issues**
```javascript
// Add debug logging in auth middleware
console.log('Token:', token.substring(0, 20) + '...');
console.log('Cognito payload:', cognitoPayload);
```

2. **Database Issues**
```javascript
// Enable query logging in database.js
log: ['query', 'error'],
```

3. **AWS Service Issues**
```javascript
// Check AWS credentials
console.log('AWS Region:', process.env.AWS_REGION);
console.log('S3 Bucket:', process.env.AWS_S3_BUCKET);
```

## Performance Optimization

### Database Optimization
```javascript
// Use select to limit fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    // Don't select heavy fields
  }
});

// Use pagination
const { page, limit } = req.query;
const skip = (page - 1) * limit;
const results = await prisma.model.findMany({ skip, take: limit });
```

### File Upload Optimization
```javascript
// Compress images before Textract
const sharp = require('sharp');
const compressed = await sharp(buffer)
  .jpeg({ quality: 80 })
  .toBuffer();
```

### Caching
```javascript
// Cache expensive operations
const redis = require('redis');
const client = redis.createClient();

// Cache Textract results
const cacheKey = `textract:${receiptId}`;
let result = await client.get(cacheKey);
if (!result) {
  result = await textractService.analyze(s3Key);
  await client.setex(cacheKey, 3600, JSON.stringify(result));
}
```

## Environment Management

### Development
```env
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/purchase_tracker_dev
AWS_S3_BUCKET=purchase-tracker-receipts-dev
```

### Testing
```env
NODE_ENV=test
DATABASE_URL=postgresql://user:pass@localhost:5432/purchase_tracker_test
AWS_S3_BUCKET=purchase-tracker-receipts-test
```

### Production
```env
NODE_ENV=production
DATABASE_URL=your-production-db-url
AWS_S3_BUCKET=purchase-tracker-receipts-prod
```

## Code Quality

### Linting
```bash
# Check code style
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Formatting
```bash
# Format code
npm run format
```

### Pre-commit Hooks (optional)
```bash
npm install -D husky lint-staged

# package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"]
  }
}
```

## Deployment

### Build for Production
```bash
# Install production dependencies only
npm ci --only=production

# Run database migrations
npm run db:migrate

# Start production server
npm start
```

### Docker Development
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

```bash
# Build and run
docker build -t purchase-tracker-backend .
docker run -p 3000:3000 --env-file .env purchase-tracker-backend
```

This guide should help you navigate the development process efficiently!
