import pool from "../../../../lib/db/db";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";


// ------------------ POST new subscriber ------------------
export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid or missing JSON body" },
        { status: 400 }
      );
    }

    if (!body.email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Insert new subscriber
    const [result] = await pool.execute(
      `INSERT INTO subscribers (email, created_at, updated_at) VALUES (?, ?, ?)`,
      [body.email, new Date(), new Date()]
    );

    const insertId = (result as any).insertId;

    // Fetch newly inserted subscriber
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM subscribers WHERE id = ?`,
      [insertId]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    console.error("Error creating subscriber:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
