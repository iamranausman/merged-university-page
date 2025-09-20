// app/api/internal/blogs/route.js
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db/db';
import { RowDataPacket } from 'mysql2';


export async function GET(request: NextRequest) {
  try{

    const slug = request.nextUrl.searchParams.get('slug');

    const [getblogs] = await pool.query<RowDataPacket[]>('SELECT * FROM blogs WHERE slug != ? ORDER BY created_at DESC LIMIT 3', [slug]);

    if(getblogs.length === 0)
    {
        return NextResponse.json({
            success: false,
            error: "No blogs found",
        }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        data: getblogs,
    }, { status: 200 });

  } catch (err) {
    console.error("❌ GET API Error:", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch blogs", 
      details: err.message 
    }, { status: 500 });
  }
}