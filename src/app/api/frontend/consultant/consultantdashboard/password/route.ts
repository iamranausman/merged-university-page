
import pool from '../../../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import { verifyAuthentication } from '../../../../../utils/verifyAuthentication';
import { changePasswordSchema as Schema } from '../../../../../../validations/passwordValidation';

export async function POST(request: NextRequest) {
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

        if(decoded.role === "consultant")
        {
            const [againcheck] = await pool.query<RowDataPacket[]>("SELECT * FROM users WHERE id = ? AND user_type = ? ", [decoded.id, 'consultant']);

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
            currentPassword,
            newPassword,
            } = parsed;

            // ✅ start transaction
            await connection.beginTransaction();

            const validPassword = await bcrypt.compare(currentPassword, againcheck[0].password);

            if(!validPassword){
                return NextResponse.json(
                    {
                        success: false,
                        message: "Current password is incorrect"
                    },
                    {
                        status: 401 // Unauthorized
                    }
                );
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const [updatePassword] = await pool.query<ResultSetHeader>("UPDATE users SET password = ? WHERE id = ? AND user_type = ?", [hashedPassword, decoded.id, 'consultant'])

            if(updatePassword.affectedRows === 0)
            {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Failed to update password"
                    },
                    {
                        status: 401 // Unauthorized
                    }
                );
            }

            // ✅ commit transaction
            await connection.commit();

            return NextResponse.json(
                {
                    success: true,
                    message: "Password updated successfully"
                },
                {
                    status: 200 // Unauthorized
                }
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