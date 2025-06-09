#!/bin/bash
set -e  # Exit on any error

echo "🚀 Starting application v2.0 - FRESH DEPLOYMENT..."

# Set memory optimization for Node.js
export NODE_OPTIONS="--max-old-space-size=512"

# Clear any cached Prisma clients
echo "🧹 Clearing Prisma client cache..."
rm -rf node_modules/.prisma
rm -rf .next/cache

# Always ensure database is in sync
echo "📦 Ensuring database schema is up to date..."
timeout 60 npx prisma db push
echo "✅ Database schema synchronized successfully"

# Generate fresh Prisma client
echo "🔧 Generating fresh Prisma client..."
npx prisma generate

# Start the Next.js application
echo "🌐 Starting Next.js server..."
exec npm run start:next