# AÇÃO MANUAL NECESSÁRIA - Paginação Backend

## Arquivo: `api/index.js`

### Endpoint 1: GET /api/leads

Procure por `app.get('/api/leads'` e SUBSTITUA por:

```javascript
app.get('/api/leads', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const countResult = await query('SELECT COUNT(*) FROM leads');
        const total = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(total / limit);

        const result = await query(
            'SELECT * FROM leads ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        res.json({
            data: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        console.error("Erro ao listar leads:", error);
        res.status(500).json({ message: 'Erro ao listar leads' });
    }
});
```

### Endpoint 2: GET /api/quotes

Procure por `app.get('/api/quotes'` e SUBSTITUA por:

```javascript
app.get('/api/quotes', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const countResult = await query('SELECT COUNT(*) FROM quotes');
        const total = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(total / limit);

        const result = await query(
            'SELECT * FROM quotes ORDER BY date DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        res.json({
            data: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        console.error("Erro ao listar orçamentos:", error);
        res.status(500).json({ message: 'Erro ao listar orçamentos' });
    }
});
```

## Me avise quando terminar!
