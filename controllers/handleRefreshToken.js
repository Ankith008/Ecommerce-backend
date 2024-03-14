const jwt = require("jsonwebtoken");
const User = require("../model/User");
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

  // checking reuse of refresh token
  const foundUser = await User.findOne({ refreshToken }, { password: 0 });

  //delete refresh token from db if user is not found
  if (!foundUser) {
    jwt.verify(
      refreshToken,
      process.env.USER_REFRESH_TOKEN_SECRET,
      async (err, user) => {
        if (err) return res.status(403);
        const hackedUser = await User.findById(user.id);
        hackedUser.refreshToken = [];
        const result = await hackedUser.save();
        await hackedUser.save();
      }
    );
    return res.status(403);
  }
  // Generate new access token

  const newRefreshTokenArray = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  );
  jwt.verify(
    refreshToken,
    process.env.USER_REFRESH_TOKEN_SECRET,
    async (err, user) => {
      if (err) {
        foundUser.refreshToken = [...newRefreshTokenArray];
        await foundUser.save();
        return res.status(403).json({ error: "invalid token" });
      }
      if (err || foundUser.id !== user.id) return res.status(403);
      const roles = foundUser.role;

      const data = {
        id: user.id,
        role: roles,
      };
      const accessToken = jwt.sign(data, process.env.USER_ACCESS_TOKEN_SECRET, {
        expiresIn: "15s",
      });
      const newrefreshToken = jwt.sign(
        data,
        process.env.USER_REFRESH_TOKEN_SECRET,
        {
          expiresIn: "15d",
        }
      );
      foundUser.refreshToken = [...newRefreshTokenArray, newrefreshToken];
      await foundUser.save();
      res.cookie("refreshToken", newrefreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 15 * 24 * 60 * 60 * 1000,
      });
      res.json({ accessToken, user: foundUser });
    }
  );
};
module.exports = handleRefreshToken;
