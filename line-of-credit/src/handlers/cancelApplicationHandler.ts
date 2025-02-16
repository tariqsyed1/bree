import { APIGatewayEvent } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/response';
import { dbQuery } from '../utils/dbQuery';

/**
 * Cancels a line of credit application if it is in the "Open" state.
 * Transitions the application state to "Cancelled".
 * @param {APIGatewayEvent} event - The API Gateway request event.
 * @returns {Promise<object>} A success or error response.
 */
export const cancelApplicationHandler = async (event: APIGatewayEvent) => {
  try {
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

    // Validate that application is in Open state
    const application = fetchRows[0];
    if (application.state !== 'Open') {
      return errorResponse(400, `Cannot cancel an application in ${application.state} state.`);
    }

    // Update application state to 'Cancelled'
    const { success: updateSuccess, error: updateError } = await dbQuery(
      `UPDATE LineOfCreditApplications SET state = 'Cancelled', updated_at = NOW() WHERE application_id = $1`,
      [applicationId]
    );

    if (!updateSuccess) return errorResponse(500, updateError || 'Database update failed');

    return successResponse(200, { message: 'Application cancelled successfully.' });

  } catch (error) {
    console.error('Unexpected error in cancelApplicationHandler:', error);
    return errorResponse(500, 'Internal server error.');
  }
};
