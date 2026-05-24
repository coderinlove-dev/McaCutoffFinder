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

async function migrate() {
  console.log('🚀 Starting migration from SQLite to Supabase...');

  // 1. Migrate Institutes
  const institutes = sqlite.prepare('SELECT * FROM institutes').all();
  console.log(`📦 Found ${institutes.length} institutes in SQLite.`);
  for (const inst of institutes as any[]) {
    await prisma.institute.upsert({
      where: { instituteCode: inst.institute_code },
      update: { instituteName: inst.institute_name },
      create: {
        id: inst.id,
        instituteCode: inst.institute_code,
        instituteName: inst.institute_name,
      },
    });
  }
  console.log('✅ Institutes synced.');

  // 2. Migrate PDF Sources
  const sources = sqlite.prepare('SELECT * FROM pdf_sources').all();
  console.log(`📦 Found ${sources.length} PDF sources.`);
  for (const src of sources as any[]) {
    await prisma.pdfSource.upsert({
      where: { fileName: src.file_name },
      update: {},
      create: {
        id: src.id,
        fileName: src.file_name,
        capRound: src.cap_round,
        academicYear: src.academic_year,
      },
    });
  }
  console.log('✅ PDF sources synced.');

  // 3. Migrate Cutoff Rows
  const rows = sqlite.prepare('SELECT * FROM cutoff_rows').all();
  console.log(`📦 Found ${rows.length} cutoff rows. This may take a moment...`);
  
  // Batch size for better performance while avoiding connection timeouts
  const batchSize = 100;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    await Promise.all(batch.map((row: any) => 
      prisma.cutoffRow.upsert({
        where: { rowHash: row.row_hash },
        update: {},
        create: {
          id: row.id,
          sourceId: row.source_id,
          instituteId: row.institute_id,
          academicYear: row.academic_year,
          capRound: row.cap_round,
          candidateType: row.candidate_type,
          category: row.category,
          seatType: row.seat_type,
          universityType: row.university_type,
          cutoffValue: row.cutoff_value,
          cutoffUnit: row.cutoff_unit,
          rawRowText: row.raw_row_text,
          pageNumber: row.page_number,
          rowHash: row.row_hash,
        },
      })
    ));
    if ((i + batchSize) % 500 === 0 || i + batchSize >= rows.length) {
      console.log(`...processed ${Math.min(i + batchSize, rows.length)}/${rows.length} rows`);
    }
  }
  console.log('✅ Cutoff rows synced.');

  // 4. Sync Postgres Sequences (Vital for future inserts)
  console.log('🔄 Synchronizing PostgreSQL sequences...');
  const tables = ['institutes', 'pdf_sources', 'cutoff_rows'];
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`
        SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "${table}";
      `);
    } catch (e) {
      console.warn(`Could not reset sequence for ${table}. This is expected if the table name or ID column doesn't match Prisma defaults.`);
    }
  }

  console.log('🎊 Migration complete!');
}

migrate()
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
