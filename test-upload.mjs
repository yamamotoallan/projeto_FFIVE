import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

async function testUpload() {
    // 1. Login
    console.log('🔐 Testando login...');
    const loginResponse = await fetch('https://gest-o-agenda-marcenaria-production.up.railway.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@admin.com',
            password: '123456'
        })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.token) {
        console.error('❌ Login falhou!');
        return;
    }

    const token = loginData.token;
    console.log('✅ Login sucesso! Token:', token.substring(0, 20) + '...');

    // 2. Criar arquivo de teste
    console.log('\n📝 Criando arquivo de teste...');
    fs.writeFileSync('test-upload.txt', 'Este é um arquivo de teste para upload');

    // 3. Tentar upload
    console.log('\n📤 Tentando upload...');
    const formData = new FormData();
    formData.append('files', fs.createReadStream('test-upload.txt'));

    const uploadResponse = await fetch('https://gest-o-agenda-marcenaria-production.up.railway.app/api/quotes/1/files', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            ...formData.getHeaders()
        },
        body: formData
    });

    console.log('Upload status:', uploadResponse.status);
    const uploadData = await uploadResponse.text();
    console.log('Upload response:', uploadData);

    // 4. Cleanup
    fs.unlinkSync('test-upload.txt');
}

testUpload().catch(console.error);
