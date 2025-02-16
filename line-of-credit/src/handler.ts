import { APIGatewayEvent } from 'aws-lambda';
import { createApplicationHandler } from './handlers/createApplicationHandler';
import { disburseFundsHandler } from './handlers/disburseFundsHandler';
import { repayApplicationHandler } from './handlers/repayApplicationHandler';
import { cancelApplicationHandler } from './handlers/cancelApplicationHandler';

export const handler = async (event: APIGatewayEvent) => {
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
      default:
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Endpoint not found.' }),
        };
    }
  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error.' }),
    };
  }
};
