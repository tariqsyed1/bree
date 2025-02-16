import { APIGatewayEvent } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/response';
import { dbQuery } from '../utils/dbQuery';

export const rejectApplicationHandler = async (event: APIGatewayEvent) => {
  try {
    const queryParams = event.queryStringParameters || {};
    const { isAdmin } = queryParams;

    if (isAdmin !== 'true') {
      return errorResponse(403, 'Unauthorized access. Admin privileges are required.');
    }

    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { applicationId } = body;

    if (!applicationId) {
      return errorResponse(400, 'applicationId is required.');
    }

    // Step 1: Fetch current state of the application
    const { success: fetchSuccess, rows: fetchRows, error: fetchError } = await dbQuery(
      `SELECT state FROM LineOfCreditApplications WHERE application_id = $1`,
      [applicationId]
    );

    if (!fetchSuccess) return errorResponse(500, fetchError || 'Database fetch failed');
    if (!fetchRows?.length) return errorResponse(404, 'Application not found.');

    const application = fetchRows[0];
    if (application.state !== 'Open') {
      return errorResponse(400, `Cannot reject an application in ${application.state} state.`);
    }

    // Step 2: Update application state to 'Rejected'
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
