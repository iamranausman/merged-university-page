import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../lib/db/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';


type PageProps = {
    params: Promise<{
      id: string;
    }>;
  };


// GET - Fetch single visa requirement by ID
export async function GET(request: NextRequest, { params }) {
  try {
    const { id } = params;

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: 'Valid requirement ID is required' },
        { status: 400 }
      );
    }

    const [requirement] = await pool.query<RowDataPacket[]>('SELECT * FROM visa_requirements WHERE id = ?', [id])

    if(requirement.length === 0){
      return NextResponse.json(
        { error: 'Requirement not found' },
        { status: 404 }
      );
    }

    console.log(requirement);

    return NextResponse.json({
      success: true,
      data: requirement[0]
    });

  } catch (error) {
    console.error('Error fetching requirement:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update visa requirement by ID
export async function PUT(request: NextRequest, { params }: PageProps) {
  try {
    // Await dynamic route params
    const {id} = await params;

    if (!id) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();

    // Parse request body
    const { visa_country_id, visa_type_id, title, description } = body.form;

    // Validate required fields
    if (!visa_country_id || !visa_type_id || !title || !description) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    // Update visa requirement in MySQL
    const [result] = await pool.query<ResultSetHeader>(
      `
      UPDATE visa_requirements
      SET visa_country_id = ?, visa_type_id = ?, title = ?, description = ?, updated_at = NOW()
      WHERE id = ?
      `,
      [parseInt(visa_country_id), parseInt(visa_type_id), title, description, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Visa requirement not found or not updated" }, { status: 404 });
    }

    // Optionally fetch the updated row
    const [updatedRows] = await pool.query(`SELECT * FROM visa_requirements WHERE id = ?`, [id]);

    return NextResponse.json({
      success: true,
      message: "Visa requirement updated successfully",
      data: updatedRows[0] || null,
    });

  } catch (error) {
    console.error("Error updating visa requirement:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}

// DELETE - Remove visa requirement by ID
export async function DELETE(request: NextRequest, { params }: PageProps) {
  try {
    // Await dynamic route params
    const {id} = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Valid requirement ID is required" },
        { status: 400 }
      );
    }

    console.log("ID", id)

    // Delete from MySQL
    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM visa_requirements WHERE id = ?`,
      [id]
    );

    if(result.affectedRows === 0){
      return NextResponse.json(
        { success: false, error: "Visa requirement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Visa requirement deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting visa requirement:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}