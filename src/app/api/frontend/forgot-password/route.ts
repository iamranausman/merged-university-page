import pool from '../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import jwt from 'jsonwebtoken';
import { ResetPasswordTemplate } from '../../../../lib/mailer';
import bcrypt from 'bcryptjs';


// POST create new consultation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { email , otp = "" , password = "", confirmPassword = "" } = body;

    if(otp !== "" && password !== "" && confirmPassword !== "")
    {

        if(password !== confirmPassword){
            return NextResponse.json(
                {
                    success: false,
                    message: "Password dosen't match. Please confirm password."
                },
                {
                    status: 500
                }
            )
        }

      const forgotToken = req.cookies.get("forgotToken")?.value;
      if (!forgotToken) {
        return NextResponse.json({ message: "Code Expired. Please again try to forgot password" }, { status: 401 });
      }

      let decoded;
      try {
          
          decoded = jwt.verify(forgotToken, process.env.JWT_SECRET as string);
      
      } catch (error: unknown) {
          const errorMessage = (error as Error).message || "Invalid or Expire Token";
      
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

      const email = (decoded as { email: string }).email;
      const verifyCode = (decoded as { verifyCode: number }).verifyCode;

      if (!email || !verifyCode) {
        return NextResponse.json({ message: "Invalid token data." }, { status: 400 });
      }

      if(otp !== verifyCode)
      {
          return NextResponse.json(
              {
                  message:"Invalid or expired Code"
              },
              {
                  status:400
              }
          )
      }

      const [checkOTP] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM users WHERE email = ? AND verifyCode = ?",
        [email, verifyCode]
      );

      if(checkOTP.length === 0){
        return NextResponse.json(
          {message: "Invalid or expired Code"},
          {status: 400}
        )
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [ updatePassword ] = await pool.query<RowDataPacket[]>(
        "UPDATE users SET password = ?, verifyCode = NULL, verifyCodeExpiry = NULL WHERE email = ? AND is_active = 1 AND user_type IN ('consultant', 'student')",
        [hashedPassword, email]
      );

      if(updatePassword.length === 0){
        return NextResponse.json({message: "Something went wrong. Please try again!", success:false})
      }

      const response = NextResponse.json({ message: "Password Changed Successfully", success: true, user_type: checkOTP[0].user_type });
      return response;

    }

    const [ checkEmail ] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM users WHERE email = ? AND is_active = 1 AND user_type IN ('consultant', 'student') LIMIT 1",
        [email]
    );
    
    if(checkEmail.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid Credentials or You dont have permission to login' },
        { status: 409 }
      );
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 10); // Adds 10 minutes to the current time

    // write query to update verify code and expiry date
    const [ updatecode ] = await pool.query<RowDataPacket[]>(
        "UPDATE users SET verifyCode = ?, verifyCodeExpiry = ? WHERE email = ?",
        [verifyCode, expiryDate, email]
    );

    // ✅ Generate JWT Token
    const token = jwt.sign(
        { 
            email: email,
            verifyCode: verifyCode
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "10m" } // Token expires in 1 hour
    );

    if(updatecode.length === 0){
        return NextResponse.json({message: "Something went wrong. Please try again!", success:false})
    }

    await ResetPasswordTemplate({email, verifyCode});
    const response = NextResponse.json({ message: "Please check your email for the verification code", success: true });
    response.cookies.set('forgotToken', token, {httpOnly: true})
    return response;

  } catch (err: any) {
    if (err?.issues) {
      // ZodError
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of err.issues) {
        const key = (issue.path?.[0] as string) ?? '_';
        fieldErrors[key] = fieldErrors[key] || [];
        fieldErrors[key].push(issue.message);
      }
      return NextResponse.json(
        { ok: false, message: fieldErrors },
        { status: 400 }
      );
    }

    console.error("freeconsulation POST error:", err);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}