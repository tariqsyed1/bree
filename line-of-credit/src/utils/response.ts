/**
 * Generates a success response for API Gateway.
 * @param {number} statusCode - HTTP status code (e.g., 200, 201).
 * @param {any} body - The response body to return as JSON.
 * @returns {object} Formatted response for API Gateway.
 */
export const successResponse = (statusCode: number, body: any) => ({
  statusCode,
  body: JSON.stringify(body),
});

/**
 * Generates an error response for API Gateway.
 * @param {number} statusCode - HTTP status code (e.g., 400, 404).
 * @param {any} body - The response body to return as JSON.
 * @returns {object} Formatted response for API Gateway.
 */
export const errorResponse = (statusCode: number, message: string) => ({
  statusCode,
  body: JSON.stringify({ error: message }),
});