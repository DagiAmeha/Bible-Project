import { connectDB } from "@/lib/mongodb";
import Book from "@/models/Book";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();

    const books = await Book.find();
    if(!books) return NextResponse.json({status: 'fail', message: "No book found" }, { status: 404 });

    console.log(books)

    return Response.json({ status: 'success', books: books });
  } catch (error) {
    return Response.json({ message: "Error fetching books" }, { status: 500 });
  }
}
