import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { fullName, email, password } = await req.json();
    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return Response.json({ message: "User already exists" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: fullName,
      email,
      password: hashed,
    });

    return Response.json({ message: "User created", user: newUser });
  } catch (error) {
    console.log(error);
    return Response.json({ message: "Error creating user" }, { status: 500 });
  }
}
