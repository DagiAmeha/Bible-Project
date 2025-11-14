import { NextRequest, NextResponse } from "next/server";

// This route handler is kept for compatibility, but Socket.IO is actually
// handled by the custom server.js file. Socket.IO will intercept requests
// to /api/socket before they reach this handler.
export async function GET(req: NextRequest) {
  return NextResponse.json({ message: "Socket.IO endpoint" }, { status: 200 });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: "Socket.IO endpoint" }, { status: 200 });
}
