#!/bin/bash
set -e  # Exit on any error

echo "🚀 Starting application..."

# Set memory optimization for Node.js
export NODE_OPTIONS="--max-old-space-size=512"

# Always ensure database is in sync
echo "📦 Running database migrations..."
timeout 60 npx prisma migrate deploy || {
  echo "⚠️  Migration deploy failed, trying db push as fallback..."
  timeout 60 npx prisma db push --force-reset
}
echo "✅ Migrations completed successfully"

# Generate Prisma client if needed
echo "🔧 Ensuring Prisma client is generated..."
npx prisma generate

# Start the Next.js application
echo "🌐 Starting Next.js server..."
exec npm run start:next