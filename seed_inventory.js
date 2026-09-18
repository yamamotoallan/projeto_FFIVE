import { query } from './api/db.js';
import pool from './api/db.js';

const seedInventory = async () => {
    try {
        console.log('Seeding Inventory Data...');

        // Clear existing (optional, maybe just add?)
        // await query('DELETE FROM inventory_items');

        const items = [
            { name: 'MDF Branco Tx 15mm', category: 'Chapas', unit: 'ch', quantity: 50, min_stock: 10, cost_price: 250.00 }, // Class A (High Val)
            { name: 'MDF Amadeirado 18mm', category: 'Chapas', unit: 'ch', quantity: 20, min_stock: 5, cost_price: 320.00 }, // Class A
            { name: 'Corrediça Telescópica 45cm', category: 'Ferragens', unit: 'par', quantity: 100, min_stock: 20, cost_price: 15.00 }, // Class B
            { name: 'Dobradiça Curva 35mm', category: 'Ferragens', unit: 'un', quantity: 200, min_stock: 50, cost_price: 5.00 }, // Class B
            { name: 'Parafuso 4x40mm', category: 'Fixação', unit: 'cx', quantity: 10, min_stock: 5, cost_price: 25.00 }, // Class C
            { name: 'Cola de Contato 2.8kg', category: 'Química', unit: 'l', quantity: 2, min_stock: 5, cost_price: 85.00 }, // Low Stock (2 < 5)
            { name: 'Lixa Grão 120', category: 'Abrasivos', unit: 'un', quantity: 0, min_stock: 20, cost_price: 2.50 } // Critical (0)
        ];

        for (const item of items) {
            // Check if exists
            const check = await query('SELECT id FROM inventory_items WHERE name = $1', [item.name]);
            if (check.rows.length === 0) {
                await query(
                    `INSERT INTO inventory_items (name, category, unit, quantity, min_stock, cost_price)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [item.name, item.category, item.unit, item.quantity, item.min_stock, item.cost_price]
                );
                console.log(`Created: ${item.name}`);
            } else {
                // Update to force values for demo
                const id = check.rows[0].id;
                await query(
                    `UPDATE inventory_items SET quantity = $1, min_stock = $2, cost_price = $3 WHERE id = $4`,
                    [item.quantity, item.min_stock, item.cost_price, id]
                );
                console.log(`Updated: ${item.name}`);
            }
        }

        console.log('✅ Inventory Seeded/Verified Successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding inventory:', error);
        process.exit(1);
    }
};

seedInventory();
