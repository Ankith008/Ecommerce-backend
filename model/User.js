const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  phoneNumber: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  orders: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Notification",
    },
  ],
  addtocart: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
  ],
  complaint: [
    {
      type: String,
    },
  ],
  Address: {
    type: String,
  },
  profile: {
    type: String,
  },
  whatheis: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
});

module.exports = mongoose.model("User", UserSchema);
