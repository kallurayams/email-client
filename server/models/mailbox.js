const mongoose = require("mongoose");
const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;
const { ALLOWED_MAILBOXES } = require("../config/default");

const mailboxSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    outlookFolderId: {
      type: String,
    },
  },
  { timestamps: true }
);

//Indexes
mailboxSchema.index({ folderId: 1 });

module.exports = {
  Mailbox: mongoose.model("Mailbox", mailboxSchema),
};
