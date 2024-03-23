const jwt = require("jsonwebtoken");
const User = require("../model/User");
const Company = require("../model/Company");
const Delivery = require("../model/Delivery");
require("dotenv").config({ path: "backend.env" });

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) {
    return res.status(401).json({ error: "You are not authenticated" });
  }
  const refreshToken = cookies.refreshToken;
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  let roles;
  let model;
  let accesskey;
  let refreshkey;

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.USER_REFRESH_TOKEN_SECRET
    );
    roles = "User";
    model = User;
    accesskey = process.env.USER_ACCESS_TOKEN_SECRET;
    refreshkey = process.env.USER_REFRESH_TOKEN_SECRET;
  } catch (error) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.COMPANY_REFRESH_TOKEN_SECRET
      );
      roles = "Company";
      model = Company;
      accesskey = process.env.COMPANY_ACCESS_TOKEN_SECRET;
      refreshkey = process.env.COMPANY_REFRESH_TOKEN_SECRET;
    } catch (error) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.DELIVERY_REFRESH_TOKEN_SECRET
        );
        roles = "Delivery boy";
        model = Delivery;
        accesskey = process.env.DELIVERY_ACCESS_TOKEN_SECRET;
        refreshkey = process.env.DELIVERY_REFRESH_TOKEN_SECRET;
      } catch (error) {
        return res.status(403).json({ error: "Invalid token" });
      }
    }
  }

  // checking reuse of refresh token
  const foundUser = await model.findOne({ refreshToken }, { password: 0 });

  //delete refresh token from db if user is not found
  if (!foundUser) {
    try {
      const decoded = jwt.verify(refreshToken, refreshkey);
      const hackedUser = await model.findById(decoded.id);
      hackedUser.refreshToken = "";
      await hackedUser.save();
    } catch (error) {
      return res.status(403).json({ error: "Invalid token" });
    }
    return res.status(403);
  }

  // Generate new access token

  jwt.verify(refreshToken, refreshkey, async (err, user) => {
    if (err || foundUser.id !== user.id) return res.status(403);
    const data = {
      id: user.id,
      role: roles,
    };
    const accessToken = jwt.sign(data, accesskey, {
      expiresIn: "15m",
    });
    const newrefreshToken = jwt.sign(data, refreshkey, {
      expiresIn: "15d",
    });
    foundUser.refreshToken = newrefreshToken;
    await foundUser.save();
    res.cookie("refreshToken", newrefreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    return res.json({ accessToken });
  });
};

module.exports = handleRefreshToken;
