const Joi = require("joi");
const emailService = require("../services/email");
const { logger } = require("../utils/logger");
const {
  sendErrorResponse,
  sendSuccessResponse,
} = require("../utils/controller-utils");
const { HTTP_CODES, RESPONSE_MSGS } = require("../config/default");

const getEmailSchema = Joi.object({
  filter: Joi.string()
    .valid("inbox", "junkEmail", "sentItems", "drafts", "archive")
    .allow("")
    .optional(),
  page: Joi.number().integer().min(1).optional(),
})
  .unknown(true)
  .required();

const getEmails = async (req, res) => {
  try {
    const params = {
      filter: req.query?.filter ?? "",
      page: req.query?.page ?? 1,
      user: req.user,
    };

    const { error, value } = getEmailSchema.validate(params);
    if (error) {
      logger.error("Invalid request parameters", { error });
      return sendErrorResponse(
        res,
        HTTP_CODES.Bad_Request,
        RESPONSE_MSGS.Bad_Request
      );
    }

    const { errorObj, responseObj } = await emailService.getEmails(value);
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
    logger.error("Error in getEmails", { error });
    sendErrorResponse(
      res,
      HTTP_CODES.Internal_Server_Error,
      RESPONSE_MSGS.Internal_Error
    );
  }
};

module.exports = {
  getEmails,
};
