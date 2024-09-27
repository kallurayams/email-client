const express = require("express");
const router = express.Router();

const authController = require("../controllers/authenticate");

//OAuth Login
router.get("/authUrl", (req, res) => {
    authController.authUrl(req, res);
});

//Callback from OAuth
router.get("/verify", (req, res) => {
    authController.verify(req, res);
});

module.exports = router;