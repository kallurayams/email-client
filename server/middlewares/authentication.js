const { verifyToken } = require("../utils/auth");
const { HTTP_CODES, RESPONSE_MSGS } = require("../config/default");
const { logger } = require("../utils/logger");
const { sendErrorResponse } = require("../utils/controller-utils");

module.exports = {
    authenticate: async (req, res, next) => {
        try {
            if (req.headers?.authorization) {
                let token = req.headers.authorization;
                let user = await verifyToken(token);
                if (!user) {
                    logger.error(RESPONSE_MSGS.AUTH_FAIL);
                    sendErrorResponse(req, res, HTTP_CODES.AUTH_FAIL, RESPONSE_MSGS.AUTH_FAIL);
                    return;
                }
                req.user = user;
                next();
            } else {
                logger.error(RESPONSE_MSGS.AUTH_FAIL);
                sendErrorResponse(req, res, HTTP_CODES.AUTH_FAIL, RESPONSE_MSGS.AUTH_FAIL);
                return;
            }
        } catch (error) {
            logger.error(error);
            sendErrorResponse(req, res, HTTP_CODES.Internal_Server_Error, RESPONSE_MSGS.Internal_Error);
        }
    }
}