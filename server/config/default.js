module.exports.HTTP_CODES = {
  Internal_Server_Error: 500, //The server failed to fulfill a valid request
  OK: 200, //The request has succeeded
  Auth_Fail: 401, //Unauthorized error
  Not_Found: 404,
  Bad_Request: 400, // The server could not understand the request due to invalid syntax or missing parameters
  Unprocessable_Entity: 422, //Invalid or incomplete response data
};

module.exports.RESPONSE_MSGS = {
  Internal_Error: "Internal Server Error",
  OK: "Success",
  Auth_Fail: "Authorization Failed",
  User_Not_Found: "User Not Found",
  Data_Not_Found: "Data Not Found",
  Bad_Request: "Invalid Request or Missing Parameters",
  Bad_Response: "Invalid or incomplete response data",
};

module.exports.ALLOWED_PROVIDERS = ["outlook"];
