import fs from 'fs';
import path from 'path';
import { pool } from './pool';

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('[Migrate] Connecting to database...');
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (!file.endsWith('.sql')) continue;
      console.log(`[Migrate] Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      await client.query(sql);
      console.log(`[Migrate] ✓ ${file}`);
    }

    console.log('[Migrate] All migrations completed.');
  } catch (err) {
    console.error('[Migrate] Error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
