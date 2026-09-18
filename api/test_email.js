import { query } from './db.js';
import nodemailerLib from 'nodemailer';
const { createTransport } = nodemailerLib;

const testEmail = async () => {
    try {
        console.log('🧪 Testando envio de email...\n');

        // Buscar configurações do banco
        const result = await query('SELECT value FROM settings WHERE key = $1', ['smtp_config']);

        if (result.rows.length === 0) {
            console.error('❌ Configurações SMTP não encontradas no banco!');
            process.exit(1);
        }

        const config = JSON.parse(result.rows[0].value);

        console.log('📋 Configurações carregadas:');
        console.log(`   Host: ${config.smtp_host}`);
        console.log(`   Porta: ${config.smtp_port}`);
        console.log(`   Usuário: ${config.smtp_user}`);
        console.log(`   Segurança: ${config.smtp_secure}`);
        console.log('');

        // Configurar transporter
        const transporter = createTransport({
            service: 'gmail',
            host: config.smtp_host,
            port: parseInt(config.smtp_port),
            secure: false, // false para STARTTLS (porta 587)
            auth: {
                user: config.smtp_user,
                pass: config.smtp_pass
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        console.log('🔌 Verificando conexão SMTP...');
        await transporter.verify();
        console.log('✅ Conexão SMTP verificada com sucesso!\n');

        // Enviar email de teste
        console.log('📧 Enviando email de teste para: yamamotoallan@hotmail.com');

        const info = await transporter.sendMail({
            from: `"${config.from_name}" <${config.smtp_user}>`,
            to: 'yamamotoallan@hotmail.com',
            replyTo: config.from_email,
            subject: '✅ Teste SMTP - FIVE Ambientes Planejados',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #d4af37;">🎉 Sistema de Email Funcionando!</h2>
                    <p>Olá,</p>
                    <p>Este é um email de <strong>teste automático</strong> do sistema FIVE Ambientes Planejados.</p>
                    <hr style="border: 1px solid #e7dbcf; margin: 20px 0;">
                    <h3>Detalhes da Configuração:</h3>
                    <ul style="line-height: 1.8;">
                        <li><strong>Servidor SMTP:</strong> ${config.smtp_host}</li>
                        <li><strong>Porta:</strong> ${config.smtp_port}</li>
                        <li><strong>Segurança:</strong> ${config.smtp_secure}</li>
                        <li><strong>Remetente:</strong> ${config.from_name}</li>
                    </ul>
                    <hr style="border: 1px solid #e7dbcf; margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">
                        Email enviado em: ${new Date().toLocaleString('pt-BR')}
                    </p>
                    <p style="color: #999; font-size: 11px;">
                        Sistema FIVE Ambientes Planejados<br>
                        Este é um email automático, não responda.
                    </p>
                </div>
            `
        });

        console.log('\n✅ EMAIL ENVIADO COM SUCESSO!');
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Response: ${info.response}`);
        console.log('\n🎉 Teste concluído! Verifique a caixa de entrada do Hotmail.');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERRO ao enviar email:');
        console.error(`   ${error.message}`);
        console.error('\nDetalhes:', error);
        process.exit(1);
    }
};

testEmail();
