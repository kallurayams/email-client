const { errorResponse, successResponse } = require("../utils/service-utils");
const config = require("../config/config");
const { logger } = require("../utils/logger");
const { HTTP_CODES, RESPONSE_MSGS } = require("../config/default");
const msal = require('@azure/msal-node');
const { User } = require("../models/user");
const auth = require("../utils/auth");
const utils = require("../utils/utils");
const syncService = require("./syncing");

const exportable = {
    authUrl: async () => {
        try {
            const options = {
                auth: {
                    clientSecret: config.oauthClientSecret,
                    authority: config.oauthAuthority,
                    clientId: config.oauthClientId
                }
            };
            const cca = new msal.ConfidentialClientApplication(options);
            const authCodeUrlParameters = {
                scopes: ["user.read", "mail.read"],
                redirectUri: config.serverBaseUrl + config.apiPath + "/authenticate/verify",
            };
            const response = await cca.getAuthCodeUrl(authCodeUrlParameters);
            return successResponse(HTTP_CODES.OK, RESPONSE_MSGS.OK, { redirectionUrl: response});
        } catch (error) {
            logger.error(error);
            return errorResponse(HTTP_CODES.Internal_Server_Error, RESPONSE_MSGS.Internal_Error);
        }
    },
    verify: async (token) => {
        try {
            const options = {
                auth: {
                    clientSecret: config.oauthClientSecret,
                    authority: config.oauthAuthority,
                    clientId: config.oauthClientId
                }
            };
            const authCodeUrlParameters = {
                scopes: ["user.read", "mail.read"],
                redirectUri: config.serverBaseUrl + config.apiPath + "/authenticate/verify",
                code: token,
            };
            const cca = new msal.ConfidentialClientApplication(options);
            const response = await cca.acquireTokenByCode(authCodeUrlParameters);

            if (!(response?.account && response.account.username && response.account.name && response.accessToken && response.expiresOn)) {
                logger.error(RESPONSE_MSGS.AUTH_FAIL);
                return errorResponse(HTTP_CODES.AUTH_FAIL, RESPONSE_MSGS.AUTH_FAIL);
            }

            let newToken;
            //Check if user exists based on the email address
            const userExists = await User.findOne({emailAddress: response.account.username}).lean();
            //If there, update access token
            if (userExists) {
                let updateObj = {
                    $set: {
                        outlookParams: {
                            accessToken: response.accessToken,
                            accessTokenExpiry: response.expiresOn,
                        },
                        task: [{taskName: "initial-sync", total: 0, completed: 0}],
                    },
                };
                await User.updateOne({_id: userExists._id}, updateObj);
                let tokenData = {};
                tokenData._id = userExists._id;
                tokenData.accessToken = response.accessToken;
                newToken = await auth.generateToken(tokenData, response.expiresOn);
            } else {
                const userResult = await User.create({
                    accessToken: response.accessToken,
                    emailAddress: response.account.username,
                    fullName: response.account.name,
                    localId: utils.generateLocalId(),
                    task: [{taskName: "initial-sync", total: 0, completed: 0}],
                    outlookParams: {
                        accessToken: response.accessToken,
                        accessTokenExpiry: response.expiresOn,
                    }
                });
                let tokenData = {};
                tokenData._id = userResult._id;
                tokenData.accessToken = response.accessToken;
                newToken = await auth.generateToken(tokenData, response.expiresOn);
            }
            if (!newToken) {
                return errorResponse(HTTP_CODES.AUTH_FAIL, RESPONSE_MSGS.AUTH_FAIL);
            }
            // syncService.runInitialSync({accessToken: response.accessToken});
            console.log("Access Token Is: ", newToken);
            return successResponse(HTTP_CODES.OK, RESPONSE_MSGS.OK, {token: newToken});
        } catch (error) {
            logger.error(error);
            return errorResponse(HTTP_CODES.Internal_Server_Error, RESPONSE_MSGS.Internal_Error);
        }
    }
};

module.exports = exportable;


//acquireTokenSilent