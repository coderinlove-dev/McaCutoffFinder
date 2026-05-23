import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '..', 'database', 'mca_cutoffs.db');

export const db = new Database(dbPath, {
  readonly: true,
  fileMustExist: true,
});
