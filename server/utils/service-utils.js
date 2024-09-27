module.exports = {
    successResponse: (code, message, data) => {
        return {
            responseObj: {
                code: code,
                message: message,
                data: data,
            },
        };
    },
    errorResponse: (code, message) => {
        return {
            errorObj: {
                code: code,
                message: message
            },
        }
    },
}