const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    await prisma.$connect();
    console.log('Connected successfully!');

    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Query result:', result);
  } catch (error) {
    console.error('Connection error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
