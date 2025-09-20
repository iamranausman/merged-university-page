import { NextResponse } from 'next/server';
import pool from '../../../../../lib/db/db';

export async function DELETE(request, { params }) {

  const { id } = await params;

  if (isNaN(id)) {
    return NextResponse.json({ success: false, error: 'Invalid reply ID' }, { status: 400 });
  }

  try {

    // Execute the DELETE query
    const [result] = await pool.execute(
      'DELETE FROM replies WHERE reply_id = ?',
      [id]
    );

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Reply not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE reply error:", error);
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
  }
}

// PATCH /api/replies/[id]
export async function PATCH(request, { params }) {
  
   const { id } = await params;

  if (isNaN(id)) {
    return NextResponse.json({ success: false, error: 'Invalid reply ID' }, { status: 400 });
  }

  try {
    const { status } = await request.json();

    // Validate status input
    if (!['1', '0'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    // Update the status of the reply
    const [result] = await pool.execute(
      'UPDATE replies SET status = ? WHERE reply_id = ?',
      [status === '1' ? 1 : 0, id]
    );

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Reply not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { reply_id: id, status: status === '1' ? 1 : 0 } });
  } catch (error) {
    console.error("PATCH reply error:", error);
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}