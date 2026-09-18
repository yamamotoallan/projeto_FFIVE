
// Removed import node-fetch, relying on global fetch (Node 18+)
import fs from 'fs';

async function runTests() {
    let output = "=== Starting Financial API Diagnosis ===\n";
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
            fs.writeFileSync('diagnosis_results.txt', output);
            process.exit(1);
        }
        token = loginData.token;
        log("Login successful. Token acquired.");
    } catch (e) {
        log(`Login Error: ${e.message}`);
        fs.writeFileSync('diagnosis_results.txt', output);
        process.exit(1);
    }

    // 2. Test Endpoints
    const endpoints = [
        { method: 'GET', url: '/api/financial/categories', name: 'Categories' },
        { method: 'GET', url: '/api/financial/bank-accounts', name: 'Bank Accounts' },
        { method: 'GET', url: '/api/financial/receivables', name: 'Receivables' },
        { method: 'GET', url: '/api/financial/payables', name: 'Payables' },
        { method: 'GET', url: '/api/financial/suppliers', name: 'Suppliers' },
        { method: 'GET', url: '/api/financial/reports/dre', name: 'Report: DRE' },
        { method: 'GET', url: '/api/financial/reports/monthly-comparison', name: 'Report: Monthly Comparison' },
        { method: 'GET', url: '/api/financial/reports/cash-position', name: 'Report: Cash Position' }
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
                const preview = JSON.stringify(data).substring(0, 100) + "...";
                log(`Response: OK. Data sample: ${preview}`);
            } else {
                // Try to get text, might fail if empty
                try {
                    const text = await res.text();
                    log(`Response: ERROR. Body: ${text}`);
                } catch (e) {
                    log(`Response: ERROR. Could not read body.`);
                }
            }
        } catch (err) {
            log(`Request failed: ${err.message}`);
        }
    }

    log("\n=== Diagnosis Complete ===");
    fs.writeFileSync('diagnosis_results.txt', output);
}

runTests();
