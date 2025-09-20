import pool from "../../../../lib/db/db";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";

// ------------------ Utility: Generate unique slug ------------------
async function generateUniqueSlug(title: string, excludeId: number | null = null) {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM posts WHERE slug = ? ${excludeId ? "AND id != ?" : ""}`,
      excludeId ? [uniqueSlug, excludeId] : [uniqueSlug]
    );
    if (rows.length === 0) break; // slug is unique
    uniqueSlug = `${slug}-${counter++}`;
  }

  return uniqueSlug;
}


// ------------------ GET posts with search + date filter + pagination ------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const search = searchParams.get("search")?.trim() || "";
    const startDate = searchParams.get("start_date")?.trim() || "";
    const endDate = searchParams.get("end_date")?.trim() || "";

    let whereClauses: string[] = [];
    let values: any[] = [];

    if (search) {
      whereClauses.push(`title LIKE ?`);
      values.push(`%${search}%`);
    }

    if (startDate && endDate) {
      whereClauses.push(`created_at BETWEEN ? AND ?`);
      values.push(startDate, endDate);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM posts ${whereSQL}`,
      values
    );
    const total = countRows[0]?.total || 0;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM posts ${whereSQL} ORDER BY id DESC LIMIT ? OFFSET ?`,
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
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching posts" },
      { status: 500 }
    );
  }
}

// ------------------ POST new post ------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug(body.title);

    const isActive = body.is_active === false ? 0 : 1; // default true if not passed

    const [result] = await pool.execute(
      `INSERT INTO posts (title, slug, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [
        body.title,
        slug,
        isActive,
        new Date(),
        new Date(),
      ]
    );

    const insertId = (result as any).insertId;
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM posts WHERE id = ?`, [insertId]);

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ------------------ PATCH edit post ------------------
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, title } = body;

    if (!id || !title) {
      return NextResponse.json(
        { success: false, error: "Post ID and title are required" },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug(title, id);
    const isActive = body.is_active === false ? 0 : 1;

    await pool.execute(
      `UPDATE posts SET title = ?, slug = ?, is_active = ?, updated_at = ? WHERE id = ?`,
      [title, slug, isActive, new Date(), id]
    );

    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM posts WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    console.error("Error editing post:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
