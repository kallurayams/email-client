/**
 * Creates and returns a user state manager with methods to handle processing and resyncing states.
 * @returns {Object} An object with methods to get and set processing and resyncing states for users.
 */
const createUserStateManager = () => {
  const states = {
    processing: new Set(),
    resyncing: new Set(),
  };

  const toggleUserState = (stateType, userId, value) => {
    value ? states[stateType].add(userId) : states[stateType].delete(userId);
  };

  return {
    getIsProcessing: (userId) => states.processing.has(userId),
    setIsProcessing: (userId, value) =>
      toggleUserState("processing", userId, value),
    getIsResyncing: (userId) => states.resyncing.has(userId),
    setIsResyncing: (userId, value) =>
      toggleUserState("resyncing", userId, value),
  };
};

module.exports = createUserStateManager();
