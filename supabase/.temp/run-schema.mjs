import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = resolve(__dirname, '..', 'migrations', '001_initial_schema.sql');
const sql = readFileSync(sqlPath, 'utf-8');

const client = new pg.Client({
  connectionString: 'postgresql://postgres.mdkftenubglujztifjqs:2Ynb6tIelI6sfH9c@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

try {
  console.log('Connecting to Supabase...');
  await client.connect();
  console.log('Connected. Executing schema...');
  await client.query(sql);
  console.log('Schema executed successfully!');

  // Verify tables
  const res = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  console.log(`\nCreated ${res.rows.length} tables:`);
  res.rows.forEach(r => console.log(`  - ${r.table_name}`));
} catch (err) {
  console.error('Error:', err.message);
  if (err.message.includes('already exists')) {
    console.log('\nSome objects already exist. Schema may be partially applied.');
  }
  process.exit(1);
} finally {
  await client.end();
}
