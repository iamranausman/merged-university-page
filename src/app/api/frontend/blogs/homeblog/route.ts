// app/api/internal/blogs/route.js
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../lib/db/db';
import { RowDataPacket } from 'mysql2';
import { CopyObjectOutputFilterSensitiveLog } from '@aws-sdk/client-s3';


export async function GET(request: NextRequest) {
  try{


    const [getblogs] = await pool.query<RowDataPacket[]>('SELECT id, title, slug, image, created_at FROM blogs WHERE is_active = 1 AND is_featured=1 ORDER BY created_at DESC LIMIT 8');

    if(getblogs.length === 0)
    {
        return NextResponse.json({
            success: false,
            error: "No blogs found",
        }, { status: 404 });
    }

    console.log()

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