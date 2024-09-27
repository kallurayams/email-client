//User model
const mongoose = require("mongoose");
const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const emailSchema = new Schema(
  {
    emailAddress: {
      type: String,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isSpam: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["draft", "sent", "inbox"],
      default: "draft",
    },
  },
  { timestamps: true }
);

//Indexes
emailSchema.index({ emailAddress: 1 });

module.exports = {
  Email: mongoose.model("Email", emailSchema),
};