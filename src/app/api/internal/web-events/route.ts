import pool from "../../../../lib/db/db";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";

// ------------------ GET all web events ------------------
export async function GET(req: Request) {
  try {
    const startTime = Date.now();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const search = searchParams.get("search")?.trim() || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const skip = (page - 1) * limit;
    const params: any[] = [];
    let where = "WHERE 1=1";

    // Search filter
    if (search) {
      where +=
        " AND (type LIKE ? OR action_button LIKE ? OR page_hit_name LIKE ? OR whatsapp_button_text LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Date range filter
    if (startDate && endDate) {
      where += " AND DATE(created_at) BETWEEN ? AND ?";
      params.push(startDate, endDate);
    } else if (startDate) {
      where += " AND DATE(created_at) >= ?";
      params.push(startDate);
    } else if (endDate) {
      where += " AND DATE(created_at) <= ?";
      params.push(endDate);
    }

    // Count total
    const [countRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as totalCount FROM web_events ${where}`,
      params
    );
    const totalCount = (countRows[0] as any).totalCount;

    // Fetch events
    const [events] = await pool.execute<RowDataPacket[]>(
      `SELECT id, type, action_button, page_hit_name, whatsapp_button_text, created_at
       FROM web_events
       ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, skip]
    );

    const totalPages = Math.ceil(totalCount / limit);
    const responseTime = Date.now() - startTime;

    console.log("🔍 Web Events API: Response details:", {
      totalCount,
      totalPages,
      eventsReturned: events.length, // ✅ Now safe
      responseTime: `${responseTime}ms`,
    });

    return NextResponse.json({
      success: true,
      data: events,
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("❌ Web Events API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch web events" },
      { status: 500 }
    );
  }
}
