import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import pool from "../../../../../../lib/db/db"
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.APP_URL}/api/frontend/auth/google/callback/`
);

const APP_URL = process.env.APP_URL;

export async function GET(req: NextRequest) {

  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new NextResponse('Missing authorization code', { status: 400 });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    const [checkEmail] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [data.email])

    if(checkEmail.length > 0)
    {

      const [result] = await pool.query<ResultSetHeader>("UPDATE users SET first_name = ?, image = ?, provider = 'Google', googleid = ?, updated_at = NOW() WHERE id = ?", [data.name , data.picture, data.id, checkEmail[0].id])

      if(result.affectedRows === 0)
      {
        return NextResponse.redirect(`${APP_URL}/student-login?error=affectedrows`);
      }

      const userData = {

        id: checkEmail[0].id,
        name: data.name,
        email: data.email,
        role: checkEmail[0].user_type

      }

      const token = jwt.sign(
        {
            id: checkEmail[0].id,
            name: data.name,
            email: data.email,
            role: checkEmail[0].user_type
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "1d"
        }
      );

      const response =  NextResponse.redirect(`${APP_URL}/dashboard`);

      response.cookies.set('university-token', token, {httpOnly: true})

      return response;

    } else {

      const [newUser] = await pool.query<ResultSetHeader>("INSERT INTO users (first_name, email, image, provider, googleid, user_type) VALUES (?, ?, ?, 'Google', ?, 'student')", [data.name, data.email, data.picture, data.id])
      
      if(newUser.affectedRows === 0)
      {
        return NextResponse.redirect(`${APP_URL}/student-login?error=google`);
      }

      const userData = {

        id: newUser.insertId,
        name: data.name,
        email: data.email,
        role: 'student'

      }

      const token = jwt.sign(
        {
            id: newUser.insertId,
            name: data.name,
            email: data.email,
            role: 'student'
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "1d"
        }
      );

      const response =  NextResponse.redirect(`${APP_URL}/dashboard`);

      response.cookies.set('university-token', token, {httpOnly: true})

      return response;

    }

  } catch (error) {
    console.error(error);
    return NextResponse.redirect(`${APP_URL}/student-login?error=google`);
  }
}
