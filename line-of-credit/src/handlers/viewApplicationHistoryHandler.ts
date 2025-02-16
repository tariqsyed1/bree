import { APIGatewayEvent } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/response';
import { dbQuery } from '../utils/dbQuery';

/**
 * Retrieves all line of credit applications and associated transactions for a specific user.
 * @param {APIGatewayEvent} event - The API Gateway request event.
 * @returns {Promise<object>} A success or error response containing the user's application history.
 */
export const viewApplicationHistoryHandler = async (event: APIGatewayEvent) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { userId } = body;

    // Validate input
    if (!userId) {
      return errorResponse(400, 'userId is required.');
    }

    // Fetch all applications for the user
    const { success: fetchSuccess, rows: fetchRows, error: fetchError } = await dbQuery(
      `SELECT 
        application_id, state, requested_amount, express_delivery, created_at, updated_at
       FROM LineOfCreditApplications 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    if (!fetchSuccess) return errorResponse(500, fetchError || 'Database fetch failed');

    if (!fetchRows?.length) {
      return successResponse(200, { message: 'No applications found for this user.' });
    }

    // For each application, fetch related transactions
    const applicationHistory = await Promise.all(
      fetchRows.map(async (app) => {
        const { success: transactionSuccess, rows: transactionRows, error: transactionError } = await dbQuery(
          `SELECT transaction_id, transaction_type, amount, created_at 
           FROM Transactions WHERE application_id = $1 ORDER BY created_at ASC`,
          [app.application_id]
        );

        return {
          ...app,
          transactions: transactionSuccess ? transactionRows : [],
        };
      })
    );

    return successResponse(200, applicationHistory);

  } catch (error) {
    console.error('Unexpected error in viewApplicationHistoryHandler:', error);
    return errorResponse(500, 'Internal server error.');
  }
};
