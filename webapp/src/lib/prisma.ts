import { PrismaClient } from '@prisma/client';
import { Pool, types } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Handle Postgres Numeric types as floats
types.setTypeParser(1700, (val) => parseFloat(val));

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  // Diagnostic log for host (masking password)
  const hostMatch = connectionString.match(/@([^:/]+)/);
  const host = hostMatch ? hostMatch[1] : 'unknown';
  console.log(`[Prisma] Initializing client with host: ${host}`);

  // Use a single connection per function execution for serverless
  const pool = new Pool({ 
    connectionString,
    max: 1, 
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
  });
  
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
