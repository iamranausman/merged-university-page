import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Validate required fields
    if (!data.visa_country_id || !data.name) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    const [checkCountryID] = await pool.query<RowDataPacket[]>("SELECT * FROM visa_countries WHERE id = ?", [data.visa_country_id])

    if(checkCountryID.length === 0){
      return NextResponse.json(
        { error: "Visa country not found" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM visa_types WHERE visa_country_id = ? AND name = ?", [data.visa_country_id, data.name]);

    if( rows.length > 0 ){
      return NextResponse.json(
        { success: false, message: 'Visa type already exists' },
        { status: 400 }
      );
    }

    const [newType] = await pool.query<ResultSetHeader>("INSERT INTO visa_types (visa_country_id, name) VALUES(?, ?) ", [data.visa_country_id, data.name])

    if(newType.affectedRows === 0){
      return NextResponse.json(
        { success: false, message: 'Visa type not created' },
        { status: 400 }
      );
    }

    const [freshData] = await pool.query<RowDataPacket[]>("SELECT * FROM visa_types WHERE visa_country_id = ?", [data.visa_country_id])

    return NextResponse.json({
      success: true,
      message: 'Visa type created successfully',
      data: freshData
    }, { status: 201 });


  } catch (error) {
    console.error('Error creating visa type:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const visa_country_id = searchParams.get('country_id');

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