const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração básica
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Configuração de Upload (Multer)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- DADOS MOCKADOS EM MEMÓRIA (Para simular DB) ---
let MOCK_USERS = [
    { id: 1, name: 'Administrador', email: 'admin@marcenaria.pro', role: 'admin', password: '123' },
    { id: 2, name: 'José Silva - Diretoria', email: 'diretoria@marcenaria.pro', role: 'diretoria', password: '123' },
    { id: 3, name: 'Vendedor', email: 'vendedor@marcenaria.pro', role: 'user', password: '123' }
];

// --- ROTAS DE AUTENTICAÇÃO ---

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Simulação de verificação de senha
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);

    if (user) {
        // Retorna dados do usuário sem a senha
        const { password, ...userWithoutPass } = user;
        res.json({
            success: true,
            user: userWithoutPass,
            token: 'fake-jwt-token-123456'
        });
    } else {
        res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
    }
});

// --- ROTAS DE USUÁRIOS (ADMIN) ---

// Listar Usuários
app.get('/api/users', (req, res) => {
    // Na vida real, verificar token de admin aqui
    const safeUsers = MOCK_USERS.map(({ password, ...u }) => u);
    res.json(safeUsers);
});

// Criar Usuário
app.post('/api/users', (req, res) => {
    const { name, email, password, role } = req.body;

    if (MOCK_USERS.find(u => u.email === email)) {
        return res.status(400).json({ message: 'Email já cadastrado' });
    }

    const newUser = {
        id: MOCK_USERS.length + 1,
        name,
        email,
        password, // Na vida real, usar bcrypt hash
        role: role || 'user'
    };

    MOCK_USERS.push(newUser);
    const { password: p, ...safeUser } = newUser;
    res.json(safeUser);
});

// Deletar Usuário
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    MOCK_USERS = MOCK_USERS.filter(u => u.id !== parseInt(id));
    res.json({ success: true });
});


// --- ROTAS EXISTENTES (Upload, Email, Quotes) ---

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('Nenhum arquivo enviado.');
    res.json({
        message: 'Upload realizado com sucesso',
        file: {
            name: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            type: req.file.mimetype
        }
    });
});

app.post('/api/email/send', (req, res) => {
    res.json({ success: true, message: 'E-mail enviado com sucesso!' });
});

app.post('/api/quotes/:id/approve', (req, res) => {
    const { id } = req.params;
    res.json({
        success: true,
        message: 'Orçamento aprovado e Projeto criado.',
        projectId: 'new-project-id'
    });
});

app.get('/api/quotes', (req, res) => {
    res.json([
        { id: '4023', client: 'Mariana Costa', project: 'Cozinha Planejada', status: 'Pendente', value: 18500 },
        { id: '4022', client: 'Construtora Build', project: 'Portas de Entrada', status: 'Aprovado', value: 42000 }
    ]);
});

app.listen(PORT, () => {
    console.log(`Servidor Backend rodando na porta ${PORT}`);
});