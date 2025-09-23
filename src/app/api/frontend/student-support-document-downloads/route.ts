import pool from '../../../../lib/db/db';
import { NextResponse } from 'next/server';
import { ResultSetHeader } from 'mysql2';

export async function POST(req: Request) {

  const connection = await pool.getConnection(); // Start a new connection

  try {

    await connection.beginTransaction(); // Start a transaction

    const body = await req.json();
    const { name, email, phone, documentId } = body;

    if (!name || !email || !phone || !documentId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO document_download_users (name, email, phone, document_id, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [name, email, phone, documentId]
    );

    const formdata = {
      name: name,
      email: email,
      phone: phone,
      document_id: documentId
    }

    const response = await fetch("https://crm-universitiespage.com/reactapis/api/website_document_user_crm/store", {
      method: "POST",
      body: JSON.stringify(formdata),
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
      {
        success: true,
        message: 'User saved successfully',
        user: {
          id: result.insertId,
          name,
          email,
          phone,
          document_id: documentId
        }
      },
      { status: 200 }
    );
  } catch (error: any) {

    await connection.rollback();

    console.error('Save user error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save user', error: error.message },
      { status: 500 }
    );
  }
}
