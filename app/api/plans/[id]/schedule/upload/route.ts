import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Schedule from "@/models/Schedule";
import mongoose from "mongoose";

// Simple CSV parser that supports quoted fields and commas inside quotes.
function parseCSV(text: string) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const rows: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // skip empty

    const fields: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"') {
        if (inQuotes && line[j + 1] === '"') {
          // escaped quote
          cur += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        fields.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    fields.push(cur.trim());
    rows.push(fields);
  }

  return rows;
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const planId = params.id;

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { status: "fail", message: 'Missing file field (name="file")' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      return NextResponse.json(
        { status: "fail", message: "CSV is empty" },
        { status: 400 }
      );
    }

    // Expect header row with day,portion,books (case-insensitive)
    const header = rows[0].map((h) => h.toString().toLowerCase());
    const expected = ["day", "portion", "books"];
    const headerOk = expected.every((col) => header.includes(col));
    if (!headerOk) {
      return NextResponse.json(
        {
          status: "fail",
          message: `CSV header must include: ${expected.join(",")}`,
        },
        { status: 400 }
      );
    }

    // map column indices
    const idx = {
      day: header.indexOf("day"),
      portion: header.indexOf("portion"),
      books: header.indexOf("books"),
    };

    const dataRows = rows.slice(1);
    const docs: any[] = [];

    for (let r = 0; r < dataRows.length; r++) {
      const row = dataRows[r];
      if (row.length === 0) continue;

      const rawDay = row[idx.day];
      const dayNum = Number(rawDay);
      if (!rawDay || Number.isNaN(dayNum)) {
        return NextResponse.json(
          {
            status: "fail",
            message: `Invalid day value on CSV row ${r + 2}: ${rawDay}`,
          },
          { status: 400 }
        );
      }

      const portion = row[idx.portion] ?? "";
      const booksField = row[idx.books] ?? "";
      // split books by comma and trim
      const books = booksField
        .split(",")
        .map((b) => b.trim())
        .filter((b) => b.length > 0);

      docs.push({
        planId: new mongoose.Types.ObjectId(planId),
        day: dayNum,
        portion: portion.toString(),
        books,
      });
    }

    // Replace existing schedule for this plan
    await Schedule.deleteMany({ planId: new mongoose.Types.ObjectId(planId) });
    if (docs.length > 0) {
      await Schedule.insertMany(docs);
    }

    return NextResponse.json({ status: "success", count: docs.length });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { status: "fail", message: err?.message || "Error uploading schedule" },
      { status: 500 }
    );
  }
}
