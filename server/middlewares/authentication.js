const { verifyToken } = require("../utils/auth");
const { HTTP_CODES, RESPONSE_MSGS } = require("../config/default");
const { logger } = require("../utils/logger");
const { sendErrorResponse } = require("../utils/controller-utils");
const emailProvider = require("../providers/provider");

module.exports = {
  authenticate: async (req, res, next) => {
    try {
      if (req.headers?.authorization) {
        let token = req.headers.authorization.replace("Bearer ", "");
        let user = await verifyToken(token);
        if (!user) {
          logger.error(RESPONSE_MSGS.Auth_Fail);
          sendErrorResponse(res, HTTP_CODES.Auth_Fail, RESPONSE_MSGS.Auth_Fail);
          return;
        }
        if (
          !(await emailProvider(user.provider).validateAuthToken({
            payload: user,
          }))
        ) {
          logger.error(RESPONSE_MSGS.Auth_Fail);
          sendErrorResponse(res, HTTP_CODES.Auth_Fail, RESPONSE_MSGS.Auth_Fail);
          return;
        }
        req.user = user;
        next();
      } else {
        logger.error(RESPONSE_MSGS.Auth_Fail);
        sendErrorResponse(res, HTTP_CODES.Auth_Fail, RESPONSE_MSGS.Auth_Fail);
        return;
      }
    } catch (error) {
      logger.error(error);
      sendErrorResponse(
        res,
        HTTP_CODES.Internal_Server_Error,
        RESPONSE_MSGS.Internal_Error
      );
    }
  },
};
