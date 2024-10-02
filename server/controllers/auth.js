const Joi = require("joi");
const authService = require("../services/auth");
const { logger } = require("../utils/logger");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendRedirectResponse,
} = require("../utils/controller-utils");
const {
  HTTP_CODES,
  RESPONSE_MSGS,
  ALLOWED_PROVIDERS,
} = require("../config/default");

const generateAuthUrlSchema = Joi.object({
  provider: Joi.string()
    .valid(...ALLOWED_PROVIDERS)
    .required(),
});

const validateAuthCallbackSchema = Joi.object({
  provider: Joi.string()
    .valid(...ALLOWED_PROVIDERS)
    .required(),
}).unknown(true);

const refreshTokenSchema = Joi.object({
  authToken: Joi.string().required(),
});

const getAccountInfoSchema = Joi.object({
  localUserId: Joi.string().required(),
});

const generateAuthUrl = async (req, res) => {
  try {
    const params = await validateParams(req.query, generateAuthUrlSchema);
    const { errorObj, responseObj } = await authService.generateAuthUrl(params);
    handleServiceResponse(req, res, errorObj, responseObj);
  } catch (error) {
    handleError(req, res, error);
  }
};

const validateAuthCallback = async (req, res) => {
  try {
    const params = await validateParams(req.query, validateAuthCallbackSchema, {
      stripUnknown: false,
    });
    const homePageUrl = `${process.env.CLIENT_BASE_URL}${process.env.CLIENT_HOMEPAGE_PATH}`;
    const { errorObj, responseObj } = await authService.validateAuthCallback(
      params
    );

    if (errorObj) {
      sendRedirectResponse(res, homePageUrl);
    } else {
      sendRedirectResponse(res, responseObj.data.redirectionUrl);
    }
  } catch (error) {
    logger.error(error);
    sendRedirectResponse(res, homePageUrl);
  }
};

const refreshToken = async (req, res) => {
  try {
    const params = await validateParams(
      { authToken: req.headers?.authorization },
      refreshTokenSchema
    );
    const { errorObj, responseObj } = await authService.refreshToken(params);
    handleServiceResponse(req, res, errorObj, responseObj);
  } catch (error) {
    handleError(req, res, error);
  }
};

const getAccountInfo = async (req, res) => {
  try {
    const params = await validateParams(
      { localUserId: req.user?.localUserId },
      getAccountInfoSchema
    );
    const { errorObj, responseObj } = await authService.getAccountInfo(params);
    handleServiceResponse(req, res, errorObj, responseObj);
  } catch (error) {
    handleError(req, res, error);
  }
};

// Helper functions
const validateParams = async (params, schema, options = {}) => {
  const { error, value } = schema.validate(params, options);
  if (error) {
    logger.error(error);
    throw new Error(RESPONSE_MSGS.Bad_Request);
  }
  return value;
};

const handleServiceResponse = (req, res, errorObj, responseObj) => {
  if (errorObj) {
    sendErrorResponse(res, errorObj.code, errorObj.message);
  } else {
    sendSuccessResponse(
      res,
      responseObj.code,
      responseObj.message,
      responseObj.data
    );
  }
};

const handleError = (req, res, error) => {
  logger.error(error);
  sendErrorResponse(
    res,
    HTTP_CODES.Internal_Server_Error,
    RESPONSE_MSGS.Internal_Error
  );
};

module.exports = {
  generateAuthUrl,
  validateAuthCallback,
  refreshToken,
  getAccountInfo,
};
