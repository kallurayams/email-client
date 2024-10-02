const successResponse = (code, message, data) => ({
  responseObj: { code, message, data },
});
const errorResponse = (code, message) => ({
  errorObj: { code, message },
});

module.exports = {
  successResponse,
  errorResponse,
};
