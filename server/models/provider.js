const mongoose = require("mongoose");
const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;
const { ALLOWED_PROVIDERS } = require("../config/default");

const providerSchema = new Schema(
  {
    provider: {
      type: String,
      enum: ALLOWED_PROVIDERS,
      required: true,
    },
    data: {
      folderDeltaLinks: {
        type: Object,
        default: {},
      },
      subscriptionId: {
        type: String,
        default: "",
      },
    },
    user: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

//Indexes
providerSchema.index(
  { provider: 1, "data.subscriptionId": 1 },
  { unique: true }
);
providerSchema.index({ user: 1, provider: 1 }, { unique: true });

module.exports = {
  Provider: mongoose.model("Provider", providerSchema),
};
