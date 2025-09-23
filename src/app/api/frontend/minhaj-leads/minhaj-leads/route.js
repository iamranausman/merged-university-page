import pool from '../../../../lib/db/db';
import { NextResponse } from 'next/server';

export async function POST(request) {

  const connection = await pool.getConnection(); // Start a new connection

  try {

    await connection.beginTransaction(); // Start a transaction

    const body = await request.json();
    const {
      full_name,
      roll_number,
      department,
      email,
      last_education,
      country,
      city,
      interested_country,
      apply_for,
      whatsapp_number,
    } = body;

    // Validate required fields
    if (!full_name || !email || !whatsapp_number) {
      return NextResponse.json(
        { success: false, message: 'Full name, email, and WhatsApp number are required' },
        { status: 400 }
      );
    }

    const [result] = await connection.execute(
      `INSERT INTO minhaj_university_leads 
       (full_name, roll_number, department, email, last_education, country, city, interested_country, apply_for, whatsapp_number, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [full_name, roll_number, department, email, last_education, country, city, interested_country, apply_for, whatsapp_number]
    );

    const response = await fetch("https://crm-universitiespage.com/reactapis/api/website_minhaj_leads_crm/store", {
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

    return NextResponse.json({
      success: true,
      message: 'Lead created successfully',
      data: {
        id: result.insertId,
        full_name,
        roll_number,
        department,
        email,
        last_education,
        country,
        city,
        interested_country,
        apply_for,
        whatsapp_number
      }
    }, { status: 201 });

  } catch (error) {

    await connection.rollback();

    console.error('Error creating lead:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create lead', error: error.message },
      { status: 500 }
    );

  } finally {
    // Always release the connection back to the pool
    connection.release();

  }
}