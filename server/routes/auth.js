const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");
const { authenticate } = require("../middlewares/authentication");

//Generate OAuth URL
router.get("/generate-auth-url", (req, res) => {
  authController.generateAuthUrl(req, res);
});

//Refresh OAuth Token
router.get("/refresh-token", (req, res) => {
  authController.refreshToken(req, res);
});

router.get("/account-info", authenticate, (req, res) => {
  authController.getAccountInfo(req, res);
});

module.exports = router;
