// Extract project ref from URL and try the Supabase Management API
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
const projectRef = url.replace('https://', '').split('.')[0];

const sql = `ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS show_completed_date boolean NOT NULL DEFAULT true, ADD COLUMN IF NOT EXISTS show_work_type boolean NOT NULL DEFAULT true, ADD COLUMN IF NOT EXISTS show_neighborhood boolean NOT NULL DEFAULT true, ADD COLUMN IF NOT EXISTS show_reviews boolean NOT NULL DEFAULT true, ADD COLUMN IF NOT EXISTS show_images boolean NOT NULL DEFAULT true;`;

// Try direct database connection via pg
import pg from 'pg';
const { Client } = pg;

// Supabase database connection string
const dbUrl = `postgresql://postgres.${projectRef}:${key}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

try {
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to database');
  const result = await client.query(sql);
  console.log('Migration result:', result.command);
  await client.end();
  console.log('MIGRATION_SUCCESS');
} catch (e) {
  console.log('DB connection error:', e.message);
  
  // Try alternate connection format
  try {
    const dbUrl2 = `postgresql://postgres:${key}@db.${projectRef}.supabase.co:5432/postgres`;
    const client2 = new Client({ connectionString: dbUrl2, ssl: { rejectUnauthorized: false } });
    await client2.connect();
    console.log('Connected via alternate URL');
    const result = await client2.query(sql);
    console.log('Migration result:', result.command);
    await client2.end();
    console.log('MIGRATION_SUCCESS');
  } catch (e2) {
    console.log('Alternate connection error:', e2.message);
  }
}
