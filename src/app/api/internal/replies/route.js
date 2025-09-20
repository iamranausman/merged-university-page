import { NextResponse } from 'next/server';
import pool from '../../../../lib/db/db';


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const article_id = searchParams.get('article_id');
    const parent_comment_id = searchParams.get('parent_comment_id');

    let queryParams = [];

    // Build dynamic where clause based on parameters
    let query = 'SELECT * FROM replies WHERE 1=1';

    if (article_id) {
      query += ' AND article_id = ?';
      queryParams.push(article_id.toString());
    }

    if (parent_comment_id) {
      query += ' AND parent_comment_id = ?';
      queryParams.push(parent_comment_id.toString());
    }

    query += ' ORDER BY created_at DESC LIMIT 100';


    // Execute the query
    const [rows] = await pool.execute(query, queryParams);


    return NextResponse.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Get replies error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while fetching replies',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}