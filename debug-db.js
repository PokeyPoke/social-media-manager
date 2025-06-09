const { PrismaClient } = require('@prisma/client');

async function debugDatabase() {
  console.log('🔍 Database Debug Information');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Check database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // List all tables
    console.log('2. Checking available tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log('📋 Available tables:', tables.map(t => t.table_name));

    // Try to query users table specifically
    console.log('3. Testing users table query...');
    const userCount = await prisma.user.count();
    console.log('👥 User count:', userCount);

    // Check Prisma client generation info
    console.log('4. Prisma client info:');
    console.log('   - Client version:', prisma._clientVersion);
    console.log('   - Engine version:', prisma._engineVersion);

    console.log('✅ All database checks passed!');
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('   - Error code:', error.code);
    console.error('   - Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDatabase().catch(console.error);