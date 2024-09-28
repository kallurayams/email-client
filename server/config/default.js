module.exports.HTTP_CODES = {
    Internal_Server_Error: 500, //The server failed to fulfill a valid request
    OK: 200, //The request has succeeded
    AUTH_FAIL: 401, //Unauthorized error
    User_Not_Found: 404,
    Data_Not_Found: 404,
  };

  module.exports.RESPONSE_MSGS = {
    Internal_Error: "Internal Server Error",
    OK: "Success",
    AUTH_FAIL: "Authorization Failed",
    User_Not_Found: "User Not Found",
    Data_Not_Found: "Data Not Found",
  };

  module.exports.CONSTANTS = {
    SERVER_BASE_URL: "http://localhost:4000",
    DEFAULT_RESPONSE:{success: "Success"}
  };