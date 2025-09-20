import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../lib/db/db';
import { RowDataPacket } from 'mysql2';


export async function POST(request: NextRequest) {
  try{
    const body = await request.json();

    const {slug} = body;

    console.log("Slug", slug)

    const [results] = await pool.query<RowDataPacket[]>("SELECT * FROM blogs WHERE slug = ?", [slug]);

    if(results.length === 0){
      return NextResponse.json({
        success: false,
        error: "Blog not found",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: results[0],
    }, { status: 200 });

  }
  catch (err) {
    console.error("❌ GET API Error:", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch blogs", 
      details: err.message 
    }, { status: 500 });
  }
}