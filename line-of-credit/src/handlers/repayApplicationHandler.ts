import { APIGatewayEvent } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/response';
import { dbQuery } from '../utils/dbQuery';

/**
 * Handles repayment for an outstanding line of credit application.
 * If the total repayment meets or exceeds the requested amount, the state transitions to "Repaid".
 * @param {APIGatewayEvent} event - The API Gateway request event.
 * @returns {Promise<object>} A success or error response.
 */
export const repayApplicationHandler = async (event: APIGatewayEvent) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { applicationId, repaymentAmount } = body;

    // Validate input
    if (!applicationId || !repaymentAmount || isNaN(repaymentAmount) || repaymentAmount <= 0) {
      return errorResponse(400, 'applicationId and repaymentAmount (positive number) are required.');
    }

    // Fetch current state and total repayments
    const { success: fetchSuccess, rows: fetchRows, error: fetchError } = await dbQuery(
      `SELECT state, requested_amount,
              COALESCE((SELECT SUM(amount) FROM Transactions WHERE application_id = $1 AND transaction_type = 'Repayment'), 0) AS total_repaid
       FROM LineOfCreditApplications WHERE application_id = $1`,
      [applicationId]
    );

    if (!fetchSuccess) return errorResponse(500, fetchError || 'Database fetch failed');
    if (!fetchRows?.length) return errorResponse(404, 'Application not found.');

    const application = fetchRows[0];
    if (application.state !== 'Outstanding') {
      return errorResponse(400, `Cannot repay an application in ${application.state} state.`);
    }

    const newTotalRepaid = parseFloat(application.total_repaid) + parseFloat(repaymentAmount);

    // Log the repayment as a transaction
    const { success: insertSuccess, error: insertError } = await dbQuery(
      `INSERT INTO Transactions (application_id, transaction_type, amount) VALUES ($1, 'Repayment', $2)`,
      [applicationId, repaymentAmount]
    );

    if (!insertSuccess) return errorResponse(500, insertError || 'Database insert failed');

    // Check if repayment completes the requested amount and update state if needed
    if (newTotalRepaid >= parseFloat(application.requested_amount)) {
      const { success: updateSuccess, error: updateError } = await dbQuery(
        `UPDATE LineOfCreditApplications SET state = 'Repaid', updated_at = NOW() WHERE application_id = $1`,
        [applicationId]
      );

      if (!updateSuccess) return errorResponse(500, updateError || 'Database update failed');
    }

    return successResponse(200, {
      message: 'Repayment processed successfully.',
      totalRepaid: newTotalRepaid,
      state: newTotalRepaid >= parseFloat(application.requested_amount) ? 'Repaid' : 'Outstanding',
    });

  } catch (error) {
    console.error('Unexpected error in repayApplicationHandler:', error);
    return errorResponse(500, 'Internal server error.');
  }
};
