import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import pg from 'pg';

const { Pool } = pg;
const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper for queries
const query = (text, params) => pool.query(text, params);

// GET /api/audit-logs
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { query: searchQuery, user, entity_type, date_from, date_to } = req.query;

        let sql = `
            SELECT 
                id, 
                user_name, 
                entity_type, 
                entity_id, 
                action, 
                details as description, 
                created_at 
            FROM audit_logs 
            WHERE 1=1
        `;
        const params = [];
        let pIdx = 1;

        if (searchQuery) {
            sql += ` AND (details ILIKE $${pIdx} OR entity_id::text ILIKE $${pIdx})`;
            params.push(`%${searchQuery}%`);
            pIdx++;
        }

        if (user) {
            sql += ` AND user_name ILIKE $${pIdx}`;
            params.push(`%${user}%`);
            pIdx++;
        }

        if (entity_type && entity_type !== 'all') {
            sql += ` AND entity_type = $${pIdx}`;
            params.push(entity_type);
            pIdx++;
        }


        if (date_from) {
            sql += ` AND created_at >= $${pIdx}`;
            params.push(date_from);
            pIdx++;
        }

        if (date_to) {
            // Adjust to end of day if it's just a date
            sql += ` AND created_at <= $${pIdx}::date + interval '1 day'`;
            params.push(date_to);
            pIdx++;
        }

        sql += ` ORDER BY created_at DESC LIMIT 100`;

        const result = await query(sql, params);
        res.json(result.rows);

    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Erro ao buscar logs de auditoria' });
    }
});

export default router;
