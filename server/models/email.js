//User model
const mongoose = require("mongoose");
const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const emailSchema = new Schema(
  {
    emailId: {
      type: String
    },
    emailCreatedDate: {
      type: Date
    },
    emailModifiedDate: {
      type: Date
    },
    emailReceivedDate: {
      type: Date
    },
    emailSentDate: {
      type: Date
    },
    subject: {
      type: String
    },
    isRead: {
      type: Boolean
    },
    isDraft: {
      type: Boolean
    },
    fromName: {
      type: String
    },
    fromEmail: {
      type: String
    },
    userId: {
      type: ObjectId,
      ref: "User",
    },
    folderName: {
      type: String
    },
    folderId: {
      type: String
    }
  },
  { timestamps: true }
);

//Indexes
emailSchema.index({ userId: 1, folderName: 1 });

module.exports = {
  Email: mongoose.model("Email", emailSchema),
};