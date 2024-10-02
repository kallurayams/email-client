const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");
const outlookController = require("../controllers/outlook");

//Handle OAuth Callback for Outlook
router.get("/validate-callback", (req, res) => {
  if (!req.query) req.query = {};
  req.query.provider = "outlook";
  authController.validateAuthCallback(req, res);
});

//Webhook to get change notifications
router.post("/webhook", (req, res) => {
  if (!req.query) req.query = {};
  req.query.provider = "outlook";
  outlookController.processNotification(req, res);
});

module.exports = router;
