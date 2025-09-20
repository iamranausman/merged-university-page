import pool from '../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';

    const offset = (page - 1) * limit;

    let whereClauses: string[] = [];
    let values: any[] = [];

    // 🔍 Search filter (across key fields)
    if (search) {
      const words = search.split(/\s+/).filter(Boolean);
      for (const word of words) {
        whereClauses.push(
          `(name LIKE ? OR email LIKE ? OR phone LIKE ? OR passport_number LIKE ? OR taxpayer_type LIKE ?)`
        );
        const value = `%${word}%`;
        values.push(value, value, value, value, value);
      }
    }

    // 📅 Date filters (based on created_at)
    if (startDate) {
      whereClauses.push(`created_at >= ?`);
      values.push(`${startDate} 00:00:00`);
    }
    if (endDate) {
      whereClauses.push(`created_at <= ?`);
      values.push(`${endDate} 23:59:59`);
    }

    const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count query
    const countQuery = `SELECT COUNT(*) as totalCount FROM visit_visas ${whereClause}`;
    const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, values);
    const totalCount = countResult[0].totalCount as number;

    // Records query
    const recordsQuery = `
      SELECT * FROM visit_visas
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(recordsQuery, [...values, limit, offset]);

    return NextResponse.json({
      success: true,
      data: rows,
      meta: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error('GET visit_visas error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch visit_visas records',
        message: process.env.NODE_ENV === 'development' ? error.message : null,
      },
      { status: 500 }
    );
  }
}
