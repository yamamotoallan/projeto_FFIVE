-- Criar usuário admin no banco de dados
-- Execute este SQL no Neon.tech SQL Editor

BEGIN;

-- Deletar usuário admin se já existir (para evitar duplicatas)
DELETE FROM users WHERE email = 'admin@admin.com';

-- Criar usuário admin
-- Senha: 123
-- Hash bcrypt de '123': $2a$10$N9qo8uLOickgx2ZrVzY6jeerQrIRv7A48YHy.H9P.wUW3Zq2MZHPu
INSERT INTO users (email, name, password, role, created_at, updated_at)
VALUES (
    'admin@admin.com',
    'Administrador',
    '$2a$10$N9qo8uLOickgx2ZrVzY6jeerQrIRv7A48YHy.H9P.wUW3Zq2MZHPu',
    'admin',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

COMMIT;

-- Verificar se foi criado
SELECT id, email, name, role, created_at FROM users WHERE email = 'admin@admin.com';
