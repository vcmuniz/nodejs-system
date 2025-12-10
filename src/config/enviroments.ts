import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
    PORT: process.env.PORT || '8080',
    NODE_ENV: process.env.NODE_ENV || 'development'
};