import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  name: { type: String, required: true },      // e.g., "Matthew"
  chapters: { type: Number, required: true },  // e.g., 28
  status: { type: String, default: "available" }, // e.g., "available", "hidden"
  testament: { type: String, enum: ["Old", "New"], required: true }, // "Old" or "New"
});

// Prevent model overwrite
const Book = mongoose.models.Book || mongoose.model("Book", bookSchema);

export default Book;
