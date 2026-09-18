import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import pg from 'pg';
import { z } from 'zod';

const { Pool } = pg;
const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper for queries
const query = (text, params) => pool.query(text, params);

// ==========================================
// Kanban Stages
// ==========================================

// GET /api/kanban/stages
router.get('/stages', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT * FROM kanban_stages ORDER BY order_position ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching stages:', error);
        res.status(500).json({ error: 'Erro ao buscar etapas' });
    }
});

// POST /api/kanban/stages
router.post('/stages', authenticateToken, async (req, res) => {
    const schema = z.object({
        name: z.string().min(1),
        order_position: z.number().int(),
        color: z.string().optional(),
        icon: z.string().optional()
    });

    try {
        const data = schema.parse(req.body);
        const result = await query(
            'INSERT INTO kanban_stages (name, order_position, color, icon) VALUES ($1, $2, $3, $4) RETURNING *',
            [data.name, data.order_position, data.color, data.icon]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating stage:', error);
        res.status(400).json({ error: 'Dados inválidos ou erro ao criar etapa' });
    }
});

// PUT /api/kanban/stages/:id
router.put('/stages/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const schema = z.object({
        name: z.string().min(1).optional(),
        order_position: z.number().int().optional(),
        color: z.string().optional(),
        icon: z.string().optional()
    });

    try {
        const data = schema.parse(req.body);

        // Dynamic update query construction is safer/cleaner, but for fixed fields:
        let q = 'UPDATE kanban_stages SET updated_at = NOW()';
        const params = [];
        let pIdx = 1;

        if (data.name) { q += `, name = $${pIdx++}`; params.push(data.name); }
        if (data.order_position !== undefined) { q += `, order_position = $${pIdx++}`; params.push(data.order_position); }
        if (data.color !== undefined) { q += `, color = $${pIdx++}`; params.push(data.color); }
        if (data.icon !== undefined) { q += `, icon = $${pIdx++}`; params.push(data.icon); }

        q += ` WHERE id = $${pIdx} RETURNING *`;
        params.push(id);

        const result = await query(q, params);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Etapa não encontrada' });

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating stage:', error);
        res.status(400).json({ error: 'Erro ao atualizar etapa' });
    }
});

// DELETE /api/kanban/stages/:id
router.delete('/stages/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        // TODO: Check if any projects are in this stage before deleting?
        // Current constraint: Checklists cascade delete, but projects linked to this stage name might break visually if not handled.

        const result = await query('DELETE FROM kanban_stages WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Etapa não encontrada' });

        res.json({ success: true, id });
    } catch (error) {
        console.error('Error deleting stage:', error);
        res.status(500).json({ error: 'Erro ao excluir etapa' });
    }
});

// ==========================================
// Kanban Checklist Templates
// ==========================================

// GET /api/kanban/stages/:stageId/checklist
router.get('/stages/:stageId/checklist', authenticateToken, async (req, res) => {
    const { stageId } = req.params;
    try {
        const result = await query(
            'SELECT * FROM kanban_checklist_templates WHERE stage_id = $1 ORDER BY order_position ASC',
            [stageId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching checklist:', error);
        res.status(500).json({ error: 'Erro ao buscar checklist' });
    }
});

// POST /api/kanban/checklist
router.post('/checklist', authenticateToken, async (req, res) => {
    const schema = z.object({
        stage_id: z.number().int(),
        item_label: z.string().min(1),
        order_position: z.number().int(),
        is_required: z.boolean().optional()
    });

    try {
        const data = schema.parse(req.body);
        const result = await query(
            'INSERT INTO kanban_checklist_templates (stage_id, item_label, order_position, is_required) VALUES ($1, $2, $3, $4) RETURNING *',
            [data.stage_id, data.item_label, data.order_position, data.is_required || false]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating checklist item:', error);
        res.status(400).json({ error: 'Dados inválidos' });
    }
});

// PUT /api/kanban/checklist/:id
router.put('/checklist/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const schema = z.object({
        item_label: z.string().optional(),
        order_position: z.number().optional(),
        is_required: z.boolean().optional()
    });

    try {
        const data = schema.parse(req.body);
        let q = 'UPDATE kanban_checklist_templates SET updated_at = NOW()';
        const params = [];
        let pIdx = 1;

        if (data.item_label) { q += `, item_label = $${pIdx++}`; params.push(data.item_label); }
        if (data.order_position !== undefined) { q += `, order_position = $${pIdx++}`; params.push(data.order_position); }
        if (data.is_required !== undefined) { q += `, is_required = $${pIdx++}`; params.push(data.is_required); }

        q += ` WHERE id = $${pIdx} RETURNING *`;
        params.push(id);

        const result = await query(q, params);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Item não encontrado' });

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating checklist:', error);
        res.status(400).json({ error: 'Erro ao atualizar item' });
    }
});

// DELETE /api/kanban/checklist/:id
router.delete('/checklist/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query('DELETE FROM kanban_checklist_templates WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Item não encontrado' });
        res.json({ success: true, id });
    } catch (error) {
        console.error('Error deleting checklist item:', error);
        res.status(500).json({ error: 'Erro ao excluir item' });
    }
});

export default router;
