import pool from '../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// ================= POST Create Contact Message =================
export async function POST(req: NextRequest) {

  const connection = await pool.getConnection(); // Start a new connection

  try {

    await connection.beginTransaction(); // Start a transaction

    const body = await req.json();

    const { office_location, user_name, user_email, phone_number, message } = body;

    if (!office_location || !user_name || !user_email || !phone_number || !message) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO contact_us_messages 
        (office_location, user_name, user_email, phone_number, message) 
       VALUES (?, ?, ?, ?, ?)`,
      [office_location, user_name, user_email, phone_number, message]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to save contact message' },
        { status: 500 }
      );
    }

    const response = await fetch("https://crm-universitiespage.com/reactapis/api/website_contact_us_crm/store", {
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
      { success: true, message: 'Message submitted successfully' },
      { status: 201 }
    );
  } catch (error: any) {

    await connection.rollback();

    console.error("❌ POST /contactUs error:", error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
