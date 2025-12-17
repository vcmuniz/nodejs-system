import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
    PORT: process.env.PORT || '8080',
    NODE_ENV: process.env.NODE_ENV || 'development',
    REPO_TYPE: process.env.REPO_TYPE || 'memory',
    JWT_SECRET: process.env.JWT_SECRET || 'changeme',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    APP_DOMAIN: process.env.APP_DOMAIN || 'http://localhost:3000',
    EVOLUTION_API_URL: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
    EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY || '',
};