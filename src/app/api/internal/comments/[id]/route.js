import pool from "../../../../../lib/db/db"
import { NextResponse } from 'next/server';



export async function DELETE(request, { params }) {
  
  const {id} = await params;

  if (isNaN(id)) {
    return NextResponse.json({ success: false, error: 'Invalid comment ID' }, { status: 400 });
  }

  try {

    // First delete all replies for this comment
    await pool.execute(
      'DELETE FROM replies WHERE parent_comment_id = ?',
      [id]
    );

    // Then delete the comment itself
    const [result] = await pool.execute(
      'DELETE FROM comment WHERE comment_id = ?',
      [id]
    );

    // Check if any rows were affected by the comment deletion
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE comment error:", error);
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
  }
}
// PATCH (update) comment status
export async function PATCH(request, { params }) {
  
  const {id} = await params;

  if (isNaN(id)) {
    return NextResponse.json({ success: false, error: 'Invalid comment ID' }, { status: 400 });
  }

  try {
    const { status } = await request.json();

    // Validate status input
    if (!['1', '0'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }


    // Update the comment status
    const [result] = await pool.execute(
      'UPDATE comment SET status = ? WHERE comment_id = ?',
      [status, id]
    );

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { comment_id: id, status } });
  } catch (error) {
    console.error("PATCH comment error:", error);
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}