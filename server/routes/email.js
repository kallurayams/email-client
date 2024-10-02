const express = require("express");
const router = express.Router();

const emailController = require("../controllers/email");
const { authenticate } = require("../middlewares/authentication");

//Fetch Emails
router.get("/all", authenticate, (req, res) => {
  emailController.getEmails(req, res);
});

module.exports = router;
