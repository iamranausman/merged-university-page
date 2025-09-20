// app/api/internal/visa-country/[id]/route.js
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../lib/db/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: PageProps) {
  try {

    const {id} = await params;

    if (!id) {
        console.error("ID is missing!");
        return;
    }

    const [country] = await pool.query<RowDataPacket[]>("SELECT * FROM visa_countries WHERE id = ?", [id]);

    if(country.length === 0) {
      return NextResponse.json(
        { message: 'Country not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
        
      { data: country[0] },
      { status: 200 }
   
    )

  } catch (error) {
    console.error('Error fetching country:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: PageProps) {
  try {
    const { id } = await params;

    if (!id) {
      console.error("ID is missing!");
      return;
    }

    await pool.query("DELETE FROM visa_requirements WHERE visa_country_id = ?", [id]);

    await pool.query("DELETE FROM visa_types WHERE visa_country_id = ?", [id]);

    const [result] = await pool.query<ResultSetHeader>("DELETE FROM visa_countries WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: 'Country not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Country deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting country:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}