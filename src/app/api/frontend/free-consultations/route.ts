import pool from '../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { FreeConsultationSchemaSoft as Schema } from '../../../../validations/freeconsultation';
import { ResultSetHeader, RowDataPacket } from 'mysql2';


// POST create new consultation
export async function POST(req: NextRequest) {

    const connection = await pool.getConnection(); // Start a new connection

  try {

    await connection.beginTransaction(); // Start a transaction

    const body = await req.json();

    const parsed = Schema.parse(body);

    const { name, email, phone_number, last_education, country, city, interested_country, apply_for } = parsed;

    const [getcountry] = await connection.query<RowDataPacket[]>("SELECT * FROM countries_db WHERE id = ?", [country])
    const [getcity] = await connection.query<RowDataPacket[]>("SELECT * FROM cities_db WHERE id = ?", [city])

    if(getcountry.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Country not found' },
        { status: 404 }
      );
    }

    if(getcity.length === 0){
      return NextResponse.json(
        { success: false, message: 'City not found' },
        { status: 404 }
      );
    }

    const [new_consultation] = await connection.query<ResultSetHeader>("INSERT INTO free_consulations (name, email, phone_number, last_education, country, city, interested_country, apply_for) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [name, email, phone_number, last_education, getcountry[0].name, getcity[0].name, interested_country, apply_for]);

    if(new_consultation.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to create consultation' },
        { status: 500 }
      );
    }

    const response = await fetch("https://crm-universitiespage.com/reactapis/api/website_free_consultation_crm/store", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${process.env.CRM_API_KEY}`,
      },
    })

    const data = await response.json();

    if (data?.status_code !== 200) {

      await connection.rollback();

      return NextResponse.json(
        {
          message: "Failed to submit your form. Please try again later.",
          success: false
        },
        {
          status: 500
        }
      )
    }

    await connection.commit();

    return NextResponse.json(
      { success: true, message: 'Consultation created successfully' },
      { status: 200 }
    );

  } catch (err: any) {

    await connection.rollback();

    if (err?.issues) {
      // ZodError
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of err.issues) {
        const key = (issue.path?.[0] as string) ?? '_';
        fieldErrors[key] = fieldErrors[key] || [];
        fieldErrors[key].push(issue.message);
      }
      return NextResponse.json(
        { ok: false, errors: fieldErrors },
        { status: 400 }
      );
    }

    console.error("freeconsulation POST error:", err);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}