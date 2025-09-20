import pool from "../../../../lib/db/db";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";

// ------------------ GET subscribers with search + pagination ------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const search = searchParams.get("search")?.trim() || "";

    let whereClauses: string[] = [];
    let values: any[] = [];

    if (search) {
      whereClauses.push(`email LIKE ?`);
      values.push(`%${search}%`);
    }

    const whereSQL =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Count total
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM subscribers ${whereSQL}`,
      values
    );
    const total = countRows[0]?.total || 0;

    // Fetch data
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM subscribers ${whereSQL} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    return NextResponse.json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: rows,
    });
  } catch (error: any) {
    console.error("Error fetching subscribers:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching subscribers" },
      { status: 500 }
    );
  }
}

