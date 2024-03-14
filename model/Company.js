const mongoose = require("mongoose");
const { Schema } = mongoose;

const CompanySchema = new Schema({
  companyname: {
    type: String,
    require: true,
  },
  profile: {
    type: String,
    require: true,
  },
  companyowner: {
    type: String,
    require: true,
  },
  companyownernumber: {
    type: Number,
    require: true,
  },
  companyemail: {
    type: String,
    require: true,
  },
  companypassword: {
    type: String,
    require: true,
  },
  companylocation: {
    type: String,
    require: true,
  },
  stores: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Stores",
    },
  ],
  whatheis: {
    type: String,
  },
  refreshToken: [String],
});
module.exports = mongoose.model("Company", CompanySchema);
