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
    const decodeduser = jwt.verify(token, process.env.USER_ACCESS_TOKEN_SECRET);
    req.user = decodeduser.id;
    next();
  } catch (error) {
    try {
      const decodedcom = jwt.verify(
        token,
        process.env.COMPANY_ACCESS_TOKEN_SECRET
      );
      req.company = decodedcom.id;
      next();
    } catch (error) {
      try {
        const decodeddev = jwt.verify(
          token,
          process.env.DELIVERY_ACCESS_TOKEN_SECRET
        );

        req.delivery = decodeddev.id;
        next();
      } catch (error) {
        return res.status(403).json({ error: "Not Authorized" });
      }
    }
  }
};
module.exports = handleAccessToken;
