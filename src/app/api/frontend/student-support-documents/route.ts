import pool from "../../../../lib/db/db";
import { NextResponse } from "next/server";

// ------------------ GET all student support documents ------------------
export async function GET() {
  try {
    const startTime = Date.now();

    // Fetch documents from database
    const [rows] = await pool.query(`
      SELECT 
        id, 
        file_name, 
        file_category, 
        document_file, 
        created_at 
      FROM student_support_documents
      ORDER BY created_at DESC
    `);

    const duration = Date.now() - startTime;
    console.log(`[GET /student-support-documents] took ${duration}ms`);

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching student support documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch student support documents" },
      { status: 500 }
    );
  }
}
