import postgres from 'postgres'
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sql = postgres({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  debug: process.env.PG_DEBUG
})

export default sql