
import { NextRequest, NextResponse } from 'next/server';

import pool from '../../../../lib/db/db';
import { verifyAuthentication } from '../../../utils/verifyAuthentication';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  // Get wishlist for logged-in user
  
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

            const query = `
            SELECT 
                w.id, w.user_id, w.course_id, w.university_id, 
                c.name AS course_name,
                ud.name AS university_name, 
                ud.address AS university_address
            FROM wishlist w
            LEFT JOIN courses c ON w.course_id = c.id
            LEFT JOIN university_details ud ON w.university_id = ud.id
            WHERE w.user_id = ?
            `;

            const [result] = await pool.query(query, [decoded.id]);

            return NextResponse.json(
            {
                success: true,
                data: result
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
    } catch (err: any) {
        return NextResponse.json(
        {
            success: false,
            message: err.message
        },
        {
            status: 500
        }
        );
    }
}

export async function POST(request: NextRequest) {

    try{

        console.log("Wishlist API POST CALL")
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

                // Get the data from the request body
                const { course_id, university_id } = await request.json();

                if (!course_id && !university_id) {
                    return NextResponse.json({ error: 'Missing course_id or university_id' }, { status: 400 });
                }

                // Check if the item already exists in the wishlist
                const [existsResult] = await pool.query<RowDataPacket[]>(
                    `SELECT * FROM wishlist WHERE user_id = ? AND (course_id = ? OR university_id = ?)`,
                    [decoded.id, course_id || null, university_id || null]
                );

                if (existsResult.length > 0) {
                    // If it exists, return the existing wishlist item
                    return NextResponse.json({ success: true, wishlist: existsResult[0] });
                }

                // Insert the new wishlist item
                const [insertResult] = await pool.query<ResultSetHeader>(
                    `INSERT INTO wishlist (user_id, course_id, university_id) VALUES (?, ?, ?)`,
                    [decoded.id, course_id || null, university_id || null]
                );

                // Get the newly inserted wishlist item (if needed for the response)
                const [newWishlistResult] = await pool.query<RowDataPacket[]>(
                    `SELECT * FROM wishlist WHERE id = ?`,
                    [insertResult.insertId]
                );

                return NextResponse.json({ success: true, wishlist: newWishlistResult[0] });
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

export async function PUT(request: NextRequest) {

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

            const body = await request.json();

            const {items} = body;


            if (!Array.isArray(items)) {
                return NextResponse.json({ error: 'Invalid items' }, { status: 400 });
            }

            // Loop over the items and check if they already exist in the wishlist
            for (const item of items) {
                const { course_id, university_id } = item;

                // Ensure that either course_id or university_id exists before attempting to insert
                if (!course_id && !university_id) {
                    console.log("Skipping item due to missing course_id and university_id", item);
                    continue; // Skip this item as both course_id and university_id are missing
                }

                // Check if the item already exists in the wishlist for this user
                const [existsResult] = await pool.query<RowDataPacket[]>(
                    `SELECT * FROM wishlist WHERE user_id = ? AND (course_id = ? OR university_id = ?)`,
                    [decoded.id, course_id || null, university_id || null]
                );

                if (existsResult.length === 0) {
                    // Insert the item into the wishlist if it doesn't exist
                    await pool.query(
                    `INSERT INTO wishlist (user_id, course_id, university_id) VALUES (?, ?, ?)`,
                    [decoded.id, course_id || null, university_id || null]
                    );
                }
            }
            return NextResponse.json(
                {
                    success: true,
                    message: "Wishlist updated successfully"
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

export async function DELETE(request: NextRequest) {

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

            const { course_id, university_id } = await request.json();

            // Validate course_id or university_id
            if (!course_id && !university_id) {
            return NextResponse.json({ error: 'Missing course_id or university_id' }, { status: 400 });
            }

            // Delete the wishlist entry for the user
            const result = await pool.query(
            'DELETE FROM wishlist WHERE user_id = ? AND (course_id = ? OR university_id = ?)',
            [decoded.id, course_id || null, university_id || null]
            );

            return NextResponse.json({ success: true });
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


/*

export async function PUT(request: NextRequest) {

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

*/