// file responsible for starting the server
// loads all the packages, routes and middleware

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const pageRoutes = require("./server/routes/pages");
const apiRoutes = require("./server/routes/api");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("client"));

app.use("/", pageRoutes);
app.use("/api", apiRoutes);

app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Swish server running on port ${PORT}`));