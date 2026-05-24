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

  // Create a clean connection string for the pool by removing sslmode
  // pg driver now treats 'require' as 'verify-full', which we want to override
  let cleanConnectionString = connectionString;
  try {
    const url = new URL(connectionString.replace('postgresql://', 'http://')); // URL parser helper
    url.searchParams.delete('sslmode');
    url.searchParams.delete('ssl');
    cleanConnectionString = url.toString().replace('http://', 'postgresql://');
  } catch (e) {
    console.error('[Prisma] Failed to parse connection string for cleaning');
  }

  const poolConfig: any = {
    connectionString: cleanConnectionString,
    max: 1,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 10000,
  };

  // If connection string contains sslmode, we need to ensure the object-based
  // ssl config takes precedence or remove the parameter. 
  // We'll trust the object config here.
  const pool = new Pool(poolConfig);
  
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
