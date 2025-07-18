import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();


if (!process.env.DB_PASSWORD) {
  console.error("FATAL: DB_PASSWORD is not set in .env file.");
  process.exit(1); 
}

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'gemini_clone',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});