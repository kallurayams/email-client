//User model
const mongoose = require("mongoose");
const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;
const { ALLOWED_PROVIDERS } = require("../config/default");

const webhookQueueSchema = new Schema(
  {
    processed: {
      type: Boolean,
      default: false,
      required: true,
    },
    payload: {
      type: Object,
      required: true,
    },
    provider: {
      type: String,
      enum: ALLOWED_PROVIDERS,
      required: true,
    },
    localUserId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

//Indexes
webhookQueueSchema.index({ createdAt: 1, processed: 1 });

module.exports = {
  WebhookQueue: mongoose.model("WebhookQueue", webhookQueueSchema),
};
