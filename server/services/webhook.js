const { errorResponse, successResponse } = require("../utils/service-utils");
const { logger } = require("../utils/logger");
const { HTTP_CODES, RESPONSE_MSGS, CONSTANTS } = require("../config/default");
const webhookQueue = require("../services/webhookQueue");
const { Provider } = require("../models/provider");

async function processNotification(params) {
  const { provider, payload } = params;

  try {
    const userData = await Provider.findOne({
      provider,
      "data.subscriptionId": payload.subscriptionId,
    })
      .select({ user: 1 })
      .lean();

    if (!userData) {
      logger.warn(
        `No user found for provider ${provider} and subscriptionId ${payload.subscriptionId}`
      );
      return errorResponse(HTTP_CODES.Not_Found, RESPONSE_MSGS.Not_Found);
    }

    const queueOptions = {
      payload,
      provider,
      localUserId: userData.user,
    };

    await webhookQueue.addToQueue(queueOptions);
    webhookQueue.processQueue(userData.user);

    return successResponse(
      HTTP_CODES.OK,
      RESPONSE_MSGS.OK,
      CONSTANTS.DEFAULT_RESPONSE
    );
  } catch (error) {
    logger.error("Error processing notification:", error);
    return errorResponse(
      HTTP_CODES.Internal_Server_Error,
      RESPONSE_MSGS.Internal_Error
    );
  }
}

module.exports = {
  processNotification,
};
