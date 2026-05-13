// file where page routes are defined

const express = require("express");
const path = require("path");

const router = express.Router();

router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../../client/pages/login.html"));
});

module.exports = router;