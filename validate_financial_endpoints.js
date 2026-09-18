
import fs from 'fs';

async function runTests() {
    let output = "=== Starting Financial API Diagnosis (Validation Phase) ===\n";
    const log = (msg) => {
        console.log(msg);
        output += msg + "\n";
    };

    log("[1] Authenticating...");
    let token = '';
    try {
        const loginRes = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@admin.com', password: '123' })
        });
        const loginData = await loginRes.json();
        if (!loginData.success) {
            log(`Login failed: ${JSON.stringify(loginData)}`);
            fs.writeFileSync('validation_results.txt', output);
            process.exit(1);
        }
        token = loginData.token;
        log("Login successful. Token acquired.");
    } catch (e) {
        log(`Login Error: ${e.message}`);
        fs.writeFileSync('validation_results.txt', output);
        process.exit(1);
    }

    // 2. Test Endpoints
    const endpoints = [
        { method: 'GET', url: '/api/financial/receivables', name: 'Receivables' },
        { method: 'GET', url: '/api/financial/payables', name: 'Payables' },
        { method: 'GET', url: '/api/financial/movements', name: 'Bank Movements' }
    ];

    log("\n[2] Testing Endpoints...");

    for (const ep of endpoints) {
        try {
            const fullUrl = `http://localhost:3001${ep.url}`;
            log(`\nTesting: ${ep.name} (${ep.method} ${ep.url})`);
            const res = await fetch(fullUrl, {
                method: ep.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            log(`Status: ${res.status} ${res.statusText}`);
            if (res.ok) {
                const data = await res.json();

                if (ep.name === 'Receivables') {
                    // Check for client_name in first item if exists
                    const list = data.installments;
                    log(`Items count: ${list.length}`);
                    if (list.length > 0) {
                        log(`First item keys: ${Object.keys(list[0]).join(', ')}`);
                        log(`client_name present? ${list[0].hasOwnProperty('client_name')}`);
                        log(`quote_description present? ${list[0].hasOwnProperty('quote_description')}`);
                    }
                } else if (ep.name === 'Payables') {
                    // Check for bill_number in first item if exists
                    const list = data.bills;
                    log(`Items count: ${list.length}`);
                    if (list.length > 0) {
                        log(`First item keys: ${Object.keys(list[0]).join(', ')}`);
                        log(`bill_number present? ${list[0].hasOwnProperty('bill_number')}`);
                    }
                } else if (ep.name === 'Bank Movements') {
                    const list = data; // response is array
                    log(`Items count: ${list.length}`);
                    if (list.length > 0) {
                        log(`First item keys: ${Object.keys(list[0]).join(', ')}`);
                    }
                }

            } else {
                const text = await res.text();
                log(`Response: ERROR. Body: ${text}`);
            }
        } catch (err) {
            log(`Request failed: ${err.message}`);
        }
    }

    log("\n=== Validation Complete ===");
    fs.writeFileSync('validation_results.txt', output);
}

runTests();
