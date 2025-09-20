
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db/db';
import { RowDataPacket } from 'mysql2';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const visa_country_id = searchParams.get('visa_country_id');

    const query = `
    SELECT 
      v.*,
      vc.country_name AS country_name 
    FROM visa_types v
    LEFT JOIN visa_countries vc ON v.visa_country_id = vc.id
    WHERE visa_country_id = ? ORDER BY created_at DESC
    `
    
    // Execute query
    const [rows] = await pool.query<RowDataPacket[]>(query, visa_country_id);

    return NextResponse.json({
      success: true,
      data: rows,
      total: Array.isArray(rows) ? rows.length : 0
    });

  } catch (error) {
    console.error('Error fetching visa types:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch visa types' },
      { status: 500 }
    );
  }
}