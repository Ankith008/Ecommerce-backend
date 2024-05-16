const express = require("express");
const router = express.Router();
const User = require("../model/User");
const { body, validationResult } = require("express-validator");
const Delivery = require("../model/Delivery");
const Product = require("../model/Product");
const Company = require("../model/Company");
const Store = require("../model/Stores");
require("dotenv").config({ path: "backend.env" });
const handleRefreshToken = require("../controllers/handleRefreshToken");
const handleAccessToken = require("../middleware/handleAccessToken");
const Notification = require("../model/Notification");

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

router.get("/store/:id", async (req, res) => {
  try {
    const storeid = req.params.id.toString();
    const store = await Store.findById(storeid).populate("products");
    const stores = {
      id: store._id,
      storename: store.storename,
      storeBranch: store.storeBranch,
      storeIncharegename: store.storeIncharegename,
      storeIncharegenumber: store.storeIncharegenumber,
      storeAddress: store.storeAddress,
      profile: store.profile,
      storeemail: store.storeemail,
      products: store.products,
    };
    res.status(200).json({ success: true, store: stores });
  } catch (error) {
    console.error("Error finding store:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/product/:element", async (req, res) => {
  try {
    const element = req.params.element;
    const productlist = [];
    const product = await Product.find({
      $or: [
        { Productname: { $regex: element, $options: "i" } },
        { describtion: { $regex: element, $options: "i" } },
        { ProductCategorie: { $regex: element, $options: "i" } },
      ],
    });
    product.map((item) => {
      productlist.push(item);
    });
    res.status(200).json({ success: true, product: productlist });
  } catch (error) {
    console.error("Error finding product:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/productdetails/:id", async (req, res) => {
  const id = req.params.id;

  const product = await Product.findOne({ _id: id });
  return res.status(200).json({ success: true, product });
});

router.post("/addtocartproduct", handleAccessToken, async (req, res) => {
  const products = await User.findById(req.user).populate("addtocart");
  const product = products.addtocart;
  return res.json({ success: true, product });
});

router.post("/addtocart/:id", handleAccessToken, async (req, res) => {
  try {
    const productid = req.params.id;
    const user = await User.findByIdAndUpdate(
      req.user,
      {
        $push: { addtocart: productid },
      },
      { new: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.post("/orders/:id", handleAccessToken, async (req, res) => {
  const { size, quantity, finalprice } = req.body;
  const users = await User.findById(req.user);
  let products = await Product.findById(req.params.id);

  const productid = req.params.id;

  let note = await Notification.create({
    name: users.name,
    address: users.Address,
    phone: users.phoneNumber,
    productid: productid,
    productname: products.Productname,
    productprice: finalprice,
    productsize: size,
    status: "Pending",
    payment: "Pending",
    productquantity: quantity,
  });

  const user = await User.findByIdAndUpdate(
    req.user,
    {
      $push: { orders: note._id },
    },
    { new: true }
  );

  const product = await Product.findById(productid);
  const store = await Store.findByIdAndUpdate(
    product.Storesname,
    {
      $push: { orders: note._id },
    },
    { new: true }
  );

  res.status(200).json({ success: true });
});

router.get("/findorders", handleAccessToken, async (req, res) => {
  const user = await User.findById(req.user).populate("orders");
  try {
    const orders = user.orders;

    return res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, error: "Internal Server Issue" });
  }
});

router.get("/findstoreorders/:id", handleAccessToken, async (req, res) => {
  try {
    const company = await Company.findById(req.company);
    const id = req.params.id;
    const store = await Store.findById(id).populate("orders");
    if (company.id === store.companyname.toString()) {
      const orders = store.orders;
      return res.json({ success: true, orders });
    } else {
      return res.json({ success: false, error: "You Are Not Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, error: "Internal Server Issue" });
  }
});
router.post("/status", handleAccessToken, async (req, res) => {
  try {
    const { storeid, noteid, status } = req.body;
    const id = req.params.id;
    const company = await Company.findById(req.company);
    const store = await Store.findById(storeid).populate("orders");
    if (company.id === store.companyname.toString()) {
      const storeorder = store.orders;
      const order = storeorder.find((item) => item._id.toString() === noteid);
      if (order) {
        const note = await Notification.findByIdAndUpdate(
          noteid,
          {
            $set: { status: status },
          },
          { new: true }
        );
        await note.save();
      } else {
        return res.json({ success: false, error: "Error in Setting Status" });
      }
    } else {
      return res.json({ success: false, error: "You Are Not Unauthorized" });
    }
    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, error: "Internal Server Issue" });
  }
});

module.exports = router;
