const mongoose = require("mongoose");
const { Schema } = mongoose;

const ProductSchema = new Schema({
  Productimages: [
    {
      type: String,
      require: true,
    },
  ],
  Productsizes: [
    {
      productsize: {
        type: String,
      },
      productprice: {
        type: Number,
      },
    },
  ],
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
module.exports = mongoose.model("Products", ProductSchema);
