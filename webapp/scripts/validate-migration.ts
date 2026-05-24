import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import Database from 'better-sqlite3';
import path from 'path';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const sqlite = new Database(path.join(process.cwd(), '..', 'database', 'mca_cutoffs.db'));

async function validate() {
  console.log('🔍 Starting migration validation...');

  const sqliteCutoffs = sqlite.prepare('SELECT COUNT(*) as count FROM cutoff_rows').get() as any;
  const pgCutoffs = await prisma.cutoffRow.count();

  const sqliteInstitutes = sqlite.prepare('SELECT COUNT(*) as count FROM institutes').get() as any;
  const pgInstitutes = await prisma.institute.count();

  const sqliteSources = sqlite.prepare('SELECT COUNT(*) as count FROM pdf_sources').get() as any;
  const pgSources = await prisma.pdfSource.count();

  console.log('\n--- Record Count Summary ---');
  console.log(`Cutoff Rows: SQLite [${sqliteCutoffs.count}] | Supabase [${pgCutoffs}] ${sqliteCutoffs.count === pgCutoffs ? '✅' : '❌'}`);
  console.log(`Institutes:  SQLite [${sqliteInstitutes.count}] | Supabase [${pgInstitutes}] ${sqliteInstitutes.count === pgInstitutes ? '✅' : '❌'}`);
  console.log(`Sources:     SQLite [${sqliteSources.count}] | Supabase [${pgSources}] ${sqliteSources.count === pgSources ? '✅' : '❌'}`);

  // Sample check
  if (pgCutoffs > 0) {
    const sample = await prisma.cutoffRow.findFirst({
      include: { institute: true, source: true }
    });
    console.log('\n--- Sample Record Integrity ---');
    console.log(`ID: ${sample?.id}`);
    console.log(`Institute: ${sample?.institute.instituteName}`);
    console.log(`Source: ${sample?.source.fileName}`);
    console.log(`Cutoff: ${sample?.cutoffValue}`);
    console.log('-------------------------------\n');
  }

  if (sqliteCutoffs.count === pgCutoffs && sqliteInstitutes.count === pgInstitutes) {
    console.log('✅ Validation PASSED: Database integrity is verified.');
  } else {
    console.warn('⚠️ Validation FAILED: Row count mismatch. Check for migration errors.');
  }
}

validate()
  .catch((err) => {
    console.error('❌ Validation failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
