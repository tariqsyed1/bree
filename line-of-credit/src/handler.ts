import { APIGatewayEvent, Context, Callback } from 'aws-lambda';

export const handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
    console.log('Request received: ', event);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Hello, world!',
        }),
    };
};