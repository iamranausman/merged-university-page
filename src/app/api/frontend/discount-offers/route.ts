import pool from '../../../../lib/db/db';
import { NextResponse } from 'next/server';
import type { ResultSetHeader } from 'mysql2';

export async function POST(req: Request) {

  const connection = await pool.getConnection(); // Start a new connection

  try {

    await connection.beginTransaction(); // Start a transactions

    const body = await req.json();
    const {
      name,
      email,
      phone,
      lastEducation,       // maps to lastEducation
      lastEducationPer,      // maps to lastEducationPer
      city,
      location,
      familyDetail          // maps to familyDetail
    } = body;

    const [insertResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO discountoffers 
      (name, email, phone, lastEducation, lastEducationPer, city, location, familyDetail) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, lastEducation, lastEducationPer, city, location, familyDetail]
    );

    if (insertResult.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to create discount offer' },
        { status: 500 }
      );
    }

    const response = await fetch("https://crm-universitiespage.com/reactapis/api/website_discount_offer_crm/store?location=lahore", {
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
      { success: true, message: 'Discount offer created successfully' },
      { status: 200 }
    );
  } catch (error: any) {

    await connection.rollback();

    console.error('DiscountOffers POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
