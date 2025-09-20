import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../../../../lib/db/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('🔍 Visit Visa API - Received data:', body);

    // Map gender to MySQL-compatible value
    const genderMap = {
      male: "Male",
      female: "Female",
      other: "Other"
    };

    // Check if the email already exists to handle duplicates
    const [existingVisa] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM visit_visas WHERE email = ?',
      [body.email]
    );

    if (existingVisa.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Duplicate entry',
          details: 'A visa application with this email already exists'
        }),
        { status: 400 }
      );
    }

    // Insert new visa data into the database
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO visit_visas (
        name, email, phone, last_education, gender, taxpayer_type, 
        bank_statment, country, state, city, country_name, choosable_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.givenName || '',
        body.email || '',
        body.mobile || '',
        body.education || null,
        genderMap[body.gender?.toLowerCase()] || null,
        body.taxpayer || null,
        body.bankStatement || null,
        body.homeCountry || null,
        body.state || null,
        body.city || null,
        body.applyFor || null,
        'Pending',
        new Date()
      ]
    );

    console.log('✅ Visit Visa created successfully:', result);
    
    return new Response(
      JSON.stringify({ success: true, visa: { id: result.insertId, ...body } }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating visit visa:', error);

    // Handle general errors
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal Server Error',
        details: error.message
      }),
      { status: 500 }
    );
  }
}