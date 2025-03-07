import { APIGatewayEvent } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/response';
import { dbQuery } from '../utils/dbQuery';

/* Handles disbursement of funds from of credit application.
* Transitions the application from "Open" to "Outstanding" if the disbursement condition is met
*/
export const disburseFundsHandler = async (event: APIGatewayEvent) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { applicationId, disbursementAmount } = body;

    // Validate input
    if (!applicationId || !disbursementAmount || isNaN(disbursementAmount) || disbursementAmount <= 0) {
      return errorResponse(400, 'applicationId and disbursementAmount (positive number) are required.');
    }

    // Fetch application details and validate state
    const { success: fetchSuccess, rows: fetchRows, error: fetchError } = await dbQuery(
      `SELECT state, requested_amount FROM LineOfCreditApplications WHERE application_id = $1`,
      [applicationId]
    );

    if (!fetchSuccess) return errorResponse(500, fetchError || 'Database fetch failed');
    if (!fetchRows?.length) return errorResponse(404, 'Application not found.');

    // Ensure that the application is in the "Open" state before distributing
    const application = fetchRows[0];
    if (application.state !== 'Open' && application.state !== 'Outstanding' && application.state !== 'Repaid') {
      return errorResponse(400, `Cannot disburse funds for an application in ${application.state} state.`);
    }

    // Ensure that disbursement does not exceed the request amount
    if (disbursementAmount > application.requested_amount) {
      return errorResponse(400, 'Disbursement amount exceeds requested amount.');
    }

    // Update application state to "Outstanding"
    const { success: updateSuccess, error: updateError } = await dbQuery(
      `UPDATE LineOfCreditApplications SET state = 'Outstanding', updated_at = NOW() WHERE application_id = $1`,
      [applicationId]
    );

    if (!updateSuccess) return errorResponse(500, updateError || 'Database update failed');

    // Add disbursement to transactions table
    await dbQuery(
      `INSERT INTO Transactions (application_id, transaction_type, amount) VALUES ($1, 'Disbursement', $2)`,
      [applicationId, disbursementAmount]
    );

    return successResponse(200, { message: 'Funds disbursed successfully.' });

  } catch (error) {
    console.error('Unexpected error in disburseFundsHandler:', error);
    return errorResponse(500, 'Internal server error.');
  }
};
