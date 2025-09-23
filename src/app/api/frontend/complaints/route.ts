import pool from '../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2';


// POST create complaint
export async function POST(req: NextRequest) {
  
  const connection = await pool.getConnection(); // Start a new connection

  try {

    await connection.beginTransaction(); // Start a transaction

    const body = await req.json();
    const { name, subject, email, phone, message, location } = body;

    // Validation
    if (!email || !message) {
      return NextResponse.json(
        { success: false, error: "Email and message are required" },
        { status: 400 }
      );
    }

    console.log(JSON.stringify(body))

    const insertQuery = `
      INSERT INTO complaints (name, subject, email, phone, message, location)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query<ResultSetHeader>(insertQuery, [
      name,
      subject,
      email,
      phone || null,
      message,
      location || null,
    ]);

    const response = await fetch("https://crm-universitiespage.com/reactapis/api/website_complaints_crm/store", {
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

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Failed to create complaint" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Complaint created successfully", id: result.insertId },
      { status: 201 }
    );
  } catch (error: any) {

    await connection.rollback();

    console.error("❌ POST /complaints error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}