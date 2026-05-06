const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const BookRequestSchema = new mongoose.Schema(
  {
    bookName: { type: String, required: true },
    author: String,

    // Who requested it
    userId: mongoose.Schema.Types.ObjectId,
    userName: String,
    userEmail: String,

    // pending | fulfilled | rejected
    status: { type: String, default: "pending" },

    // Who fulfilled the request (when status becomes "fulfilled")
    fulfilledByUserId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

module.exports = mongoose.model("BookRequest", BookRequestSchema);
