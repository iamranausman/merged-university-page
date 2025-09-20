// app/api/internal/visa-country/[id]/route.js
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db/db';
import { RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const slug = searchParams.get('slug') || '';

    let visaType = [];
    let visaRequirements = [];

    const [result] = await pool.query<RowDataPacket[]>(`
      SELECT id, country_name, description, continent, banner_image, country_image, price, discount_price, currency, created_at, slug
      FROM visa_countries
      WHERE slug = ?
    `, [slug]);

    if(result.length === 0)
    {

        return NextResponse.json(
            { success: false, message: 'No visa country found' },
            { status: 404 }
        );
    }

    const [visa_types] = await pool.query<RowDataPacket[]>("SELECT id, name, visa_country_id FROM visa_types WHERE visa_country_id = ?", [result[0].id])

    if(visa_types.length === 0)
    {
        visaType = [];
    }
    else
    {
        visaType = visa_types;
    }

    const [visa_requirements] = await pool.query<RowDataPacket[]>("SELECT id, visa_country_id, visa_type_id, title, description, created_at FROM visa_requirements WHERE visa_country_id = ?", [result[0].id])

    if(visa_requirements.length === 0)
    {
        visaRequirements = []
    }
    else
    {
        visaRequirements = visa_requirements;
    }

    return NextResponse.json({
      success: true,
      country_details: result[0],
      visa_types: visaType,
      visa_requirements: visaRequirements
    });
    
  } catch (error) {
    console.error('Error fetching visa countries:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch visa countries' },
      { status: 500 }
    );
  }
}
