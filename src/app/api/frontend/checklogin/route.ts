import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db/db";
import { verifyAuthentication } from "../../../utils/verifyAuthentication";
import { RowDataPacket } from "mysql2";


export async function POST(request: NextRequest) {
    try {

        const token = request.cookies.get("university-token")?.value || null;
        
        if (!token) {
            return NextResponse.json(
                {
                message: "Please Login to continue"
                },
                {
                status: 400
                }
            );
        }
    
        const decoded = await verifyAuthentication(token)
    
        if (decoded instanceof NextResponse) {
            return NextResponse.json(
                {
                    message: "Please Login to read comments",
                    user: []
                },
                {
                    status: 400
                }
            );
        }

        const [userDetails] = await pool.query<RowDataPacket[]>("SELECT first_name, image FROM users WHERE id = ?", [decoded.id]);

        if(userDetails.length === 0){
            return NextResponse.json({
                success: false,
                error: "Failed to fetch user record",
            }, { status: 404 });
        }

        return NextResponse.json(
            {
                success: true,
                user: userDetails[0]
            },
            {
                status: 200
            }
        )
    

    } catch (err) {
        console.error("❌ GET API Error:", err);
        return NextResponse.json({ 
          success: false, 
          error: "Failed to fetch blogs", 
          details: err.message 
        }, { status: 500 });
    }
}