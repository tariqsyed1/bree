import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a DB connection pool for use in Handlers. 
// Also, create a generic query object for use in our handlers. 
const pool = new Pool({
  connectionString: "postgresql://your_postgres_username:your_postgres_password@host.docker.internal:5432/line_of_credit",
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
