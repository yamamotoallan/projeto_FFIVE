// API Health Check Endpoint
// Returns server status and database connectivity

import express from 'express';
import pool from './db.js';

const router = express.Router();

router.get('/health', async (req, res) => {
    const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        services: {
            database: 'unknown',
            cloudinary: 'unknown'
        }
    };

    // Check database connection
    try {
        await pool.query('SELECT 1');
        healthCheck.services.database = 'connected';
    } catch (error) {
        healthCheck.status = 'degraded';
        healthCheck.services.database = 'disconnected';
    }

    // Check Cloudinary config (just verify env vars exist)
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        healthCheck.services.cloudinary = 'configured';
    } else {
        healthCheck.services.cloudinary = 'not_configured';
        if (process.env.NODE_ENV === 'production') {
            healthCheck.status = 'degraded';
        }
    }

    const httpStatus = healthCheck.status === 'healthy' ? 200 : 503;
    res.status(httpStatus).json(healthCheck);
});

export default router;
