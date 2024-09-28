//User model
const mongoose = require("mongoose");
const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const mailboxSchema = new Schema(
  {
    folderName: {
      type: String,
      enum: [
        "Inbox",
        "Junk Email",
        "Drafts",
        "Sent Items",
        "Archive"
      ]
    },
    folderId: {
      type: String
    },
  },
  { timestamps: true }
);

//Indexes
mailboxSchema.index({ folderId: 1 });

module.exports = {
  Mailbox: mongoose.model("Mailbox", mailboxSchema),
};