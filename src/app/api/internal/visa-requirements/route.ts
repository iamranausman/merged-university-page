import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    const {
      visa_country_id,
      visa_type_id,
      title,
      description,
    } = await request.json();

    // Validate required fields
    if (!visa_country_id || !visa_type_id || !title || !description) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    const [checkCountryID] = await pool.query<RowDataPacket[]>("SELECT * FROM visa_countries WHERE id = ?", [visa_country_id])

    if(checkCountryID.length === 0){
      return NextResponse.json(
        { error: "Visa country not found" },
        { status: 400 }
      );
    }

    const [checkVisaID] = await pool.query<RowDataPacket[]>("SELECT * FROM visa_types WHERE id = ?", [visa_type_id])

    if(checkVisaID.length === 0){
      return NextResponse.json(
        { error: "Visa type not found" },
        { status: 400 }
      );
    }

    // Insert into MySQL
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO visa_requirements 
        (visa_country_id, visa_type_id, title, description)
       VALUES (?, ?, ?, ?)`,
      [
        parseInt(visa_country_id),
        parseInt(visa_type_id),
        title,
        description,
      ]
    );

    return NextResponse.json(
      {
        message: "Visa requirement created successfully"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating visa requirement:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}



export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('country_id');

    // Build query
    const query = `
      SELECT
        vr.*,
        vc.country_name AS visa_country_name,
        vt.name AS visa_type_name
      FROM visa_requirements vr
      LEFT JOIN visa_countries vc ON vr.visa_country_id = vc.id
      LEFT JOIN visa_types vt ON vr.visa_type_id = vt.id
      WHERE vr.visa_country_id = ? ORDER BY created_at DESC
    `;

    // Execute query
    const [requirements] = await pool.query(query, countryId);

    return NextResponse.json({
      success: true,
      data: requirements,
      total: Array.isArray(requirements) ? requirements.length : 0
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching visa requirements:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}