# Purchase Tracker Backend

This is the backend service for the Purchase Tracker application, built with Node.js, Express, and integrated with AWS services (Cognito, S3, Textract) and PostgreSQL.

## Features

- 🔐 **AWS Cognito Authentication** - Secure user authentication and management
- 📸 **Receipt Processing** - Upload and process receipts using AWS Textract
- 💾 **File Storage** - Secure file storage with AWS S3
- 📊 **Purchase Management** - Create, read, update, delete purchases
- 📈 **Analytics** - Purchase statistics and category breakdowns
- 🔒 **Security** - JWT token validation, input validation, file type checking
- 📱 **REST API** - RESTful API design with comprehensive error handling

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- AWS Account with:
  - Cognito User Pool
  - S3 Bucket
  - Textract service access
  - IAM user with appropriate permissions

## Quick Start

1. **Clone and install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Set up database**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## Environment Variables

Copy `.env.example` to `.env` and update with your values:

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `AWS_COGNITO_USER_POOL_ID` | Cognito User Pool ID | Yes |
| `AWS_COGNITO_CLIENT_ID` | Cognito App Client ID | Yes |
| `AWS_COGNITO_REGION` | Cognito region | Yes |
| `AWS_ACCESS_KEY_ID` | AWS access key | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Yes |
| `AWS_REGION` | AWS region | Yes |
| `AWS_S3_BUCKET` | S3 bucket name | Yes |

## API Endpoints

### Authentication
All endpoints require a valid Cognito JWT token in the Authorization header:
```
Authorization: Bearer <your-cognito-jwt-token>
```

### Receipts
- `POST /api/receipts/upload` - Upload receipt image
- `GET /api/receipts` - Get user's receipts (with pagination)
- `GET /api/receipts/:id` - Get specific receipt
- `DELETE /api/receipts/:id` - Delete receipt
- `POST /api/receipts/:id/reprocess` - Reprocess receipt with Textract

### Purchases
- `GET /api/purchases` - Get user's purchases (with filtering and pagination)
- `POST /api/purchases` - Create new purchase
- `GET /api/purchases/:id` - Get specific purchase
- `PUT /api/purchases/:id` - Update purchase
- `DELETE /api/purchases/:id` - Delete purchase
- `GET /api/purchases/categories` - Get user's purchase categories
- `GET /api/purchases/stats` - Get purchase statistics

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/dashboard` - Get dashboard data

### System
- `GET /health` - Health check
- `GET /api` - API documentation

## Database Schema

The application uses PostgreSQL with Prisma ORM:

- **User** - User information linked to Cognito
- **Receipt** - Uploaded receipt files and Textract data
- **Purchase** - Purchase records, optionally linked to receipts

## AWS Services Setup

### 1. Cognito User Pool
1. Create a User Pool in AWS Cognito
2. Configure sign-in options (email)
3. Create an App Client (no client secret for mobile)
4. Note the User Pool ID and Client ID

### 2. S3 Bucket
1. Create an S3 bucket for receipt storage
2. Configure appropriate bucket policies
3. Enable versioning (optional)

### 3. IAM Permissions
Ensure your AWS user has permissions for:
- Cognito (for JWT verification)
- S3 (GetObject, PutObject, DeleteObject)
- Textract (DetectDocumentText, AnalyzeDocument)

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "stack": "..." // Only in development
}
```

Common error codes:
- `VALIDATION_ERROR` - Request validation failed
- `INVALID_TOKEN` - JWT token is invalid
- `TOKEN_EXPIRED` - JWT token has expired
- `NOT_FOUND` - Resource not found
- `UPLOAD_FAILED` - File upload failed
- `AWS_ERROR` - AWS service error

## Security Features

- JWT token validation with AWS Cognito
- File type and size validation
- Input sanitization and validation
- CORS configuration
- Helmet security headers
- Environment-based configuration

## Development

### Adding New Routes
1. Create controller in `src/controllers/`
2. Add route handlers in `src/routes/`
3. Add validation middleware if needed
4. Update API documentation

### Database Changes
1. Update `prisma/schema.prisma`
2. Run `npm run db:migrate`
3. Update controllers/services as needed

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Deployment

### Environment Setup
1. Set up production database
2. Configure AWS services for production
3. Set environment variables
4. Run database migrations

### Docker (Optional)
```dockerfile
# Example Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run db:generate
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT
