import mysql from 'mysql2/promise';
import postgres from 'postgres';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: '../../../../.env' });

// MySQL connection
export const getMysqlConnection = async () => {
    return await mysql.createConnection({
        host: process.env.WP_HOST || 'localhost',
        user: process.env.WP_USERNAME || 'wordpress',
        password: process.env.WP_PASSWORD || 'wordpress',
        database: process.env.WP_DATABASE || 'wordpress',
        port: process.env.WP_PORT || 3306
    });
};

// PostgreSQL connection
export const sql = postgres({
    host: process.env.PG_HOST || 'localhost',
    user: process.env.PG_USERNAME || 'ecommerce_user',
    password: process.env.PG_PASSWORD || 'test',
    database: process.env.PG_DATABASE || 'ecommerce_db',
    port: Number(process.env.PG_PORT) || 5432
}); 