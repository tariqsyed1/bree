export const successResponse = (statusCode: number, body: any) => ({
    statusCode,
    body: JSON.stringify(body),
  });
  
  export const errorResponse = (statusCode: number, message: string) => ({
    statusCode,
    body: JSON.stringify({ error: message }),
  });