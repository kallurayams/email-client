const webhookService = require("../services/webhook");
const { logger } = require("../utils/logger");
const { sendErrorResponse, sendSuccessResponse} = require("../utils/controller-utils");
const { HTTP_CODES, RESPONSE_MSGS} = require("../config/default");
const config = require("../config/config");

const exportable = {
    send: async (req, res) => {
        try {
            // res.status(202).send();

            let params = {};
            params.query = req.query ?? {};
            params.body = req.body ?? {};

            if (req.query.hasOwnProperty("validationToken")) {
                res.set('Content-Type', 'text/plain');
                res.status(200).send(req.query.validationToken);
                return;
            }

            const {errorObj, responseObj} = await webhookService.send(params);
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
    subscribe: async (req, res) => {
        try {
            let params = {};
            params.user = req.user;
            const {errorObj, responseObj} = await webhookService.subscribe(params);
            if (errorObj) {
                sendErrorResponse(req, res, errorObj.code, errorObj.message);
                return;
            }
            sendSuccessResponse(req, res, responseObj.code, responseObj.message, responseObj.data);
        } catch (error) {
            logger.error(error);
            sendErrorResponse(req, res, HTTP_CODES.Internal_Server_Error, RESPONSE_MSGS.Internal_Error);
        }
    }
};

module.exports = exportable;