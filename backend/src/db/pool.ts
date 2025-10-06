import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'hr_department',
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT || '5432'),
});

export default pool;

