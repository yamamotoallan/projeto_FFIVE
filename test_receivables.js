// Quick test script to check receivables endpoint
const API_URL = 'https://gest-o-agenda-marcenaria-server.vercel.app';

async function testReceivables() {
    try {
        // You'll need to replace with actual token
        const token = 'YOUR_TOKEN_HERE';

        const response = await fetch(`${API_URL}/api/financial/receivables`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log('Receivables data:', JSON.stringify(data, null, 2));

        // Check for transactions
        const transactions = data.installments?.filter(item => item.source_type === 'transaction');
        console.log('\nManual Transactions found:', transactions?.length || 0);
        if (transactions) {
            transactions.forEach(t => {
                console.log(`- ID: ${t.id}, Amount: ${t.amount}, Due Date: ${t.due_date}, Status: ${t.status}`);
            });
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// testReceivables();
console.log('Script ready. Replace YOUR_TOKEN_HERE with actual token and uncomment last line.');
