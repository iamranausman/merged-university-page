import pool from '../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2';


// POST - Create new online consultant application
export async function POST(req: NextRequest) {

  const connection = await pool.getConnection(); // Start a new connection

  try {

    await connection.beginTransaction(); // Start a transaction

    const body = await req.json();
    const { student_name, student_email, student_phone_number, student_last_education, student_country, student_state, student_city, student_apply_for, interested_country, application_type } = body;

    if (!student_name || !student_phone_number || !student_last_education || !student_apply_for || !interested_country) {
      return NextResponse.json({ success: false, message: 'Required fields are missing' }, { status: 400 });
    }

    const [newApplication] = await connection.query<ResultSetHeader>(
      `INSERT INTO online_consultants (application_type, student_name, student_email, student_phone_number, student_last_education, student_country, student_state, student_city, student_apply_for, interested_country, choosable_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW(), NOW())`,
      ['2', student_name, student_email || null, student_phone_number, student_last_education, student_country || null, student_state || null, student_city || null, student_apply_for, interested_country]
    );

    if (newApplication.affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'Failed to create application' }, { status: 500 });
    }

    const response = await fetch("https://crm-universitiespage.com/reactapis/api/website_online_consultation_crm/store?location=lahore", {
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

    return NextResponse.json({ success: true, message: 'Application created successfully' }, { status: 201 });
  } catch (error: any) {

    await connection.rollback();

    console.error("POST online_consultants error:", error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : null }, { status: 500 });
  }
}
