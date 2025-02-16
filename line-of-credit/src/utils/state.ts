/**
 * TODO: Implement this function within handlers to promote code reuseability.
 * @param currentState current state of application
 * @param newState new state of application
 * @returns true if transition is valid, false otherwise
 */

export const isValidTransition = (currentState: string, newState: string) => {
  const validTransitions: Record<string, string[]> = {
    Open: ['Cancelled', 'Rejected', 'Outstanding'],
    Outstanding: ['Repaid'],
  };

  return validTransitions[currentState]?.includes(newState);
};
