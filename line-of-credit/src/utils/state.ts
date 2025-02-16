export const isValidTransition = (currentState: string, newState: string) => {
    const validTransitions: Record<string, string[]> = {
      Open: ['Cancelled', 'Rejected', 'Outstanding'],
      Outstanding: ['Repaid'],
    };
  
    return validTransitions[currentState]?.includes(newState);
  };
  