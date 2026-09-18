import express from 'express';
import cors from 'cors';
import multer from 'multer';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Configuração de Variáveis de Ambiente (Simulação se não houver .env carregado nativamente no dev local)
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_UNSAFE_FOR_PRODUCTION';
const PORT = process.env.PORT || 3000;

// Inicializa o app
const app = express();

// Middleware de Segurança
app.use(helmet());
app.use(cors());
app.use(express.json());

// Configuração de Upload para Vercel (Memória ao invés de Disco)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- SCHEMAS DE VALIDAÇÃO (ZOD) ---
const LoginSchema = z.object({
    email: z.string().email('Formato de email inválido'),
    password: z.string().min(1, 'Senha é obrigatória')
});

const UserSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Formato de email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    role: z.enum(['admin', 'user', 'diretoria']).optional()
});

// --- DADOS MOCKADOS EM MEMÓRIA (COM HASH) ---
// Senha padrão '123' hash: $2a$10$X7.G..
// Para fins didáticos, vamos inicializar com senhas já hasheadas ou hashear no startup (mas startup é ruim em serverless).
// Vamos assumir que '123' -> hash abaixo.
const DEFAULT_HASH = '$2a$10$wWqWd.o.7j/..examplehash..replace_with_real_one_in_prod';
// Na prática, em memória, para esse demo funcionar sem DB real, vamos ter que hashear na hora ou usar um fixo conhecido.
// Vou usar um hash real de '123' para funcionar o login:
// $2a$10$Z3.gB.e.f.g.h... (exemplo fictício, vou gerar no código se fosse persistente, mas aqui vou usar comparacao direta se falhar o hash fixo)

let MOCK_USERS = [
    { id: 1, name: 'Administrador', email: 'admin@marcenaria.pro', role: 'admin', passwordHash: '$2a$10$NXaiG/..real_hash_of_123_would_go_here' },
    { id: 2, name: 'Vendedor', email: 'vendedor@marcenaria.pro', role: 'user', passwordHash: '...' }
];

// Helper para inicializar Hashes (Apenas para esse Mock em Memória funcionar)
const initMockHashes = async () => {
    const hash = await bcrypt.hash('123', 10);
    MOCK_USERS = [
        { id: 1, name: 'Administrador', email: 'admin@marcenaria.pro', role: 'admin', passwordHash: hash },
        { id: 2, name: 'Vendedor', email: 'vendedor@marcenaria.pro', role: 'user', passwordHash: hash }
    ];
};
initMockHashes(); // Roda na inicialização da instância (Cold Start no Vercel vai resetar isso, ok para demo)
