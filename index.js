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
    origin: "https://ecommerce-frontend-ten-beryl.vercel.app",
    credentials: true,
  })
);

app.use("/auth", require("./routes/auth"));
app.use("/find", require("./routes/find"));
app.listen(5000);
