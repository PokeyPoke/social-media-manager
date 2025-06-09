#!/bin/bash
set -e  # Exit on any error

echo "🚀 Starting application..."

# Set memory optimization for Node.js
export NODE_OPTIONS="--max-old-space-size=512"

# Always ensure database is in sync
echo "📦 Ensuring database schema is up to date..."
timeout 60 npx prisma db push
echo "✅ Database schema synchronized successfully"

# Generate Prisma client if needed
echo "🔧 Ensuring Prisma client is generated..."
npx prisma generate

# Start the Next.js application
echo "🌐 Starting Next.js server..."
exec npm run start:next