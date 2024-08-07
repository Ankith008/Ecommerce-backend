const express = require("express");
const router = express.Router();
const User = require("../model/User");
const multer = require("multer");
const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single("profile");
const multerUploads1 = multer({ storage }).array("profile", 5);
const { v2: cloudinary } = require("cloudinary");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const Product = require("../model/Product");
const Delivery = require("../model/Delivery");
const Company = require("../model/Company");
const Store = require("../model/Stores");
require("dotenv").config();
const handleRefreshToken = require("../controllers/handleRefreshToken");
const handleAccessToken = require("../middleware/handleAccessToken");
const handledetails = require("../controllers/handledetails");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//user auth

router.post(
  "/createuser",
  multerUploads,
  [
    body("name").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.json({
        success: false,
        error: "Input Requirement is not fullfilled",
      });
    }
    try {
      let unique = uuidv4();
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "Ecommers Users",
        public_id: unique,
      });
      const url = result.secure_url;
      const { name, email, phoneNumber, password, Address } = req.body;
      let user = await User.findOne({ email: email });
      if (user) {
        return res.status(409).json({
          success: false,
          error: "User Already Present please try to login",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const secpass = await bcrypt.hash(password, salt);

      user = await User.create({
        profile: url,
        name: name,
        email: email,
        phoneNumber: phoneNumber,
        password: secpass,
        whatheis: "User",
        Address: Address,
      });
      const data = {
        id: user.id,
        role: "User",
      };

      const accessToken = jwt.sign(data, process.env.USER_ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
      });

      const newrefreshToken = jwt.sign(
        data,
        process.env.USER_REFRESH_TOKEN_SECRET,
        {
          expiresIn: "15d",
        }
      );

      user.refreshToken = newrefreshToken;
      await user.save();

      res.cookie("refreshToken", newrefreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 15,
      });

      res.status(201).json({ success: true, accessToken });
    } catch (error) {
      console.log(error);
      return res.status(500).send("Internal Server Issue");
    }
  }
);

router.post(
  "/loginuser",
  [body("email").isEmail(), body("password").exists()],
  async (req, res) => {
    const cookies = req.cookies;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.json({
        success: false,
        error: "Input Requirement is not fullfilled",
      });
    }
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, error: "Not Found" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({
          success: false,
          error: "Please Enter the Valid Credencials",
        });
      }
      const data = {
        id: user.id,
        role: "User",
      };

      const accessToken = jwt.sign(data, process.env.USER_ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
      });

      const newrefreshToken = jwt.sign(
        data,
        process.env.USER_REFRESH_TOKEN_SECRET,
        {
          expiresIn: "15d",
        }
      );

      user.refreshToken = newrefreshToken;

      await user.save();

      res.cookie("refreshToken", newrefreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 15,
      });

      return res.status(200).json({ success: true, accessToken });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, error: "Internal Server Issue" });
    }
  }
);

//Delivery auth

router.post(
  "/createdeliveryboy",
  multerUploads,
  [
    body("deliveryboyname").isLength({ min: 3 }),
    body("deliveryboyemail").isEmail(),
    body("deliveryboyphone").isLength(10),
    body("deliveryboypassword").isLength({ min: 5 }),
    body("deliveryboyPrices").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.json({
        success: false,
        error: "Input Requirement is not fullfilled",
      });
    }
    try {
      let unique = uuidv4();
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "Ecommers Delivery boy",
        public_id: unique,
      });
      const url = result.secure_url;

      const {
        deliveryboyname,
        deliveryboyemail,
        deliveryboyphone,
        deliveryboypassword,
        deliveryboyPrices,
        deliveryboyAreaDelivery,
      } = req.body;
      let user = await Delivery.findOne({
        deliveryboyemail: deliveryboyemail,
      });
      if (user) {
        return res.status(409).json({
          success: false,
          error: "Delivery Boy Already Present please try to login",
        });
      }

      const Salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(deliveryboypassword, Salt);

      user = await Delivery.create({
        profile: url,
        deliveryboyname: deliveryboyname,
        deliveryboyemail: deliveryboyemail,
        deliveryboyphone: deliveryboyphone,
        deliveryboypassword: secPass,
        deliveryboyAreaDelivery: deliveryboyAreaDelivery,
        deliveryboyPrices: deliveryboyPrices,
        whatheis: "DeliveryBoy",
      });
      const data = {
        id: user.id,
        role: "Delivery boy",
      };

      const accessToken = jwt.sign(
        data,
        process.env.DELIVERY_ACCESS_TOKEN_SECRET,
        {
          expiresIn: "15m",
        }
      );

      const newrefreshToken = jwt.sign(
        data,
        process.env.DELIVERY_REFRESH_TOKEN_SECRET,
        {
          expiresIn: "15d",
        }
      );

      user.refreshToken = newrefreshToken;

      await user.save();

      res.cookie("refreshToken", newrefreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 15,
      });

      return res.status(200).json({ success: true, accessToken });
    } catch (error) {
      console.log(error);
      return res.status(500).send("Internal Server Issue");
    }
  }
);

