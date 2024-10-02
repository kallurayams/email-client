//User model
const mongoose = require("mongoose");
const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;
const { ALLOWED_PROVIDERS } = require("../config/default");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    localUserId: {
      type: String,
      required: true,
    },
    folderDeltaLinks: {
      type: Object,
      default: {},
    },
    webhookSubscriptionId: {
      type: String,
    },
    provider: {
      type: String,
      enum: ALLOWED_PROVIDERS,
      required: true,
    },
  },
  { timestamps: true }
);

//Indexes
userSchema.index({ email: 1, provider: 1 }, { unique: true });
userSchema.index({ localUserId: 1 }, { unique: true });

module.exports = {
  User: mongoose.model("User", userSchema),
};
