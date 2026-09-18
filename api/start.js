import app from './index.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Backend rodando localmente em http://localhost:${PORT}`);
    console.log(`🗄️  Conectado ao Neon.tech PostgreSQL`);
});

