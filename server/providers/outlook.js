const msal = require("@azure/msal-node");
const { Client } = require("@microsoft/microsoft-graph-client");
require("isomorphic-fetch");

const { logger } = require("../utils/logger");
const { errorResponse, successResponse } = require("../utils/service-utils");
const {
  HTTP_CODES,
  RESPONSE_MSGS,
  ALLOWED_MAILBOXES,
} = require("../config/default");
const { Provider } = require("../models/provider");
const { Email } = require("../models/email");
const { Mailbox } = require("../models/mailbox");
const { User } = require("../models/user");
const userStates = require("../services/userStateManager");
const { generateKeys } = require("../utils/outlook");
const outlookConfig = require("../config/outlook");

const CCA_SCOPES = ["user.read", "mail.read"];
const PROVIDER = "outlook";

function createOutlookProvider() {
  const authRedirectionUrl = `${process.env.API_BASE_URL}${process.env.API_BASE_PATH}/${PROVIDER}${process.env.AUTH_CALLBACK_API_ENDPOINT}`;

  const msalOptions = {
    auth: {
      clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
      authority: process.env.OUTLOOK_AUTHORITY,
      clientId: process.env.OUTLOOK_CLIENT_ID,
    },
  };

  const cca = new msal.ConfidentialClientApplication(msalOptions);

  function createClient(accessToken) {
    return Client.init({
      authProvider: (done) => done(null, accessToken),
    });
  }

  function createEmailObj(email) {
    if (!email?.id) return false;

    const result = {
      emailMessageId: email.id,
      emailCreatedDate: email.createdDateTime,
      emailModifiedDate: email.lastModifiedDateTime,
      emailReceivedDate: email.receivedDateTime,
      emailSentDate: email.sentDateTime,
      subject: email.subject,
      isRead: email.isRead,
      isDraft: email.isDraft,
      fromName: email.from?.emailAddress?.name,
      fromEmail: email.from?.emailAddress?.address,
      folderId: email.folderId,
      provider: PROVIDER,
      user: email.user,
    };

    if (email.body) {
      result.body =
        email.body.contentType === "text"
          ? email.body.content
          : email.body.content.toString();
    }

    return result;
  }

  async function generateAuthUrl() {
    try {
      const authCodeUrl = await cca.getAuthCodeUrl({
        scopes: CCA_SCOPES,
        redirectUri: authRedirectionUrl,
      });
      return successResponse(HTTP_CODES.OK, RESPONSE_MSGS.OK, {
        authUrl: authCodeUrl,
      });
    } catch (error) {
      logger.error(error);
      return errorResponse(
        HTTP_CODES.Internal_Server_Error,
        RESPONSE_MSGS.Internal_Error
      );
    }
  }

  async function validateAuthCallback({ code }) {
    if (!code) {
      logger.error(RESPONSE_MSGS.Bad_Request);
      return errorResponse(HTTP_CODES.Bad_Request, RESPONSE_MSGS.Bad_Request);
    }

    try {
      const response = await cca.acquireTokenByCode({
        scopes: CCA_SCOPES,
        redirectUri: authRedirectionUrl,
        code,
      });

      if (
        !response.account?.username ||
        !response.account?.name ||
        !response.accessToken ||
        !response.expiresOn
      ) {
        logger.error(RESPONSE_MSGS.Bad_Response);
        return errorResponse(
          HTTP_CODES.Unprocessable_Entity,
          RESPONSE_MSGS.Bad_Response
        );
      }

      const finalResponse = {
        userName: response.account.name,
        userEmail: response.account.username,
        tokenPayload: {
          accessToken: response.accessToken,
          accessTokenExpiry: response.expiresOn,
          account: response.account,
        },
      };

      return successResponse(HTTP_CODES.OK, RESPONSE_MSGS.OK, finalResponse);
    } catch (error) {
      logger.error(error);
      return errorResponse(
        HTTP_CODES.Internal_Server_Error,
        RESPONSE_MSGS.Internal_Error
      );
    }
  }

  async function sync({ localUserId, accessToken }) {
    try {
      userStates.setIsResyncing(localUserId, true);
      const client = createClient(accessToken);

      const providerFolderNames = [
        "Inbox",
        "Junk Email",
        "Drafts",
        "Sent Items",
        "Archive",
      ];
      const localFolderData = await Mailbox.find({}).select({ name: 1 });
      const localFolderIdByLocalName = localFolderData.reduce((acc, folder) => {
        acc[folder.name] = folder._id;
        return acc;
      }, {});

      const localFolderIdByProviderFolderName = {
        Inbox: localFolderIdByLocalName.inbox,
        "Junk Email": localFolderIdByLocalName.junkEmail,
        Drafts: localFolderIdByLocalName.drafts,
        "Sent Items": localFolderIdByLocalName.sentItems,
        Archive: localFolderIdByLocalName.archive,
      };

      const folderFilterString = providerFolderNames
        .map((name) => `displayName eq '${name}'`)
        .join(" or ");
      const foldersList = await client
        .api("/me/mailFolders")
        .filter(folderFilterString)
        .select("id,displayName")
        .get();

      if (
        !foldersList?.value ||
        foldersList.value.length !== providerFolderNames.length
      ) {
        logger.error(RESPONSE_MSGS.Data_Not_Found);
        return errorResponse(
          HTTP_CODES.Not_Found,
          RESPONSE_MSGS.Data_Not_Found
        );
      }

      const folderData = await Provider.findOne({ user: localUserId })
        .select({ "data.folderDeltaLinks": 1 })
        .lean();

      for (const folder of foldersList.value) {
        await Mailbox.updateOne(
          { name: folder.displayName.toLowerCase().replace(" ", "") },
          { $set: { outlookFolderId: folder.id } }
        );

        let deltaLink = folderData?.data?.folderDeltaLinks?.[folder.id];
        let nextLink;
        let allFolderEmails = [];

        do {
          let response;
          if (deltaLink) {
            response = await client.api(deltaLink).get();
          } else if (nextLink) {
            response = await client.api(nextLink).get();
          } else {
            response = await client
              .api(`/me/mailFolders/${folder.id}/messages/delta`)
              .select(
                "id,createdDateTime,lastModifiedDateTime,receivedDateTime,sentDateTime,isRead,isDraft,from,subject,parentFolderId,body"
              )
              .get();
          }

          allFolderEmails = allFolderEmails.concat(response.value);
          nextLink = response["@odata.nextLink"];
          deltaLink = response["@odata.deltaLink"];
        } while (nextLink);

        if (deltaLink) {
          await Provider.updateOne(
            { user: localUserId },
            { $set: { [`data.folderDeltaLinks.${folder.id}`]: deltaLink } }
          );
        }

        for (let email of allFolderEmails) {
          if (email["@removed"]) {
            await Email.deleteOne({
              user: localUserId,
              emailMessageId: email.id,
            });
            continue;
          }

          email.folderId =
            localFolderIdByProviderFolderName[folder.displayName];
          email.user = localUserId;

          const emailObj = createEmailObj(email);
          if (!emailObj) {
            logger.error(RESPONSE_MSGS.Data_Not_Found);
            return errorResponse(
              HTTP_CODES.Not_Found,
              RESPONSE_MSGS.Data_Not_Found
            );
          }

          await Email.updateOne(
            { emailMessageId: email.id },
            { $set: emailObj },
            { upsert: true }
          );
        }
      }

      userStates.setIsResyncing(localUserId, false);
      return successResponse(HTTP_CODES.OK, RESPONSE_MSGS.OK, {
        data: RESPONSE_MSGS.OK,
      });
    } catch (error) {
      logger.error(error);
      return errorResponse(
        HTTP_CODES.Internal_Server_Error,
        RESPONSE_MSGS.Internal_Error
      );
    }
  }

  async function processNotification({ payload, provider, localUserId }) {
    try {
      if (payload.changeType === "deleted") {
        await Email.deleteOne({
          user: localUserId,
          emailMessageId: payload.resourceData.id,
        });
      } else {
        const mailboxData = await Mailbox.find({}).select({
          outlookFolderId: 1,
        });
        const mailboxMap = mailboxData.reduce((acc, curr) => {
          acc[curr.outlookFolderId] = curr._id;
          return acc;
        }, {});

        const emailObj = {
          emailMessageId: payload.resourceData.id,
          folderId: mailboxMap[payload.encryptedContent.parentFolderId],
          provider,
          user: localUserId,
          ...payload.encryptedContent,
        };

        if (emailObj.body) {
          emailObj.body =
            emailObj.body.contentType === "text"
              ? emailObj.body.content
              : emailObj.body.content.toString();
        }

        await Email.updateOne(
          { emailMessageId: emailObj.emailMessageId },
          { $set: emailObj },
          { upsert: true }
        );
      }

      return true;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }

  async function validateAuthToken({ payload }) {
    try {
      const { accessTokenExpiry, webhookSubscriptionExpiry, localUserId } =
        payload;
      const now = new Date();

      if (new Date(accessTokenExpiry) < now) return false;
      if (new Date(webhookSubscriptionExpiry) < now) return false;

      const userExists = await User.exists({ localUserId });
      return !!userExists;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }

  async function subscribeToWebhook({ accessToken }) {
    try {
      const client = createClient(accessToken);
      const base64PublicKey = generateKeys();
      const subscriptionExpiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now

      const subscription = {
        changeType: "created,updated,deleted",
        notificationUrl: process.env.WEBHOOK_URL,
        resource:
          "/me/messages?$select=id,createdDateTime,lastModifiedDateTime,receivedDateTime,sentDateTime,isRead,isDraft,from,subject,parentFolderId,body",
        expirationDateTime: subscriptionExpiryDate.toISOString(),
        clientState: outlookConfig.secrets.webhookClientSecret,
        includeResourceData: true,
        encryptionCertificate: base64PublicKey,
        encryptionCertificateId: "subscription-config-id",
      };

      const existingSubscriptions = await client.api("/subscriptions").get();
      let result;

      if (existingSubscriptions?.value?.length) {
        const subscriptionId = existingSubscriptions.value[0].id;
        result = await client
          .api(`/subscriptions/${subscriptionId}`)
          .patch(subscription);
      } else {
        result = await client.api("/subscriptions").post(subscription);
      }

      return successResponse(HTTP_CODES.OK, RESPONSE_MSGS.OK, {
        subscriptionExpiry: subscriptionExpiryDate,
        subscriptionId: result.id,
      });
    } catch (error) {
      logger.error(error);
      return errorResponse(
        HTTP_CODES.Internal_Server_Error,
        RESPONSE_MSGS.Internal_Error
      );
    }
  }

  async function refreshToken(params) {
    try {
      const now = new Date();
      let finalResponse = { ...params };

      if (new Date(params.accessTokenExpiry) < now) {
        const response = await cca.acquireTokenSilent({
          scopes: CCA_SCOPES,
          account: params.account,
        });

        if (!response?.accessToken || !response.expiresOn) {
          logger.error(RESPONSE_MSGS.Auth_Fail);
          return false;
        }

        finalResponse.accessToken = response.accessToken;
        finalResponse.accessTokenExpiry = response.expiresOn;
      } else if (new Date(params.webhookSubscriptionExpiry) < now) {
        const { responseObj } = await subscribeToWebhook(params);
        if (!responseObj) return false;
        finalResponse.webhookSubscriptionExpiry =
          responseObj.data.subscriptionExpiry;
      }

      delete finalResponse.iat;
      delete finalResponse.exp;
      return finalResponse;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }

  return {
    generateAuthUrl,
    validateAuthCallback,
    sync,
    processNotification,
    validateAuthToken,
    refreshToken,
    subscribeToWebhook,
  };
}

module.exports = createOutlookProvider();
