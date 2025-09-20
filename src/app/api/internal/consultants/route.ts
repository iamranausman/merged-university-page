import pool from '../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// -------------------- GET --------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const pageParam = parseInt(searchParams.get('page') || '1');
    const limitParam = parseInt(searchParams.get('limit') || '15');
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || ''; // 'active' | 'inactive' | ''
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';

    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limit = Number.isNaN(limitParam) || limitParam < 1 ? 15 : limitParam;
    const skip = (page - 1) * limit;

    // ---------------- Build WHERE conditions ----------------
    let where = `WHERE user_type = 'consultant'`;
    const params: any[] = [];

    if (search) {
      where += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      where += ` AND is_active = ?`;
      params.push(status === 'active' ? 1 : 0);
    }

    if (startDate && endDate) {
      where += ` AND DATE(created_at) BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    } else if (startDate) {
      where += ` AND DATE(created_at) >= ?`;
      params.push(startDate);
    } else if (endDate) {
      where += ` AND DATE(created_at) <= ?`;
      params.push(endDate);
    }

    // ---------------- Count total ----------------
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as totalItems FROM users ${where}`,
      params
    );
    const totalItems = countResult[0].totalItems;

    // ---------------- Fetch data ----------------
    const [admins] = await pool.execute<RowDataPacket[]>(
      `SELECT id, first_name, last_name, phone, email, user_type, is_active, created_at
       FROM users
       ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, skip]
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

// -------------------- PUT --------------------
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, is_active } = body;

    if (!id || typeof is_active === 'undefined') {
      return NextResponse.json(
        { success: false, message: 'id and is_active are required' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE users SET is_active = ? WHERE id = ?`,
      [is_active ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found or not updated' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
      data: { id, is_active },
    });
  } catch (error) {
    console.error('❌ Error updating user status:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
