const DEFAULT_SUCCESS_CODE = 200;
const DEFAULT_ERROR_CODE = 400;
const REDIRECT_CODE = 302;

const sendResponse = (res, code, status, message, data = null) => {
  const response = {
    code,
    status,
    message,
    timestamp: new Date(),
  };

  if (data) response.data = data;

  res.status(code).json(response);
};

module.exports = {
  sendSuccessResponse: (
    res,
    code = DEFAULT_SUCCESS_CODE,
    message = "Success",
    data
  ) => {
    sendResponse(res, code, "Success", message, data);
  },

  sendErrorResponse: (res, code = DEFAULT_ERROR_CODE, message = "Failure") => {
    sendResponse(res, code, "Failure", message);
  },

  sendRedirectResponse: (res, url) => {
    res.redirect(REDIRECT_CODE, url);
  },

  sendTextSuccessResponse: (res, message = "OK") => {
    res.status(DEFAULT_SUCCESS_CODE).type("text/plain").send(message);
  },
};
