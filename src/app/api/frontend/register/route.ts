import pool from '../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import { registrationSchema as Schema } from '../../../../validations/registerValidation';

export async function POST(req: NextRequest) {
  const connection = await pool.getConnection(); // ✅ get connection
  try {
    const body = await req.json();
    const parsed = Schema.parse(body);

    const {
      first_name,
      last_name,
      phone,
      email,
      password,
      confirm_password,
      nationality,
      state,
      city,
      program_type,
      gender,
      agree
    } = parsed;

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
      "INSERT INTO users (first_name, last_name, phone, email, password, user_type) VALUES (?, ?, ?, ?, ?, ?)",
      [first_name, last_name, phone, email, hashedPassword, "student"]
    );

    if (results.affectedRows === 0) {
      throw new Error("Failed to insert user");
    }

    const full_name = `${first_name} ${last_name}`;

    const [studentData] = await connection.query<ResultSetHeader>(
      "INSERT INTO students (user_id, name, nationality, state, city, gender, prefered_program) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [results.insertId, full_name, nationality, state, city, gender, program_type]
    );

    if (studentData.affectedRows === 0) {
      throw new Error("Failed to insert student");
    }

    const [ getcountry ] = await pool.query("SELECT * FROM countries_db WHERE id = ?", [nationality]);
    const [ getCity ] = await pool.query("SELECT * FROM cities_db WHERE id = ?", [city])

    const formData = {
      first_name: first_name,
      last_name: last_name,
      email: email,
      phone: phone,
      country: getcountry[0].name,
      city: getCity[0].name
    } 

    console.log(JSON.stringify(formData))

    const response = await fetch("https://crm-universitiespage.com/reactapis/api/website_website_student_crm/store", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${process.env.CRM_API_KEY}`,
      },
    })

    console.log(response);

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

    // ✅ commit transaction
    await connection.commit();

    return NextResponse.json(
      { success: true, message: "User Registered Successfully" },
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
