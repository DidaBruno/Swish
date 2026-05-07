require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("client"));  // serves your HTML/CSS/JS files

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Swish server running on port ${PORT}`));