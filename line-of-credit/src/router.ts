import { APIGatewayEvent } from 'aws-lambda';
import { createApplicationHandler } from './handlers/createApplicationHandler';
import { disburseFundsHandler } from './handlers/disburseFundsHandler';
import { repayApplicationHandler } from './handlers/repayApplicationHandler';
import { cancelApplicationHandler } from './handlers/cancelApplicationHandler';
import { viewApplicationHistoryHandler } from './handlers/viewApplicationHistoryHandler';
import { rejectApplicationHandler } from './handlers/rejectApplicationHandler';

/* 
* Main routing logic. We recieve a request, and then route that request to the specific handler.
* Handlers are responsible for executing business logic. We have handlers for all API endpoints. 
*/
export const router = async (event: APIGatewayEvent) => {
  console.log('Received request:', event.httpMethod, event.path);

  try {
    switch (true) {
      case event.path === '/createApplication' && event.httpMethod === 'POST':
        return await createApplicationHandler(event);
      case event.path === '/disburseFunds' && event.httpMethod === 'POST':
        return await disburseFundsHandler(event);
      case event.path === '/repayApplication' && event.httpMethod === 'POST':
        return await repayApplicationHandler(event);
      case event.path === '/cancelApplication' && event.httpMethod === 'POST':
        return await cancelApplicationHandler(event);
      case event.path === '/viewApplicationHistory' && event.httpMethod === 'POST':
        return await viewApplicationHistoryHandler(event);
      case event.path === '/rejectApplication' && event.httpMethod === 'POST':
        return await rejectApplicationHandler(event);

      // If endpoint is not valid, return 404. 
      default:
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Endpoint not found.' }),
        };
    }
  } catch (error) {
    // Catch any errors returned by the handler. Return HTTP 500 to client.
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error.' }),
    };
  }
};
