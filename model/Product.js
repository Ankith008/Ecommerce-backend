const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  profile: [
    {
      type: String,
      require: true,
    },
  ],

  Productsize: [
    {
      type: String,
    },
  ],
  Productprice: {
    type: Number,
  },

  Productname: {
    type: String,
    require: true,
  },
  describtion: {
    type: String,
    require: true,
  },
  Numberoftotalorders: {
    type: Number,
  },
  Storesname: {
    type: mongoose.Schema.ObjectId,
    ref: "Stores",
  },
  reviews: [
    {
      reviewrating: {
        type: Number,
      },
      reviewdescribtion: {
        type: String,
      },
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    },
  ],
  ProductCategorie: [
    {
      type: String,
      require: true,
    },
  ],
});
module.exports = mongoose.model("Product", ProductSchema);
