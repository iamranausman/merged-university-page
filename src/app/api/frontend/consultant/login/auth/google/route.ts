import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.CONSULTANT_GOOGLE_CLIENT_ID,
  process.env.CONSULTANT_GOOGLE_CLIENT_SECRET,
  `${process.env.APP_URL}/api/frontend/consultant/login/auth/google/callback/`
);

export async function GET() {

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
  });

  return NextResponse.redirect(url);
}
