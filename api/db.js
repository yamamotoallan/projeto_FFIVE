import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

// Configuração da conexão para Neon.tech
// Usa DATABASE_URL que contém todas as informações de conexão
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Neon.tech requires SSL
    },
    // Optimized for Railway (persistent server)
    max: 20, // Maximum connections in pool
    idleTimeoutMillis: 30000, // Idle connection timeout
    connectionTimeoutMillis: 10000, // New connection timeout
});

// Connection established
pool.on('connect', () => {
    console.log('✅ Connected to Neon.tech successfully!');
});

// Handle pool errors without crashing the server
pool.on('error', (err) => {
    console.error('❌ Unexpected database client error:', err);
    // Don't exit - let the application handle reconnection
    // process.exit(-1); // REMOVED: Causes downtime on temporary DB issues
});

export const query = (text, params) => pool.query(text, params);
export default pool;
