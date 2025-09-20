import { NextResponse } from "next/server";


export async function POST() {

    try {
        const response = NextResponse.json({message: "Logout Successful", success:true})

        response.cookies.set('university-token', "", {httpOnly: true, expires: new Date(0)})

        return response;
    } catch (error: unknown) {
        const errorMessage = (error as Error).message || "Something went wrong. Please try again!";
    
        return NextResponse.json(
            {
                success: false,
                message: errorMessage,
            },
            {
                status: 500, // Internal Server Error
            }
        );
    }
}