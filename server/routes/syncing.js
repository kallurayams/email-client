const express = require("express");
const router = express.Router();

const syncingController = require("../controllers/syncing");
const { authenticate } = require("../middlewares/authentication");

//Get initial sync status
router.get("/initial-sync", authenticate,(req, res) => {
    syncingController.getInitialSync(req, res);
});

module.exports = router;
