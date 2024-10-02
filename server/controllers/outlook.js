const webhookService = require("../services/webhook");
const { logger } = require("../utils/logger");
const {
  sendErrorResponse,
  sendTextSuccessResponse,
} = require("../utils/controller-utils");
const { HTTP_CODES, RESPONSE_MSGS } = require("../config/default");
const { decryptNotification } = require("../utils/outlook");

const processNotification = async (req, res) => {
  try {
    if (req.query.validationToken) {
      return sendTextSuccessResponse(res, req.query.validationToken);
    }

    const payload = Array.isArray(req.body?.value)
      ? req.body.value[0]
      : req.body?.value;

    if (!payload?.encryptedContent) {
      logger.error(RESPONSE_MSGS.Bad_Request);
      return sendErrorResponse(
        res,
        HTTP_CODES.Bad_Request,
        RESPONSE_MSGS.Bad_Request
      );
    }

    const params = {
      provider: req.query.provider,
      payload: {
        ...payload,
        encryptedContent: decryptNotification(payload.encryptedContent),
      },
    };

    const { errorObj, responseObj } = await webhookService.processNotification(
      params
    );

    if (errorObj) {
      return sendErrorResponse(res, errorObj.code, errorObj.message);
    }

    sendTextSuccessResponse(res);
  } catch (error) {
    logger.error(error);
    sendErrorResponse(
      res,
      HTTP_CODES.Internal_Server_Error,
      RESPONSE_MSGS.Internal_Error
    );
  }
};

module.exports = {
  processNotification,
};
