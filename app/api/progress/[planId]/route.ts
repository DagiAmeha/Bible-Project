import { connectDB } from "@/lib/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import Progress from "@/models/Progress";


export async function GET(req: Request, {params}: {params: Promise<{
planId: string
}>}) {

const {planId} = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    await connectDB();

    let progress = await Progress.findOne({
        userId: session.user.id,
        planId,
      });
    console.log(session.user.id ,planId)
    console.log(progress)
    return Response.json({ status: 'success', progress: progress });
  } catch (error) {
    return Response.json({status:'fail', message: "Error fetching progress" }, { status: 500 });
  }
}