router.post(
  "/logindeliveryboy",
  [
    body("deliveryboyemail").isEmail(),
    body("deliveryboypassword").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        error: "Input Requirement is not fullfilled",
      });
    }
    try {
      const { deliveryboypassword, deliveryboyemail } = req.body;
      const user = await Delivery.findOne({ deliveryboyemail });
      if (!user) {
        return res.status(404).json({ success: false, error: "Not Found" });
      }
      const passwordCompare = await bcrypt.compare(
        deliveryboypassword,
        user.deliveryboypassword
      );
      if (!passwordCompare) {
        return res.status(400).json({
          success: false,
          error: "Please Enter the Valid Credencials",
        });
      }
      const data = {
        id: user.id,
        role: "Delivery boy",
      };

      const accessToken = jwt.sign(
        data,
        process.env.DELIVERY_ACCESS_TOKEN_SECRET,
        {
          expiresIn: "15m",
        }
      );

      const newrefreshToken = jwt.sign(
        data,
        process.env.DELIVERY_REFRESH_TOKEN_SECRET,
        {
          expiresIn: "15d",
        }
      );

      user.refreshToken = newrefreshToken;

      await user.save();

      res.cookie("refreshToken", newrefreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 15,
      });

      return res.status(200).json({ success: true, accessToken });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal Server Issue" });
    }
  }
);

// stores auth

router.post(
  "/createStore",
  handleAccessToken,
  multerUploads,
  [
    body("storename").isLength({ min: 3 }),
    body("storeIncharegename").isLength({ min: 3 }),
    body("storeIncharegenumber").exists(),
    body("storeAddress").isLength({ min: 3 }),
    body("storeemail").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        error: "Input Requirement is not fullfilled",
      });
    }
    try {
      let unique = uuidv4();
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "Ecommers Stores",
        public_id: unique,
      });
      const url = result.secure_url;
      const {
        storename,
        storeBranch,
        storeIncharegename,
        storeIncharegenumber,
        storeAddress,
        storeemail,
        categories,
      } = req.body;
      let store = await Store.findOne({
        storeemail: storeemail,
      });
      if (store) {
        return res.status(409).json({
          success: false,
          error: "Store Already Present",
        });
      }

      let categorie = [];
      if (categories.length !== 0) {
        categorie = categories.split(",");
      }

      store = await Store.create({
        profile: url,
        storename: storename,
        storeBranch: storeBranch,
        storeIncharegename: storeIncharegename,
        storeIncharegenumber: storeIncharegenumber,
        storeAddress: storeAddress,
        storeemail: storeemail,
        companyname: req.company,
        categories: categorie,
        whatheis: "Store",
      });

      await store.save();

      const comp = await Company.findByIdAndUpdate(req.company);
      if (!comp) {
        return res.status(404).json({ success: false, error: "Not Found" });
      }

      const company = await Company.findByIdAndUpdate(
        req.company,
        { $push: { stores: store._id } },
        { new: true }
      );

      return res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Issue");
    }
  }
);

// company auth

router.post(
  "/createcompany",
  multerUploads,
  [
    body("companyname").isLength({ min: 3 }),
    body("companyowner").isLength({ min: 3 }),
    body("companyemail").isEmail(),
    body("companyownernumber").isLength(10),
    body("companypassword").isLength({ min: 5 }),
    body("companylocation").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const cookies = req.cookies;
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        error: "Input Requirement is not fullfilled",
      });
    }
    try {
      let unique = uuidv4();
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "Ecommers Company",
        public_id: unique,
      });
      const url = result.secure_url;
      const {
        companyname,
        companyowner,
        companyownernumber,
        companyemail,
        companypassword,
        companylocation,
      } = req.body;
      let user = await Company.findOne({
        companyemail: companyemail,
      });
      if (user) {
        return res.status(409).json({
          success: false,
          error: "Company Already Present please try to login",
        });
      }

      const Salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(companypassword, Salt);

      user = await Company.create({
        profile: url,
        companyname: companyname,
        companyowner: companyowner,
        companyemail: companyemail,
        companyownernumber: companyownernumber,
        companypassword: secPass,
        companylocation: companylocation,
        whatheis: "Company",
      });
      const data = {
        id: user.id,

        role: "Company",
      };
      const accessToken = jwt.sign(
        data,
        process.env.COMPANY_ACCESS_TOKEN_SECRET,
        {
          expiresIn: "15m",
        }
      );

      const newrefreshToken = jwt.sign(
        data,
        process.env.COMPANY_REFRESH_TOKEN_SECRET,
        {
          expiresIn: "15d",
        }
      );

      user.refreshToken = newrefreshToken;

      await user.save();

      res.cookie("refreshToken", newrefreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 15,
      });

      return res.status(200).json({ success: true, accessToken });
    } catch (error) {
      res.status(500).send("Internal Server Issue");
    }
  }
);

