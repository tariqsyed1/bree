import { APIGatewayEvent } from 'aws-lambda';
import { query } from '../db';
import { successResponse, errorResponse } from '../utils/response';
import { validateCreateApplicationInput } from '../utils/validators';

export const createApplicationHandler = async (event: APIGatewayEvent) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const validationErrors = validateCreateApplicationInput(body);

    if (validationErrors.length > 0) {
      return errorResponse(400, `Validation failed: ${validationErrors.join(', ')}`);
    }

    const { userId, requestedAmount, expressDelivery } = body;

    const result = await query(
      `INSERT INTO LineOfCreditApplications (user_id, requested_amount, state, express_delivery)
       VALUES ($1, $2, 'Open', $3) RETURNING *`,
      [userId, requestedAmount, expressDelivery || false]
    );

    return successResponse(201, result.rows[0]);
  } catch (error: any) {
    console.error('Error in createApplicationHandler:', error);

    if (error.code === '23505') {  // Example for PostgreSQL unique constraint error
      return errorResponse(409, 'Duplicate application detected.');
    }

    return errorResponse(500, 'Internal server error.');
  }
};
