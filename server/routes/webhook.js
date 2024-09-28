const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authentication");

const webhookController = require("../controllers/webhook");

router.post("/send", (req, res) => {
    webhookController.send(req, res);
});

router.post("/subscribe", authenticate, (req, res) => {
    webhookController.subscribe(req, res);
});

module.exports = router;