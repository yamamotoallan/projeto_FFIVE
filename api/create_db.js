import { query } from './db.js';
import pool from './db.js';

const createDatabase = async () => {
    try {
        console.log('Conectado ao postgres. Verificando existência do banco "marcenaria"...');

        // Verifica se banco existe
        const check = await query("SELECT 1 FROM pg_database WHERE datname = 'marcenaria'");

        if (check.rows.length === 0) {
            console.log('Banco "marcenaria" não encontrado. Criando...');
            // CREATE DATABASE não pode ser executado em bloco de transação, então usamos query direta do pool se possível
            // Mas aqui estamos usando o wrapper 'query'.
            await query('CREATE DATABASE marcenaria');
            console.log('Banco "marcenaria" criado com sucesso!');
        } else {
            console.log('Banco "marcenaria" já existe.');
        }

    } catch (error) {
        console.error('Erro ao gerenciar banco:', error);
    } finally {
        await pool.end();
    }
};

createDatabase();
