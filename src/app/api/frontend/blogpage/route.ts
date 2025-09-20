import pool from "../../../../lib/db/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const startDate = searchParams.get("start_date") || "";
    const endDate = searchParams.get("end_date") || "";
    const popular = searchParams.get("popular") || "";
    const active = searchParams.get("active") || "";
    const country = searchParams.get("country") || "";
    const type = searchParams.get("type") || "";

    const skip = (page - 1) * limit;

    // Build WHERE conditions
    let where = "WHERE 1=1";
    let params: any[] = [];

    if (search) {
      where += " AND (title LIKE ? OR short_description LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      where += " AND category_id = ?";
      params.push(parseInt(category, 10));
    }

    if (startDate) {
      where += " AND created_at >= ?";
      params.push(`${startDate} 00:00:00`);
    }

    if (endDate) {
      where += " AND created_at <= ?";
      params.push(`${endDate} 23:59:59`);
    }

    if (popular !== "") {
      where += " AND is_featured = ?";
      params.push(popular === "true" ? 1 : 0);
    }

    if (active !== "") {
      where += " AND is_active = ?";
      params.push(active === "true" ? 1 : 0);
    }

    // Debug final query
    console.log("📋 WHERE:", where, params);

    const conn = await pool.getConnection();

    try {
      // Count total with filters
      const [countRows] = await conn.query(
        `SELECT COUNT(*) as count FROM blogs ${where}`,
        params
      );
      const totalCount = (countRows as any)[0].count;

      // Fetch paginated blogs
      const [rows] = await conn.query(
        `
        SELECT 
          id, title, short_description, description, image, category_id, user_id,
          is_active, is_featured, enable_meta_tags, created_at, updated_at,
          custom_post_type, seo, post_attributes, views, likes, rating_count,
          review_count, avg_review_value, slug
        FROM blogs
        ${where}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `,
        [...params, limit, skip]
      );

      const formattedPosts = (rows as any[]).map((post) => ({
        ...post,
        enable_meta_tags: !!post.enable_meta_tags,
        is_active: !!post.is_active,
        is_featured: !!post.is_featured,
      }));

      const totalPages = Math.ceil(totalCount / limit);

      return NextResponse.json({
        success: true,
        data: formattedPosts,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          startItem: skip + 1,
          endItem: Math.min(skip + formattedPosts.length, totalCount),
          actualItemsOnPage: formattedPosts.length,
        },
        filters: {
          country,
          category: category || null,
          search,
          startDate,
          endDate,
          popular,
          active,
        },
      });
    } finally {
      conn.release();
    }
  } catch (err: any) {
    console.error("❌ GET API Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch blogs",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
