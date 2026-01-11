import pkg from 'pg';
const { Pool } = pkg;

// PostgreSQL Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'monemee',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'MoneMee',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connection established');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

/**
 * Database middleware - macht DB Pool in allen Routes verfügbar
 */
export const dbMiddleware = (req, res, next) => {
  req.db = pool;
  next();
};

export default pool;
