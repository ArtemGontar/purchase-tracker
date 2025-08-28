#!/bin/bash

echo "🚀 Setting up Purchase Tracker Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your actual AWS and database credentials"
else
    echo "✅ .env file already exists"
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✅ Prisma client generated"

# Check if database is accessible (optional)
echo "🔍 Checking database connection..."
npx prisma db push --accept-data-loss > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
else
    echo "⚠️  Database connection failed. Please check your DATABASE_URL in .env"
    echo "   You can skip this for now and set up the database later"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your AWS credentials and database URL"
echo "2. Set up AWS Cognito User Pool"
echo "3. Create S3 bucket for receipt storage"
echo "4. Run database migrations: npm run db:migrate"
echo "5. Start development server: npm run dev"
echo ""
echo "📚 API will be available at: http://localhost:3000/api"
echo "🏥 Health check at: http://localhost:3000/health"
