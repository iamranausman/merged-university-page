import pool from '../../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcrypt';

// ------------------ GET single admin ------------------
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const adminId = parseInt(resolvedParams.id);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, first_name, last_name, email, user_type, created_at, is_active 
       FROM users WHERE id = ? AND user_type = 'admin'`,
      [adminId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Admin not found' }, { status: 404 });
    }

    const admin = rows[0];

    return NextResponse.json({
      success: true,
      admin: {
        ...admin,
        created_at: admin.created_at ? new Date(admin.created_at).toISOString() : null,
        permissions: [] // no metadata field
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching admin:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// ------------------ UPDATE admin ------------------
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const adminId = parseInt(resolvedParams.id);
    const body = await req.json();

    const {
      first_name,
      last_name,
      email,
      new_password,
      permissions,
      is_active
    } = body;

    // Status-only update
    if (is_active !== undefined && Object.keys(body).length === 1) {
      const [result] = await pool.query<ResultSetHeader>(
        `UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ? AND user_type = 'admin'`,
        [is_active ? 1 : 0, adminId]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json({ success: false, message: 'Admin not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `Admin ${is_active ? 'activated' : 'deactivated'} successfully`
      });
    }

    // Permissions-only update (not implemented)
    if (permissions !== undefined && Object.keys(body).length === 1) {
      return NextResponse.json({
        success: true,
        message: 'Permissions update not implemented - no metadata field',
        admin: { id: adminId, permissions: permissions || [] }
      });
    }

    // Require first_name, last_name, email
    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { success: false, message: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    // Check for email uniqueness
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM users WHERE email = ? AND id != ?`,
      [email, adminId]
    );
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email is already taken by another user' },
        { status: 400 }
      );
    }

    // Prepare update data
    let fields = ['first_name = ?', 'last_name = ?', 'email = ?', 'updated_at = NOW()'];
    let values: any[] = [first_name.trim(), last_name.trim(), email.trim()];

    // ✅ Handle password update if provided
    if (new_password) {
      const hashedPassword = await bcrypt.hash(new_password, 10);
      fields.push("password = ?");
      values.push(hashedPassword);
    }

    values.push(adminId);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ? AND user_type = 'admin'`;
    const [result] = await pool.query<ResultSetHeader>(query, values);

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: new_password ? 'Admin and password updated successfully' : 'Admin updated successfully'
    });
  } catch (error: any) {
    console.error('❌ Error updating admin:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// ------------------ DELETE admin ------------------
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const adminId = parseInt(resolvedParams.id);

    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM users WHERE id = ? AND user_type = 'admin'`,
      [adminId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error: any) {
    console.error('❌ Error deleting admin:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}