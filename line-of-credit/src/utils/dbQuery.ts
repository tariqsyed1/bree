import { query } from '../db';

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
