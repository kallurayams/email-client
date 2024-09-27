const { logger } = require("./logger");

module.exports = {
    sendSuccessResponse: (req, res, code, message, data) => {
        if (!code) code = 200;
        if (!message) message = "Success";
        const status = "Success";
        res.status(code).json({
            code: code,
            status: status,
            message: message,
            data: data,
            timestamp: new Date(),
        });
    },
    sendErrorResponse: (req, res, code, message) => {
        if (!code) code = 400;
        if (!message) message = "Failure";
        let status = "Failure";
        res.status(code).json({
            code: code,
            status: status,
            message: message,
            timestamp: new Date(),
        });
    },
};
