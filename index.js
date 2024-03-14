const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const connectToMongo = require("./dbs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.json());
app.use(cookieParser());
require("dotenv").config({ path: "backend.env" });

connectToMongo();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/auth", require("./routes/auth"));
app.listen(5000);
