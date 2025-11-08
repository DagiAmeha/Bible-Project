import { connectDB } from "@/lib/mongodb";
import Book from "@/models/Book";
import bcrypt from "bcrypt";

export async function GET(req: Request) {
  try {
    await connectDB();

    const books = await Book.find();
    console.log(books)

    return Response.json({ status: 'success', books: books });
  } catch (error) {
    return Response.json({ message: "Error fetching books" }, { status: 500 });
  }
}
