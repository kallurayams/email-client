const Joi = require("joi");
const { logger } = require("../utils/logger");
const { HTTP_CODES, RESPONSE_MSGS } = require("../config/default");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/controller-utils");
const syncService = require("../services/sync");

const getProcessStatusSchema = Joi.object({
  localUserId: Joi.string().required(),
});

const getProcessStatus = async (req, res) => {
  try {
    const params = { localUserId: req.user.localUserId || "" };

    const { error } = getProcessStatusSchema.validate(params);
    if (error) {
      logger.error(error);
      return sendErrorResponse(
        res,
        HTTP_CODES.Bad_Request,
        RESPONSE_MSGS.Bad_Request
      );
    }

    const { errorObj, responseObj } = await syncService.getProcessStatus(
      params
    );

    if (errorObj) {
      return sendErrorResponse(res, errorObj.code, errorObj.message);
    }

    sendSuccessResponse(
      res,
      responseObj.code,
      responseObj.message,
      responseObj.data
    );
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
  getProcessStatus,
};
