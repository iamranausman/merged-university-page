import pool from '../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const pageParam = parseInt(searchParams.get('page') || '1');
    const limitParam = parseInt(searchParams.get('limit') || '15');
    const search = searchParams.get('search')?.trim() || ''; // ✅ get search term

    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limit = Number.isNaN(limitParam) || limitParam < 1 ? 15 : limitParam;
    const skip = (page - 1) * limit;

    console.log('Searching for users with user_type: admin, search:', search);

    // Build search condition
    let whereClause = `user_type = ?`;
    let whereValues: any[] = ['admin'];

    if (search) {
      whereClause += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
      const searchPattern = `%${search}%`;
      whereValues.push(searchPattern, searchPattern, searchPattern);
    }

    // Count total
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as totalItems FROM users WHERE ${whereClause}`,
      whereValues
    );
    const totalItems = countResult[0].totalItems;

    // Fetch admins
    const [admins] = await pool.execute<RowDataPacket[]>(
      `SELECT id, first_name, last_name, email, user_type, is_active, created_at
       FROM users 
       WHERE ${whereClause}
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...whereValues, limit, skip]
    );

    const users = admins.map((u) => ({
      ...u,
      createdAt: u.created_at ? new Date(u.created_at).toISOString() : null,
      created_at: u.created_at ? new Date(u.created_at).toISOString() : null,
    }));

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return NextResponse.json({
      success: true,
      users,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        startIndex: skip,
        endIndex: skip + users.length,
        search: search || null,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching admin users:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
