const jwt = require("jsonwebtoken");
const User = require("../model/User");
require("dotenv").config({ path: "backend.env" });
const Delivery = require("../model/Delivery");
const Company = require("../model/Company");

const handleAccessToken = async (req, res, next) => {
  const data = req.headers.authorization;
  if (!data || !data.startsWith("Bearer ") || !data.split(" ")[1]) {
    return res.status(403).json({ error: "Not Authorized" });
  }
  const token = data.split(" ")[1];
  try {
    const client = jwt.verify(token, process.env.USER_ACCESS_TOKEN_SECRET);
    console.log(client);
    req.user = client.id;
    next();
  } catch (userError) {
    try {
      const delivery = jwt.verify(
        token,
        process.env.DELIVERY_ACCESS_TOKEN_SECRET
      );
      req.delivery = delivery.id;
      next();
    } catch (deliveryError) {
      try {
        const company = jwt.verify(
          token,
          process.env.COMPANY_ACCESS_TOKEN_SECRET
        );
        req.company = company.id;
        next();
      } catch (companyError) {
        return res.status(403).json({ error: "Not Authorized" });
      }
    }
  }
};
module.exports = handleAccessToken;
