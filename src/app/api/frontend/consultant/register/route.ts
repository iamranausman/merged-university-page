import pool from '../../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const connection = await pool.getConnection(); // ✅ get connection
  try {
    const body = await req.json();


    const {
        company_name,
        designation,
        number_of_employees,
        address,
        first_name,
        last_name,
        mobile_number,
        comment,
        agree,
        email,
        password,
        nationality,
        state,
        city,
    } = body;

    // email check (outside transaction is fine, but safer inside)
    const [checkEmail] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (checkEmail.length > 0) {
      connection.release();
      return NextResponse.json(
        {
          success: false,
          message: "This email is already registered. Please choose another one"
        },
        { status: 400 }
      );
    }

    // ✅ start transaction
    await connection.beginTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);

    const [results] = await connection.query<ResultSetHeader>(
      "INSERT INTO users (first_name, last_name, email, password, user_type) VALUES (?, ?, ?, ?, ?)",
      [first_name, last_name, email, hashedPassword, "consultant"]
    );

    if (results.affectedRows === 0) {
      throw new Error("Failed to insert user");
    }

    const full_name = `${first_name} ${last_name}`;

    const [studentData] = await connection.query<ResultSetHeader>(
      "INSERT INTO consultants (user_id, name, company_name, nationality, state, city, address, designation, email, phone, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [results.insertId, full_name, company_name, nationality, state, city, address, designation, email, mobile_number, comment]
    );

    if (studentData.affectedRows === 0) {
      throw new Error("Failed to insert Consultant");
    }

    // ✅ commit transaction
    await connection.commit();

    return NextResponse.json(
      { success: true, message: "Consultant Registered Successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    // ❌ rollback transaction if active
    try {
      await connection.rollback();
    } catch (rollbackErr) {
      console.error("Rollback failed:", rollbackErr);
    }

    if (err?.issues) {
      // ZodError
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of err.issues) {
        const key = (issue.path?.[0] as string) ?? "_";
        fieldErrors[key] = fieldErrors[key] || [];
        fieldErrors[key].push(issue.message);
      }
      return NextResponse.json(
        { ok: false, message: fieldErrors },
        { status: 400 }
      );
    }

    console.error("POST /register error:", err);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    connection.release(); // ✅ always release
  }
}
