const { logger } = require("../utils/logger");
const { HTTP_CODES, RESPONSE_MSGS } = require("../config/default");
const { errorResponse, successResponse } = require("../utils/service-utils");
const userStates = require("../services/userStateManager");

/**
 * Retrieves the process status for a given user.
 * @param {Object} params - The parameters object.
 * @param {string} params.localUserId - The local user ID.
 * @returns {Promise<Object>} The response object containing the process status.
 */
async function getProcessStatus({ localUserId }) {
  try {
    const processStatus = {
      isResyncing: userStates.getIsResyncing(localUserId),
      isSyncing: userStates.getIsProcessing(localUserId),
    };

    return successResponse(
      HTTP_CODES.Success,
      RESPONSE_MSGS.Success,
      processStatus
    );
  } catch (error) {
    logger.error("Error in getProcessStatus:", error);
    return errorResponse(
      HTTP_CODES.Internal_Server_Error,
      RESPONSE_MSGS.Internal_Error
    );
  }
}

module.exports = {
  getProcessStatus,
};
