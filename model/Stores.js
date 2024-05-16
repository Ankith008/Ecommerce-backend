const mongoose = require("mongoose");
const { Schema } = mongoose;

const StoresSchema = new Schema({
  storename: {
    type: String,
    require: true,
  },

  storeBranch: {
    type: String,
    require: true,
  },
  storeIncharegename: {
    type: String,
    require: true,
  },
  storeIncharegenumber: {
    type: Number,
    require: true,
  },
  storeAddress: {
    type: String,
    require: true,
  },
  profile: {
    type: String,
  },
  storeemail: {
    type: String,
    require: true,
  },
  companyname: {
    type: mongoose.Schema.ObjectId,
    require: true,
  },
  totalorders: {
    type: Number,
  },
  categories: [
    {
      type: String,
    },
  ],
  orders: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Notification",
    },
  ],

  products: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
  ],
  whatheis: {
    type: String,
  },
});

module.exports = mongoose.model("Stores", StoresSchema);
