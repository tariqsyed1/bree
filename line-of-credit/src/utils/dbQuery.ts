import { query } from '../db';

/**
 * Executes a database query and handles common errors.
 * @param {string} sql - The SQL query string to execute.
 * @param {any[]} params - An array of parameters to bind to the query.
 * @returns {Promise<{ success: boolean; rows?: any[]; error?: string }>} 
 * Returns the query result or a standardized error message.
 */
export const dbQuery = async (sql: string, params: any[] = []) => {
  try {
    const result = await query(sql, params);
    return { success: true, rows: result.rows };
  } catch (error: any) {
    console.error('Database error:', error);

    let errorMessage = 'Internal database error.';
    if (error.code === '23505') {  // Unique constraint violation
      errorMessage = 'Duplicate record detected.';
    } else if (error.code === '23503') {  // Foreign key violation
      errorMessage = 'Invalid reference in the request.';
    } else if (error.code === '22P02') {  // Invalid input syntax
      errorMessage = 'Invalid input format.';
    }

    return { success: false, error: errorMessage };
  }
};
