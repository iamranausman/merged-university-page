
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db/db';


export async function GET(request) {

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;
    const articleIdParam = searchParams.get('article_id');
    const statusParam = searchParams.get('status');
    const allParam = searchParams.get('all');
    const search = (searchParams.get('search') || '').trim();
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');

    const skip = (page - 1) * limit;

    console.log("Article ID", articleIdParam)

    // Start constructing the WHERE clause dynamically
    let whereClauses = [];
    let queryParams = [];

    if (articleIdParam) {
      whereClauses.push('article_id = ?');
      queryParams.push(articleIdParam);
    }

    const wantAll = (statusParam && statusParam.toLowerCase() === 'all') || (allParam && allParam.toLowerCase() === 'true');
    if (!wantAll) {
      whereClauses.push('status = ?');
      queryParams.push(statusParam || '1');
    }

    if (search) {
      const tokens = search.split(/\s+/).filter(Boolean);
      tokens.forEach((token, index) => {
        whereClauses.push(`(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR comment LIKE ? OR article_url LIKE ?)`);
        queryParams.push(`%${token}%`, `%${token}%`, `%${token}%`, `%${token}%`, `%${token}%`);
      });
    }

    if (fromDate || toDate) {
      if (fromDate) {
        const d = new Date(fromDate);
        if (!isNaN(d)) {
          whereClauses.push('created_at >= ?');
          queryParams.push(d);
        }
      }
      if (toDate) {
        const d = new Date(toDate);
        if (!isNaN(d)) {
          whereClauses.push('created_at <= ?');
          queryParams.push(d);
        }
      }
    }

    // Combine all WHERE clauses
    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Get total count for pagination
    const [countResults] = await pool.execute(
      `SELECT COUNT(*) AS totalCount FROM comment ${whereSQL}`,
      queryParams
    );
    const totalCount = countResults[0].totalCount;

    // Get paginated data
    const [comments] = await pool.execute(
      `SELECT 
        comment_id, first_name, last_name, email, comment, article_url, status, created_at
       FROM comment 
       ${whereSQL} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, skip]
    );

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({ 
      success: true, 
      data: comments,
      meta: {
        totalItems: totalCount,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Server error", 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      }, 
      { status: 500 }
    );
  }
}