const { logger } = require("../utils/logger");
const { HTTP_CODES, RESPONSE_MSGS } = require("../config/default");
const { User } = require("../models/user");
const { Mailbox } = require("../models/mailbox");
const { errorResponse, successResponse } = require("../utils/service-utils");
const { Email } = require("../models/email");

const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');


const exportable = {
    getInitialSync: async (params) => {
        try {
            let { userId } = params;
            const response = await User.findOne({ _id: userId }).select({_id: 0, initialSyncStatus: 1}).lean();
            if (!response) {
                logger.error(RESPONSE_MSGS.User_Not_Found);
                return errorResponse(HTTP_CODES.User_Not_Found, RESPONSE_MSGS.User_Not_Found);
            }

            let status = response.initialSyncStatus;
            let percentage = 0;

            return successResponse(HTTP_CODES.Success, RESPONSE_MSGS.Success, {percentage: percentage, status: status});
        } catch (error) {
            logger.error(error);
            return errorResponse(HTTP_CODES.Internal_Server_Error, RESPONSE_MSGS.Internal_Error);
        }
    },
    runInitialSync: async (params) => {
        try {
            let { userId, accessToken } = params;

            //Update status
            await User.updateOne({_id: userId}, {$set: {initialSyncStatus: "inProgress"}});

            const client = Client.init({
                authProvider: (done) => {
                    done(null, accessToken);
                }
            });

            // const folders = [
            //     "Inbox",
            //     "Junk Email",
            //     "Drafts",
            //     "Sent Items",
            //     "Archive"
            // ];

            let foldersList = await client.api('/me/mailFolders')
            .select('id,displayName')
            .get();
            foldersList = foldersList.value;

            for (const folder of foldersList) {
                let folderId = folder.id;
                let folderData = await User.findOne({ _id: userId }).select({folderDeltaLinks: 1}).lean();
                let deltaLink;
                if (folderData?.folderDeltaLinks?.[folderId]) {
                    deltaLink = folderData.folderDeltaLinks[folderId];
                }
                let nextLink;
                let finalResponse = [];
            do {
                let response;
                if (deltaLink) {
                    response = await client.api(deltaLink).get();
                } else if (nextLink) {
                    response = await client.api(nextLink).get();
                } else {
                    response = await client.api(`/me/mailFolders/${folderId}/messages/delta`).select('id,createdDateTime,lastModifiedDateTime,receivedDateTime,sentDateTime,isRead,isDraft,from,subject,parentFolderId').get();
                }

                if (!response) {
                    logger.error(RESPONSE_MSGS.Data_Not_Found);
                    return errorResponse(HTTP_CODES.Data_Not_Found, RESPONSE_MSGS.Data_Not_Found);
                }

                finalResponse = finalResponse.concat(response.value);

                nextLink = response["@odata.nextLink"];
                deltaLink = response["@odata.deltaLink"];
            } while (nextLink);

            if (deltaLink) {
                await User.updateOne(
                    { _id: userId },
                    { $set: { [`folderDeltaLinks.${folderId}`]: deltaLink } }
                  );
            }

            for (let email of finalResponse) {
                if (email["@removed"]) {
                    await Email.deleteOne({userId: userId, emailId: email.id});
                    continue;
                }
                let emailObj = {};
                emailObj.userId = userId;
                emailObj.emailId = email.id;
                emailObj.emailCreatedDate = email.createdDateTime;
                emailObj.emailModifiedDate = email.lastModifiedDateTime;
                emailObj.emailReceivedDate = email.receivedDateTime;
                emailObj.emailSentDate = email.sentDateTime;
                emailObj.subject = email.subject;
                emailObj.isRead = email.isRead;
                emailObj.isDraft = email.isDraft;
                email.from?.emailAddress?.name && (emailObj.fromName = email.from.emailAddress.name);
                email.from?.emailAddress?.address && (emailObj.fromEmail = email.from.emailAddress.address);
                emailObj.folderName = folder.displayName;
                emailObj.folderId = folderId;
                
                await Email.updateOne(
                    {emailId: email.id},
                    {$set: emailObj},
                    {upsert: true}
                );
            }
        }
         await User.updateOne({_id: userId}, {$set: {initialSyncStatus: "completed"}});

            return successResponse(HTTP_CODES.Success, RESPONSE_MSGS.Success, {});
        } catch (error) {
            logger.error(error);
            return errorResponse(HTTP_CODES.Internal_Server_Error, RESPONSE_MSGS.Internal_Error);
        }
    }
};

module.exports = exportable;