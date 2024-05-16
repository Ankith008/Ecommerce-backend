const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  address: {
    type: String,
    require: true,
  },
  phone: {
    type: Number,
    require: true,
  },
  productid: {
    type: mongoose.Schema.ObjectId,
    require: true,
  },
  productname: {
    type: String,
    require: true,
  },
  productprice: {
    type: Number,
    require: true,
  },
  productsize: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    require: true,
  },
  payment: {
    type: String,
    require: true,
  },
  productquantity: {
    type: Number,
    require: true,
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);
