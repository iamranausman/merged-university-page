import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../lib/db/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

type PageProps = {
    params: Promise<{
      id: string;
    }>;
  };

export async function DELETE(req: NextRequest, { params }: PageProps) {
  try {

    const {id} = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Valid visa type ID is required" },
        { status: 400 }
      );
    }

    try {

      // 1️⃣ Delete all visa_requirements that reference this type
      await pool.query(
        `DELETE FROM visa_requirements WHERE visa_type_id = ?`,
        [id]
      );

      
      // 2️⃣ Delete the visa type itself
      const [result] = await pool.query<ResultSetHeader>(
        `DELETE FROM visa_types WHERE id = ?`,
        [id]
      );


      if (result.affectedRows === 0) {
        return NextResponse.json(
          { success: false, message: "Visa type not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, message: "Visa type and associated requirements deleted successfully" },
        { status: 200 }
      );

    } catch (err) {
      console.error("Transaction error:", err);
      return NextResponse.json(
        { success: false, message: "Failed to delete visa type", error: (err as Error).message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error deleting visa type:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}