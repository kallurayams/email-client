const express = require("express");
const router = express.Router();

const syncController = require("../controllers/sync");
const { authenticate } = require("../middlewares/authentication");

router.get("/process-status", authenticate, (req, res) => {
  syncController.getProcessStatus(req, res);
});

module.exports = router;
