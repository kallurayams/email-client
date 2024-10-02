const { errorResponse, successResponse } = require("../utils/service-utils");
const { logger } = require("../utils/logger");
const { HTTP_CODES, RESPONSE_MSGS } = require("../config/default");
const { User } = require("../models/user");
const { Provider } = require("../models/provider");
const auth = require("../utils/auth");
const emailProvider = require("../providers/provider");
const { v4: uuidv4 } = require("uuid");

const generateAuthUrl = async ({ provider }) => {
  const { errorObj, responseObj } = await emailProvider(
    provider
  ).generateAuthUrl();
  return errorObj ? { errorObj } : { responseObj };
};

const validateAuthCallback = async ({ provider, ...params }) => {
  try {
    const { errorObj, responseObj } = await emailProvider(
      provider
    ).validateAuthCallback(params);
    if (errorObj) return { errorObj };

    const { userEmail, userName } = responseObj.data;
    let user = await User.findOne({ email: userEmail, provider })
      .select("localUserId")
      .lean();

    if (!user) {
      const localUserId = uuidv4();
      user = await User.create({
        email: userEmail,
        name: userName,
        localUserId,
        provider,
      });
    }

    await Provider.updateOne(
      { provider, user: user.localUserId },
      { $set: { provider, user: user.localUserId } },
      { upsert: true }
    );

    const tokenPayload = {
      ...responseObj.data.tokenPayload,
      localUserId: user.localUserId,
      provider,
    };

    const { errorObj: webhookError, responseObj: webhookResponse } =
      await emailProvider(provider).subscribeToWebhook(tokenPayload);
    if (webhookError) return { errorObj: webhookError };

    tokenPayload.webhookSubscriptionExpiry =
      webhookResponse.data.subscriptionExpiry;

    await Provider.updateOne(
      { provider, user: user.localUserId },
      { $set: { "data.subscriptionId": webhookResponse.data.subscriptionId } }
    );

    const authToken = await auth.generateToken(tokenPayload);
    if (!authToken) {
      logger.error(RESPONSE_MSGS.Auth_Fail);
      return errorResponse(HTTP_CODES.Auth_Fail, RESPONSE_MSGS.Auth_Fail);
    }

    const finalResponse = {
      redirectionUrl: `${process.env.CLIENT_BASE_URL}${process.env.CLIENT_AUTH_REDIRECTION_PATH}?code=${authToken}`,
    };

    // Trigger async sync process
    emailProvider(provider).sync(tokenPayload);

    return successResponse(HTTP_CODES.OK, RESPONSE_MSGS.OK, finalResponse);
  } catch (error) {
    logger.error(error);
    return errorResponse(
      HTTP_CODES.Internal_Server_Error,
      RESPONSE_MSGS.Internal_Error
    );
  }
};

const refreshToken = async ({ authToken }) => {
  try {
    const decodedValue = await auth.verifyToken(authToken);
    if (!decodedValue) {
      return errorResponse(HTTP_CODES.Auth_Fail, RESPONSE_MSGS.Auth_Fail);
    }

    const userExists = await User.exists({
      localUserId: decodedValue.localUserId,
    });
    if (!userExists) {
      return errorResponse(HTTP_CODES.Auth_Fail, RESPONSE_MSGS.Auth_Fail);
    }

    const newData = await emailProvider(decodedValue.provider).refreshToken(
      decodedValue
    );
    if (!newData) {
      return errorResponse(HTTP_CODES.Auth_Fail, RESPONSE_MSGS.Auth_Fail);
    }

    const newToken = await auth.generateToken(newData);
    return successResponse(HTTP_CODES.OK, RESPONSE_MSGS.OK, {
      authToken: newToken,
    });
  } catch (error) {
    logger.error(error);
    return errorResponse(
      HTTP_CODES.Internal_Server_Error,
      RESPONSE_MSGS.Internal_Error
    );
  }
};

const getAccountInfo = async ({ localUserId }) => {
  try {
    const user = await User.findOne({ localUserId })
      .select("localUserId -_id")
      .lean();
    if (!user) {
      return errorResponse(HTTP_CODES.Not_Found, RESPONSE_MSGS.User_Not_Found);
    }
    return successResponse(HTTP_CODES.OK, RESPONSE_MSGS.OK, {
      localUserId: user.localUserId,
    });
  } catch (error) {
    logger.error(error);
    return errorResponse(
      HTTP_CODES.Internal_Server_Error,
      RESPONSE_MSGS.Internal_Error
    );
  }
};

module.exports = {
  generateAuthUrl,
  validateAuthCallback,
  refreshToken,
  getAccountInfo,
};
