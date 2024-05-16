const jwt = require("jsonwebtoken");
const User = require("../model/User");
require("dotenv").config({ path: "backend.env" });
const Delivery = require("../model/Delivery");
const Company = require("../model/Company");

const handledetails = async (req, res) => {
  const data = req.headers.authorization;
  if (!data || !data.startsWith("Bearer ") || !data.split(" ")[1]) {
    return res.status(403).json({ error: "Not Authorized" });
  }
  const token = data.split(" ")[1];

  try {
    const decodeduser = jwt.verify(token, process.env.USER_ACCESS_TOKEN_SECRET);
    const users = await User.findById(decodeduser.id);
    const user = {
      id: users._id,
      name: users.name,
      email: users.email,
      Address: users.Address,
      phoneNumber: users.phoneNumber,
      profile: users.profile,
    };

    return res.json({ user });
  } catch (error) {
    try {
      const decodedcom = jwt.verify(
        token,
        process.env.COMPANY_ACCESS_TOKEN_SECRET
      );
      const companys = await Company.findById(decodedcom.id);

      const company = {
        id: companys._id,
        companyemail: companys.companyemail,
        companylocation: companys.companylocation,
        companyname: companys.companyname,
        companyownernumber: companys.companyownernumber,
        profile: companys.profile,
        companyowner: companys.companyowner,
      };

      return res.json({
        company,
      });
    } catch (error) {
      try {
        const decodeddev = jwt.verify(
          token,
          process.env.DELIVERY_ACCESS_TOKEN_SECRET
        );

        const delivery = await Delivery.findById(decodeddev.id);
        return res.json({ delivery });
      } catch (error) {
        return res.status(403).json({ error: "Not Authorized" });
      }
    }
  }
};
module.exports = handledetails;
