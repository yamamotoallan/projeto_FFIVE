import { query } from './db.js';
import bcrypt from 'bcryptjs';

const fixPassword = async () => {
    try {
        console.log('Atualizando senha do admin...');
        const hash = await bcrypt.hash('123', 10);
        const res = await query(
            "UPDATE users SET password_hash = $1 WHERE email = $2",
            [hash, 'admin@marcenaria.pro']
        );
        if (res.rowCount > 0) {
            console.log('✅ Senha atualizada com sucesso para admin@marcenaria.pro');
        } else {
            console.log('⚠️ Usuário não encontrado. Criando agora...');
            await query(
                "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)",
                ['Administrador', 'admin@marcenaria.pro', hash, 'admin']
            );
            console.log('✅ Usuário criado com sucesso.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Erro ao atualizar senha:', error);
        process.exit(1);
    }
};

fixPassword();
