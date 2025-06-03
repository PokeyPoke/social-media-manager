const { execSync } = require('child_process');

console.log('🚀 Starting database setup...');

try {
  // Run prisma migrate deploy
  console.log('📦 Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  console.log('✅ Database setup completed successfully!');
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  process.exit(1);
}