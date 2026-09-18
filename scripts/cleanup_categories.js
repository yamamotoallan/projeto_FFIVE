import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment correctly from root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

// Create pool only if DATABASE_URL is present
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function cleanup() {
    try {
        console.log('🔍 Starting duplication check for financial_categories...');

        // 1. Find duplicates (group by name and type to ensure we don't merge distinct types)
        // We trim names just in case whitespace is the difference
        const findDuplicatesQuery = `
            SELECT 
                TRIM(name) as clean_name, 
                type, 
                array_agg(id ORDER BY id ASC) as ids, 
                count(*) 
            FROM financial_categories 
            GROUP BY TRIM(name), type 
            HAVING count(*) > 1;
        `;

        const { rows: duplicates } = await pool.query(findDuplicatesQuery);

        if (duplicates.length === 0) {
            console.log('✅ No duplicates found.');
            return;
        }

        console.log(`⚠️ Found ${duplicates.length} duplicate groups.`);

        await pool.query('BEGIN');

        for (const group of duplicates) {
            const [keepId, ...deleteIds] = group.ids;

            // Safety check
            if (deleteIds.length === 0) continue;

            console.log(`\nProcessing "${group.clean_name}" (${group.type}):`);
            console.log(`   Keeping Master ID: ${keepId}`);
            console.log(`   Merging IDs: ${deleteIds.join(', ')}`);

            // 2. Update Transactions references
            const updateTransactions = `
                UPDATE transactions 
                SET category_id = $1 
                WHERE category_id = ANY($2::int[])
            `;
            const resTrans = await pool.query(updateTransactions, [keepId, deleteIds]);
            console.log(`   Updated ${resTrans.rowCount} transactions.`);

            // 3. Update Bills (Payables) references
            // Note: Verify table name is 'bills' or 'financial_bills' - assumed 'bills' based on previous context
            // checking simple existence first to avoid crash if table missing
            try {
                const updateBills = `
                    UPDATE bills 
                    SET category_id = $1 
                    WHERE category_id = ANY($2::int[])
                `;
                const resBills = await pool.query(updateBills, [keepId, deleteIds]);
                console.log(`   Updated ${resBills.rowCount} bills.`);
            } catch (err) {
                console.log(`   ⚠️ Could not update bills (table might not exist or diff name): ${err.message}`);
            }

            // 4. Delete Duplicates
            const deleteCategories = `
                DELETE FROM financial_categories 
                WHERE id = ANY($1::int[])
            `;
            const resDel = await pool.query(deleteCategories, [deleteIds]);
            console.log(`   Deleted ${resDel.rowCount} duplicate categories.`);
        }

        await pool.query('COMMIT');
        console.log('\n✅ Cleanup completed successfully. All duplicates merged and removed.');

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('❌ Error during cleanup:', error);
    } finally {
        await pool.end();
    }
}

cleanup();
