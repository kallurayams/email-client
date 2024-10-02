const { WebhookQueue } = require("../models/webhookQueue");
const { logger } = require("../utils/logger");
const userStates = require("./userStateManager");
const emailProvider = require("../providers/provider");
const { startEmailProcessing } = require("../config/socket");

const createWebhookQueue = () => {
  const addToQueue = async ({ payload, provider, localUserId }) => {
    try {
      await WebhookQueue.create({
        payload,
        processed: false,
        provider,
        localUserId,
      });
    } catch (error) {
      logger.error("Webhook Add to Queue Error", error);
    }
  };

  const processQueue = async (localUserId) => {
    if (
      userStates.getIsProcessing(localUserId) ||
      userStates.getIsResyncing(localUserId)
    )
      return;

    userStates.setIsProcessing(localUserId, true);
    startEmailProcessing(localUserId);

    try {
      while (!userStates.getIsResyncing(localUserId)) {
        const item = await WebhookQueue.findOne({
          processed: false,
          localUserId,
        })
          .sort({ createdAt: 1 })
          .select({ payload: 1, provider: 1 })
          .lean();

        if (!item?.payload || !item?.provider) break;

        await processNotification({
          payload: item.payload,
          provider: item.provider,
          localUserId,
        });
        await WebhookQueue.deleteOne({ _id: item._id });
      }
    } catch (error) {
      logger.error("Webhook Process Queue Error", error);
    } finally {
      userStates.setIsProcessing(localUserId, false);
    }
  };

  const processNotification = async ({ payload, provider, localUserId }) => {
    try {
      return (
        (await emailProvider(provider).processNotification({
          payload,
          provider,
          localUserId,
        })) || false
      );
    } catch (error) {
      logger.error("Webhook Process Notification Error", error);
      return false;
    }
  };

  return { addToQueue, processQueue };
};

module.exports = createWebhookQueue();
