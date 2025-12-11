import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
    PORT: process.env.PORT || '8080',
    NODE_ENV: process.env.NODE_ENV || 'development',
    REPO_TYPE: process.env.REPO_TYPE || 'memory',
    JWT_SECRET: process.env.JWT_SECRET || 'changeme',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
};