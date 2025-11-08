
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Schedule from "@/models/Schedule";

export async function GET(req: Request, { params }:{params:  Promise<{book: string}>}) {
  const { book } = await params;
  console.log(book);

  try{
    await connectDB();

    const schedules = await Schedule.find({ books: { $in: [book] } });
    console.log(schedules)
    return NextResponse.json({status: 'success', schedules: schedules});
  }catch(error){
    return NextResponse.json({status:'error', message: 'error fetching schedules'}, {status: 500})
  }
}
