import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

import pool from '../../../../lib/db/db';

export async function GET(req) {
  // Get wishlist for logged-in user
  

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

    const query = `
      SELECT 
        w.id, w.user_id, w.course_id, w.university_id, 
        c.name AS c_name, c.description AS c_description, 
        ud.name AS ud_name, ud.address AS ud_address
      FROM wishlist w
      LEFT JOIN course c ON w.course_id = c.id
      LEFT JOIN university_details ud ON w.university_id = ud.id
      WHERE w.user_id = ?
    `;

    const [result] = await pool.query(query, [decoded.id]);

    console.log(result);
  }
}

export async function POST(req) {
  // Add to wishlist
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Changed from findUnique to findFirst
  const user = await prisma.users.findFirst({ 
    where: { email: session.user.email } 
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { course_id, university_id } = await req.json();
  if (!course_id && !university_id) {
    return NextResponse.json({ error: 'Missing course_id or university_id' }, { status: 400 });
  }

  // Prevent duplicate
  const exists = await prisma.wishlist.findFirst({
    where: { 
      user_id: user.id, 
      course_id: course_id || null, 
      university_id: university_id || null 
    }
  });

  if (exists) return NextResponse.json({ success: true, wishlist: exists });

  const wishlist = await prisma.wishlist.create({
    data: {
      user_id: user.id,
      course_id: course_id || null,
      university_id: university_id || null
    }
  });

  return NextResponse.json({ success: true, wishlist });
}

export async function DELETE(req) {
  // Remove from wishlist
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Changed from findUnique to findFirst
  const user = await prisma.users.findFirst({ 
    where: { email: session.user.email } 
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { course_id, university_id } = await req.json();
  if (!course_id && !university_id) {
    return NextResponse.json({ error: 'Missing course_id or university_id' }, { status: 400 });
  }

  await prisma.wishlist.deleteMany({
    where: {
      user_id: user.id,
      course_id: course_id || null,
      university_id: university_id || null
    }
  });

  return NextResponse.json({ success: true });
}

export async function PUT(req) {
  // Sync localStorage wishlist to DB on login
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Changed from findUnique to findFirst
  const user = await prisma.users.findFirst({ 
    where: { email: session.user.email } 
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { items } = await req.json();
  if (!Array.isArray(items)) {
    return NextResponse.json({ error: 'Invalid items' }, { status: 400 });
  }

  // Add all items (skip duplicates)
  for (const item of items) {
    const exists = await prisma.wishlist.findFirst({
      where: {
        user_id: user.id,
        course_id: item.course_id || null,
        university_id: item.university_id || null
      }
    });

    if (!exists) {
      await prisma.wishlist.create({
        data: {
          user_id: user.id,
          course_id: item.course_id || null,
          university_id: item.university_id || null
        }
      });
    }
  }

  return NextResponse.json({ success: true });
}