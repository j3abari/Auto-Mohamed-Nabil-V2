require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./src/config/database');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        // Verify Supabase connection before accepting traffic
        await testConnection();

        app.listen(PORT, () => {
            logger.info(`🚗 Auto Mohamed Nabil V2 API running on port ${PORT}`);
            logger.info(`📍 Environment: ${process.env.NODE_ENV}`);
            logger.info(`🔗 Health: http://localhost:${PORT}/health`);
        });
    } catch (err) {
        logger.error('Failed to start server:', err);
        process.exit(1);
    }
}

start();
