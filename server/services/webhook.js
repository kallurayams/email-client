const { errorResponse, successResponse } = require("../utils/service-utils");
const config = require("../config/config");
const { logger } = require("../utils/logger");
const { HTTP_CODES, RESPONSE_MSGS, CONSTANTS } = require("../config/default");
const msal = require('@azure/msal-node');
const { User } = require("../models/user");
const auth = require("../utils/auth");
const utils = require("../utils/utils");
const syncService = require("./syncing");
const { subscribe } = require("../routes/syncing");
const { generateKeys, decryptNotification } = require("../utils/auth");
const path = require('path');


const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

const exportable = {
    send: async (params) => {
        try {
            let { body } = params;
            let data = decryptNotification(body.value[0].encryptedContent);
            // Value:  {
            //     'createdDateTime@odata.type': '#DateTimeOffset',
            //     createdDateTime: '2024-09-26T08:10:15Z',
            //     'lastModifiedDateTime@odata.type': '#DateTimeOffset',
            //     lastModifiedDateTime: '2024-09-28T21:52:26Z',
            //     'receivedDateTime@odata.type': '#DateTimeOffset',
            //     receivedDateTime: '2024-09-26T08:10:16Z',
            //     'sentDateTime@odata.type': '#DateTimeOffset',
            //     sentDateTime: '2024-09-26T08:10:16Z',
            //     subject: 'Welcome to your new Outlook.com account',
            //     parentFolderId: 'AQMkADAwATMwMAExLTgzMwAwLTVkZTMtMDACLTAwCgAuAAADzOPv9klzQ06ulBq42x7F8wEA8HEZGqmQJEuQw_Ui5ApAsAAAAgEMAAAA',
            //     isRead: true,
            //     isDraft: false,
            //     from: {
            //       '@odata.type': '#microsoft.graph.recipient',
            //       emailAddress: {
            //         '@odata.type': '#microsoft.graph.emailAddress',
            //         name: 'Outlook Team',
            //         address: 'no-reply@microsoft.com'
            //       }
            //     }
            //   }
            return successResponse(HTTP_CODES.OK, RESPONSE_MSGS.OK, CONSTANTS.DEFAULT_RESPONSE);
        } catch (error) {
            logger.error(error);
            return errorResponse(HTTP_CODES.Internal_Server_Error, RESPONSE_MSGS.Internal_Error);
        }
    },
    subscribe: async (params) => {
        try {
            let { user } = params;
            let { accessToken } = user;

            const client = Client.init({
                authProvider: (done) => {
                    done(null, accessToken);
                }
            });

            let base64PublicKey = generateKeys();
            let subscriptionExpiryDate = new Date();
            subscriptionExpiryDate.setDate(subscriptionExpiryDate.getDate() + 1);
            const subscription = {
                changeType: 'created,updated,deleted',
                notificationUrl: 'https://89e6-2403-a080-c04-9d9a-a4b6-55e1-9f51-ddc3.ngrok-free.app/api/v1/webhook/send',
                resource: '/me/messages?$select=id,createdDateTime,lastModifiedDateTime,receivedDateTime,sentDateTime,isRead,isDraft,from,subject,parentFolderId',
                expirationDateTime: subscriptionExpiryDate.toISOString(), // expires in 1 days
                clientState: 'secretClientState',
                includeResourceData: true,
                encryptionCertificate: base64PublicKey,
                encryptionCertificateId: "subscription-config-id",
            };

            const userData = await User.findOne({ _id: user._id }).select({ webhookSubscriptionId: 1 }).lean();
            if (userData?.webhookSubscriptionId) {
                const result = await client.api('/subscriptions/' + userData.webhookSubscriptionId).patch(subscription);
                return successResponse(HTTP_CODES.OK, RESPONSE_MSGS.OK, {});
            } else {
                const result = await client.api('/subscriptions').post(subscription);
                (async () => {
                    try {
                        await User.updateOne({ _id: user._id }, { webhookSubscriptionId: result.id });
                    } catch (error) {
                        logger.error(error);
                    }
                })();
            }

            return successResponse(HTTP_CODES.OK, RESPONSE_MSGS.OK, CONSTANTS.DEFAULT_RESPONSE);
        } catch (error) {
            logger.error(error);
            return errorResponse(HTTP_CODES.Internal_Server_Error, RESPONSE_MSGS.Internal_Error);
        }
    }
};

module.exports = exportable;


//acquireTokenSilent