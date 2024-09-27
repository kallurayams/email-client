const { logger } = require("../utils/logger");
const { HTTP_CODES, RESPONSE_MSGS } = require("../config/default");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/controller-utils");

const syncingService = require("../services/syncing");

const exportable = {
    getInitialSync: async (req, res) => {
        try {
            let params = {};
            params.userId = req.user._id;
            const { errorObj, responseObj } = await syncingService.getInitialSync(params);
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