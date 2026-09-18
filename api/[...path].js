// Vercel Serverless Function Wrapper para Express
// Este arquivo é o entry point para o Vercel reconhecer a API

import app from './index.js';

// Export como handler serverless
// Vercel espera este formato específico
export default app;

// Também exportar como named export para compatibilidade
export { app };