router.post(
  "/logincompany",
  [
    body("companyemail").isEmail(),
    body("companypassword").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const cookies = req.cookies;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        error: "Input Requirement is not fullfilled",
      });
    }
    try {
      const { companyemail, companypassword } = req.body;

      let user = await Company.findOne({ companyemail });
      if (!user) {
        return res.status(404).json({ success: false, error: "Not Found" });
      }
      const passwordCompare = await bcrypt.compare(
        companypassword,
        user.companypassword
      );
      if (!passwordCompare) {
        return res.status(400).json({
          success: false,
          error: "Please Enter the Valid Credencials",
        });
      }
      const data = {
        id: user.id,

        role: "Company",
      };
      const accessToken = jwt.sign(
        data,
        process.env.COMPANY_ACCESS_TOKEN_SECRET,
        {
          expiresIn: "15m",
        }
      );

      const newrefreshToken = jwt.sign(
        data,
        process.env.COMPANY_REFRESH_TOKEN_SECRET,
        {
          expiresIn: "15d",
        }
      );

      user.refreshToken = newrefreshToken;

      await user.save();

      res.cookie("refreshToken", newrefreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 15,
      });

      return res.status(200).json({ success: true, accessToken });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: "Internal Server Issue" });
    }
  }
);

//products

router.post(
  "/createproduct",
  handleAccessToken,
  multerUploads1,
  [
    body("Productname").isLength({ min: 3 }),
    body("Productsize").isLength({ min: 1 }),
    body("Productprice").isLength({ min: 1 }),
    body("describtion").isLength({ min: 10 }),
    body("ProductCategorie").isLength({ min: 3 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        error: "Input Requirement is not fullfilled",
      });
    }
    try {
      const images = req.files;
      const imageUrls = [];
      for (const image of images) {
        const unique = uuidv4();
        const b64 = Buffer.from(image.buffer).toString("base64");
        const dataURI = "data:" + image.mimetype + ";base64," + b64;
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "Ecommers Products",
          public_id: unique,
        });
        imageUrls.push(result.secure_url);
      }

      const {
        Productsize,
        Productprice,
        Productname,
        describtion,
        Storesname,
        ProductCategorie,
      } = req.body;

      const productcat = ProductCategorie.split(",");
      const productsize = Productsize.split(",");

      const product = await Product.create({
        profile: imageUrls,
        Productname: Productname,
        Productsize: productsize,
        Productprice: Productprice,
        describtion: describtion,
        Storesname: Storesname,
        ProductCategorie: productcat,
      });

      await product.save();
      const store = await Store.findByIdAndUpdate(
        Storesname,
        { $push: { products: product._id } },
        { new: true }
      );

      // const company = await Company.findById(req.company).populate("stores");
      // const storeIndex = company.stores.findIndex(
      //   (store) => store._id.toString() === Storesname
      // );
      // if (storeIndex === -1) {
      //   return res
      //     .status(404)
      //     .json({ success: false, error: " Store Not Found" });
      // } else {
      //   await company.stores[storeIndex].products.push(product._id);
      //   await company.save();
      // }

      return res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: "Internal Server Issue" });
    }
  }
);

//logout

router.post("/logout", (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Internal Issue" });
  }
});

//refresh token handle

router.post("/refresh", handleRefreshToken);

//details

router.post("/finddetail", handleAccessToken, handledetails);

//update

router.post("/update", handleAccessToken, async (req, res) => {
  try {
    const { id, name, email, prepassword, newpassword, Address, phoneNumber } =
      req.body;
    const users = await User.findById(id);
    const passwordCompare = await bcrypt.compare(prepassword, users.password);
    if (!passwordCompare) {
      return res.status(400).json({
        success: false,
        error: "Please Enter the Valid Credencials",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const secpass = await bcrypt.hash(newpassword, salt);
    const user = await User.findByIdAndUpdate(id, {
      name: name,
      email: email,
      password: secpass,
      Address: Address,
      phoneNumber: phoneNumber,
    });
    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Internal Issue" });
  }
});

router.post("/comupdate", handleAccessToken, async (req, res) => {
  try {
    const { id, name, email, prepassword, newpassword, Address, phoneNumber } =
      req.body;
    const users = await Company.findById(id);
    const passwordCompare = await bcrypt.compare(
      prepassword,
      users.companypassword
    );
    if (!passwordCompare) {
      return res.status(400).json({
        success: false,
        error: "Please Enter the Valid Credencials",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const secpass = await bcrypt.hash(newpassword, salt);
    const user = await Company.findByIdAndUpdate(id, {
      companyname: name,
      companyemail: email,
      companypassword: secpass,
      companylocation: Address,
      companyownernumber: phoneNumber,
    });
    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Internal Issue" });
  }
});

module.exports = router;
