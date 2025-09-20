import { NextRequest, NextResponse } from "next/server";

import pool from "../../../../lib/db/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const article_id = searchParams.get('article_id');

    const [replies] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM replies WHERE article_id = ? AND status = 1',
      [article_id]
    );

    if(replies.length === 0){
        return NextResponse.json({
            success: false,
            message: 'No replies found for this article'
        });
    }

    return NextResponse.json({
        success: true,
        data: replies
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


export async function POST(request) {
  try {
    const body = await request.json();

    const {
      parent_comment_id,
      first_name,
      last_name,
      phone_number = '',
      email,
      comment,
      article_id = '0',
      article_url = '',
      type = 'blog',
      status = 0
    } = body;

    // Validate required fields
    const requiredFields = [
      { field: 'parent_comment_id', message: 'Parent comment ID is required' },
      { field: 'first_name', message: 'First name is required' },
      { field: 'last_name', message: 'Last name is required' },
      { field: 'email', message: 'Email is required' },
      { field: 'comment', message: 'Comment text is required' }
    ];

    const missingFields = requiredFields.filter(v => !body[v.field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: missingFields.map(mf => mf.message)
        },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Validate parent comment exists
    const [parentComment] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM comment WHERE comment_id = ?',
      [parseInt(parent_comment_id)]
    );

    if (parentComment.length === 0) {
      return NextResponse.json(
        { success: false, message: "The comment you're replying to doesn't exist." },
        { status: 404 }
      );
    }

    // Create reply
    const query = `
      INSERT INTO replies (parent_comment_id, first_name, last_name, phone_number, email, comment, article_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      parent_comment_id.toString(),
      first_name,
      last_name,
      phone_number,
      email,
      comment,
      article_id.toString(),
      Number(status) || 0,
      new Date(),
      new Date(),
    ];

    const [result] = await pool.execute<ResultSetHeader>(query, values);

    return NextResponse.json(
      {
        success: true,
        message: 'Your reply has been posted successfully.',
        data: result
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Reply submission error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred while processing your reply',
        error: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      },
      { status: 500 }
    );
  }
}