import { APIGatewayEvent, Context, Callback } from 'aws-lambda';
import { createApplicationHandler } from './handlers/createApplicationHandler';

export const handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  console.log('Incoming request:', event);

  const { path, httpMethod } = event;

  try {
    switch (true) {
      case path === '/createApplication' && httpMethod === 'POST':
        return await createApplicationHandler(event);

      // Add more cases here for future endpoints
      // case path === '/disburseFunds' && httpMethod === 'POST':
      //   return await disburseFundsHandler(event);

      default:
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Endpoint not found' }),
        };
    }
  } catch (error) {
    console.error('Error handling request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error.' }),
    };
  }
};
