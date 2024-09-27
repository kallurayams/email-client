//User model
const mongoose = require("mongoose");
const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const userSchema = new Schema(
  {
    emailAddress: {
      type: String,
      default: "",
    },
    fullName: {
      type: String,
      default: "",
    },
    localId: {
      type: String,
      default: "",
    },
    accessToken: {
      type: String,
      default: "",
    },
    task: {
      type: [{
        taskName: {
          type: String,
          enum: ["initial-sync"],
        },
        total: Number,
        completed: Number
      }],
      default: [],
    },
    outlookParams: {
      type: {
        accessToken: { type: String },
        accessTokenExpiry: { type: Date }
      },
      default: {}
    }
  },
  { timestamps: true }
);

//Indexes
userSchema.index({ emailAddress: 1 });

module.exports = {
  User: mongoose.model("User", userSchema),
};