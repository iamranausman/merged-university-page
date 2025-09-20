
// app/api/internal/blogs/route.js
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db/db';

export async function GET(request: NextRequest) {

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;
    const articleIdParam = searchParams.get('article_id');
    const statusParam = searchParams.get('status');

    const skip = (page - 1) * limit;

    console.log("Article ID", articleIdParam)

    // Start constructing the WHERE clause dynamically
    let whereClauses = [];
    let queryParams = [];

    if (articleIdParam) {
      whereClauses.push('article_id = ?');
      queryParams.push(articleIdParam);
    }

    if(statusParam){
      whereClauses.push('status = ?');
      queryParams.push(statusParam);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      first_name,
      last_name,
      phone_number,
      email,
      comment,
      article_id,
      article_url,
      type
    } = body;

    // Validation
    if (!first_name || !last_name || !email || !comment || !article_id || !article_url) {
      return NextResponse.json(
        { success: false, message: "All required fields must be provided." },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format." },
        { status: 400 }
      );
    }

    // SQL query to insert the new comment into the database
    const query = `
      INSERT INTO comment (first_name, last_name, phone_number, email, comment, article_id, article_url, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      first_name,
      last_name,
      phone_number || null,
      email,
      comment,
      article_id.toString(),
      article_url,
      type || 'blog',
    ];

    // Execute the query
    const [result] = await pool.execute(query, values);


    return NextResponse.json(
      { 
        success: true, 
        message: "Comment submitted successfully", 
        data: result 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Comment submission error:", error);
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