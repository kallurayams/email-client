//User model
const mongoose = require("mongoose");
const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const webhookQueueSchema = new Schema(
  {
    processed: {
        type: Boolean,
        default: false
    }
  },
  { timestamps: true }
);

//Indexes
webhookQueueSchema.index({ createdAt: 1, processed: 1 });

module.exports = {
  WebhookQueue: mongoose.model("WebhookQueue", webhookQueueSchema),
};