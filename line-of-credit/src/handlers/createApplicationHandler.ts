import { APIGatewayEvent } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/response';
import { validateCreateApplicationInput } from '../utils/validators';
import { dbQuery } from '../utils/dbQuery';

/* Handles creating a line of credit application
* Transitions the application state to "Open" upon creation.
* @param {APIGatewayEvent} event - The API Gateway request event.
* @returns {Promise<object>} - A success or error response.
*/
export const createApplicationHandler = async (event: APIGatewayEvent) => {
  try {
    const body = JSON.parse(event.body || '{}');
    // Validate required fields
    const validationErrors = validateCreateApplicationInput(body);

    if (validationErrors.length > 0) {
      return errorResponse(400, `Validation failed: ${validationErrors.join(', ')}`);
    }

    const { userId, requestedAmount, expressDelivery } = body;

    // Insert a new application in the "Open" state
    const { success, rows, error } = await dbQuery(
      `INSERT INTO LineOfCreditApplications (user_id, requested_amount, state, express_delivery)
       VALUES ($1, $2, 'Open', $3) RETURNING *`,
      [userId, requestedAmount, expressDelivery || false]
    );

    if (!success) {
      return errorResponse(500, error || 'Database query failed');
    }
    return successResponse(201, rows?.[0] || {});
  } catch (error) {
    console.error('Unexpected error in createApplicationHandler:', error);
    return errorResponse(500, 'Internal server error.');
  }
};
