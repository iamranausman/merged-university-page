import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "../../../utils/verifyAuthentication";
import { RowDataPacket } from "mysql2";
import pool from "../../../../lib/db/db";


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

            const [checkUser] = await pool.query<RowDataPacket[]>("SELECT * FROM users WHERE id = ? AND user_type IN ('student', 'consultant')", [decoded.id]);

            if(checkUser.length === 0)
            {
                return NextResponse.json(
                    {
                        success: false,
                        message: "You are not authorized to perform this action"
                    },
                    {
                        status: 401 // Unauthorized
                    }
                )
            }

            return NextResponse.json(
            {
                success: true,
                data: decoded
            },
            {
                status: 200
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
    } catch (err){
        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error"
            },
            {
                status: 500 // Unauthorized
            }
        )
    }

}