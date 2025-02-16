export const validateCreateApplicationInput = (body: any) => {
    const errors: string[] = [];
  
    if (!body.userId) errors.push('userId is required.');
    if (!body.requestedAmount || isNaN(body.requestedAmount) || body.requestedAmount <= 0) {
      errors.push('requestedAmount must be a positive number.');
    }
    if (body.expressDelivery !== undefined && typeof body.expressDelivery !== 'boolean') {
      errors.push('expressDelivery must be a boolean.');
    }
  
    return errors;
  };
  