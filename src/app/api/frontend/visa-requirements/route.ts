
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('visa_country_id');

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