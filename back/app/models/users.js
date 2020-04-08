const mongoose = require("mongoose");

const { Schema, model } = mongoose;
const userSchema = new Schema(
  {
    __v: { type: String, select: false },
    userName: { type: String, required: true },
    password: { type: String, required: true, select: false },
    // avatar_url: { type: String, required: false },
    sex: {
      type: String,
      enum: ["man", "woman"],
      default: "man",
      required: false
    },
    avatar: { type: String },
    age: {type: String},
    department: { type: String, required: false },
    phone: { type: String, required: false },
    email: { type: String, required: false },
    address: { type: Object, required: false },
    access: { type: [{type: String}], required: true },
    IDCard: { type: String }
  },
  {
    timestamps: true
  }
);

module.exports = model("User", userSchema);
