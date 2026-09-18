
// Removed import node-fetch, relying on global fetch (Node 18+)
async function testLogin() {
    try {
        console.log("Attempting login...");
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@admin.com', password: '123' })
        });

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Body:", text);
    } catch (error) {
        console.error('Login Error:', error);
    }
}

testLogin();
