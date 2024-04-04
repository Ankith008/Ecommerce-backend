const mongoose = require("mongoose");
require("dotenv").config();

const connectToMongo = async () => {
  try {
    await mongoose.connect(`${process.env.API_LINK}`);
    console.log("Connected to mongodb database Successfully");
  } catch (error) {
    console.log(error);
    console.log("Unable to Connect to the mongodb");
  }
};

module.exports = connectToMongo;
