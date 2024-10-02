//User model
const mongoose = require("mongoose");
const { ALLOWED_PROVIDERS } = require("../config/default");
const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const emailSchema = new Schema(
  {
    emailMessageId: {
      type: String,
      required: true,
    },
    emailCreatedDate: {
      type: Date,
    },
    emailModifiedDate: {
      type: Date,
    },
    emailReceivedDate: {
      type: Date,
    },
    emailSentDate: {
      type: Date,
    },
    subject: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
    fromName: {
      type: String,
    },
    fromEmail: {
      type: String,
    },
    folderId: {
      type: ObjectId,
      ref: "Mailbox",
    },
    provider: {
      type: String,
      enum: ALLOWED_PROVIDERS,
      required: true,
    },
    user: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

//Indexes
emailSchema.index({ userId: 1, folderName: 1 });

module.exports = {
  Email: mongoose.model("Email", emailSchema),
};
