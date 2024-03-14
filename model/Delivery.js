const mongoose = require("mongoose");
const { Schema } = mongoose;

const DeliverySchema = new Schema({
  deliveryboyname: {
    type: String,
    require: true,
  },
  deliveryboyemail: {
    type: String,
    require: true,
  },
  deliveryboyphone: {
    type: Number,
    require: true,
  },
  deliveryboypassword: {
    type: String,
    require: true,
  },
  deliveryboyOrders: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Products",
    },
  ],
  deliveryboyAreaDelivery: [
    {
      type: String,
    },
  ],
  deliveryboyPrices: [
    {
      type: Number,
      require: true,
    },
  ],
  profile: {
    type: String,
  },
  whatheis: {
    type: String,
  },
  refreshToken: [String],
});

module.exports = mongoose.model("Delivery", DeliverySchema);
