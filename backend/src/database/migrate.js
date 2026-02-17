import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  let client;
  try {
    console.log('Connecting to database...');
    client = await pool.connect();
    console.log('Connected successfully');
    
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    console.log('Running migration...');
    await client.query(schema);
    console.log('✓ Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:');
    if (error.code === 'ECONNREFUSED') {
      console.error('\nPostgreSQL is not running or not accessible.');
      console.error('Please ensure PostgreSQL is installed and running on port 5432.');
      console.error('\nQuick start:');
      console.error('  1. Install PostgreSQL: https://www.postgresql.org/download/');
      console.error('  2. Start PostgreSQL service');
      console.error('  3. Create database: CREATE DATABASE taskcollab;');
      console.error('  4. Update .env file with correct DATABASE_URL');
    } else {
      console.error(error.message);
    }
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
  }
}

migrate();
