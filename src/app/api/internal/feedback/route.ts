import pool from "../../../../lib/db/db";
import { NextResponse } from "next/server";

// ------------------ GET all feedbacks ------------------
export async function GET(req: Request) {
  try {
    const startTime = Date.now();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const search = searchParams.get("search") || "";
    const consultant = searchParams.get("consultant") || "";
    const rating = searchParams.get("rating") || "";
    const startDate = searchParams.get("start_date") || "";
    const endDate = searchParams.get("end_date") || "";

    const offset = (page - 1) * limit;

    let whereClauses: string[] = [];
    let values: any[] = [];

    if (search) {
      whereClauses.push(`(full_name LIKE ? OR contact_number LIKE ?)`);
      values.push(`%${search}%`, `%${search}%`);
    }

    if (consultant) {
      whereClauses.push(`consultant_id = ?`);
      values.push(consultant);
    }

    if (rating) {
      whereClauses.push(`rating = ?`);
      values.push(rating);
    }

    if (startDate && endDate) {
      whereClauses.push(`DATE(created_at) BETWEEN ? AND ?`);
      values.push(startDate, endDate);
    }

    const whereSql =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Count total records
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM client_feedbacks ${whereSql}`,
      values
    );
    const totalItems = (countRows as any)[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch paginated data
    const [rows] = await pool.query(
      `SELECT * FROM client_feedbacks ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: "Feedback list fetched successfully",
      data: rows,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
      executionTime: `${executionTime}ms`,
    });
  } catch (error) {
    console.error("GET /feedbacks error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch feedbacks" },
      { status: 500 }
    );
  }
}
