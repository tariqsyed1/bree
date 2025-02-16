import { APIGatewayEvent } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/response';
import { dbQuery } from '../utils/dbQuery';

/**
 * Rejects a line of credit application if it is in the "Open" state.
 * This action is restricted to admin users.
 * @param {APIGatewayEvent} event - The API Gateway request event.
 * @returns {Promise<object>} A success or error response.
 */
export const rejectApplicationHandler = async (event: APIGatewayEvent) => {
  try {
    const queryParams = event.queryStringParameters || {};
    const { isAdmin } = queryParams;

    // Ensure only admin users can access this endpoint
    if (isAdmin !== 'true') {
      return errorResponse(403, 'Unauthorized access. Admin privileges are required.');
    }

    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { applicationId } = body;

    // Validate input
    if (!applicationId) {
      return errorResponse(400, 'applicationId is required.');
    }

    // Fetch current state of the application
    const { success: fetchSuccess, rows: fetchRows, error: fetchError } = await dbQuery(
      `SELECT state FROM LineOfCreditApplications WHERE application_id = $1`,
      [applicationId]
    );

    if (!fetchSuccess) return errorResponse(500, fetchError || 'Database fetch failed');
    if (!fetchRows?.length) return errorResponse(404, 'Application not found.');

    // Ensure the application is in the "Open" state
    const application = fetchRows[0];
    if (application.state !== 'Open') {
      return errorResponse(400, `Cannot reject an application in ${application.state} state.`);
    }

    // Update application state to 'Rejected'
    const { success: updateSuccess, error: updateError } = await dbQuery(
      `UPDATE LineOfCreditApplications SET state = 'Rejected', updated_at = NOW() WHERE application_id = $1`,
      [applicationId]
    );

    if (!updateSuccess) return errorResponse(500, updateError || 'Database update failed');

    return successResponse(200, { message: 'Application rejected successfully.' });

  } catch (error) {
    console.error('Unexpected error in rejectApplicationHandler:', error);
    return errorResponse(500, 'Internal server error.');
  }
};
