import pool from '../../../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import { verifyAuthentication } from '../../../../../utils/verifyAuthentication';
import { prfileSchema as Schema } from '../../../../../../validations/profileValidation';

// POST create new consultation
export async function POST(request: NextRequest) {
  try{

    const token = request.cookies.get("university-token")?.value || null;
    const decoded = await verifyAuthentication(token);

    if (decoded instanceof NextResponse) {
        return NextResponse.json(
            {
                success: false,
                message: "You are not authorized to perform this action"
            },
            {
                status: 401 // Unauthorized
            }
        );
    }

    if(decoded){

        if(decoded.role === "consultant")
        {
            const [getUser] = await pool.query<RowDataPacket[]>(
                `SELECT 
                    u.*,
                    s.nationality AS nationality,
                    s.city AS city,
                    s.state AS state
                FROM users U
                LEFT JOIN consultants s ON u.id = s.user_id
                WHERE u.id = ? AND u.user_type = 'consultant'`, [decoded.id]);

                console.log("User Dat", getUser[0])

            if(getUser.length === 0){
                return NextResponse.json(
                    {
                        success: false,
                        message: "You are not authorized to perform this action"
                    },
                    {
                        status: 401 // Unauthorized
                    }
                );
            }

            return NextResponse.json(
                {
                    success: true,
                    message: "You are authorized to perform this action",
                    data: getUser[0]
                },
                {
                    status: 200 // Unauthorized
                }
            );
        }
        else{
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not authorized to perform this action"
                },
                {
                    status: 401 // Unauthorized
                }
            );
        }
    }
    else{
        return NextResponse.json(
            {
                success: false,
                message: "You are not authorized to perform this action"
            },
            {
                status: 401 // Unauthorized
            }
        );
    }


  } catch (err: any) {

    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const connection = await pool.getConnection(); // ✅ get connection
  try {

    const token = request.cookies.get("university-token")?.value || null;
    const decoded = await verifyAuthentication(token);

    if (decoded instanceof NextResponse) {
        return NextResponse.json(
            {
                success: false,
                message: "You are not authorized to perform this action"
            },
            {
                status: 401 // Unauthorized
            }
        );
    }

    if(decoded){

        if(decoded.role === "student")
        {

            const [againcheck] = await pool.query<RowDataPacket[]>("SELECT * FROM users WHERE id = ? AND user_type = 'student'", [decoded.id]);

            if(againcheck.length === 0){
                return NextResponse.json(
                    {
                        success: false,
                        message: "You are not authorized to perform this action"
                    },
                    {
                        status: 401 // Unauthorized
                    }
                );
            }

            const body = await request.json();
            const parsed = Schema.parse(body);

            const {
            first_name,
            last_name,
            phone,
            nationality,
            state,
            city,
            program_type,
            gender,

            } = parsed;

            // ✅ start transaction
            await connection.beginTransaction();


            const [results] = await connection.query<ResultSetHeader>(
            "UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ? AND user_type = 'student'",
            [first_name, last_name, phone, decoded.id] // <-- pass the user id
            );

            if (results.affectedRows === 0) {
            throw new Error("Failed to update profile");
            }

            const full_name = `${first_name} ${last_name}`;

            const [studentData] = await connection.query<ResultSetHeader>(
                "UPDATE students SET name = ?, nationality = ?, state = ?, city = ?, gender = ?, prefered_program = ? WHERE user_id = ?",
                [full_name, nationality, state, city, gender, program_type, decoded.id]
            );


            if (studentData.affectedRows === 0) {
            throw new Error("Failed to update profile");
            }

            // ✅ commit transaction
            await connection.commit();

            return NextResponse.json(
            { success: true, message: "User Profile Updated Successfully." },
            { status: 200 }
            );
        } 
        else {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not authorized to perform this action"
                },
                {
                    status: 401 // Unauthorized
                }
            );
        }
    }
    else {
        return NextResponse.json(
            {
                success: false,
                message: "You are not authorized to perform this action"
            },
            {
                status: 401 // Unauthorized
            }
        );
    }
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