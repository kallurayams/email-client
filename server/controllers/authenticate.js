const authService = require("../services/authenticate");
const { logger } = require("../utils/logger");
const { sendErrorResponse, sendSuccessResponse} = require("../utils/controller-utils");
const { HTTP_CODES, RESPONSE_MSGS} = require("../config/default");
const config = require("../config/config");

const exportable = {
    authUrl: async (req, res) => {
        try {
            const {errorObj, responseObj} = await authService.authUrl();
            if (errorObj) {
                sendErrorResponse(req, res, errorObj.code, errorObj.message);
                return;
            }
            sendSuccessResponse(req, res, responseObj.code, responseObj.message, responseObj.data);
        } catch (error) {
            logger.error(error);
            sendErrorResponse(req, res, HTTP_CODES.Internal_Server_Error, RESPONSE_MSGS.Internal_Error);
        }
    },
    verify: async (req, res) => {
        try {
            let token = req.query.code;
            const {errorObj, responseObj} = await authService.verify(token);
            if (errorObj) {
                res.redirect(config.clientBasePath);
                return;
            }
            let redirectionUrl = config.clientBasePath + config.clientRedirectionPath + "?code=" + responseObj.data.token;
            res.redirect(redirectionUrl) ;
        } catch (error) {
            logger.error(error);
            res.redirect(config.clientBasePath);
        }
    },
};

module.exports = exportable;