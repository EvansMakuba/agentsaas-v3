import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["client", "executor"],
    required: true,
  },
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 6,
  },
  resetToken: String,
  resetTokenExpiry: Date,
}, { timestamps: true });

export default mongoose.model("User", userSchema);
