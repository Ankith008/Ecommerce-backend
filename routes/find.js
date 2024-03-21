const express = require("express");
const router = express.Router();
const User = require("../model/User");
const { body, validationResult } = require("express-validator");
const Product = require("../model/Product");
const Delivery = require("../model/Delivery");
const Company = require("../model/Company");
const Store = require("../model/Stores");
require("dotenv").config({ path: "backend.env" });
const handleRefreshToken = require("../controllers/handleRefreshToken");
const handleAccessToken = require("../middleware/handleAccessToken");

router.get("/stores", handleAccessToken, async (req, res) => {
  try {
    const company = await Company.findById(req.company).populate("stores");
    const store = company.stores;
    res.status(200).json({ stores: store });
  } catch (error) {
    console.error("Error finding stores:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
