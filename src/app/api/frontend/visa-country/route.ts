// app/api/internal/visa-country/[id]/route.js
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import slugify from 'slugify';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const continent = searchParams.get('continent') || '';
    const getContinents = searchParams.get('getContinents') === 'true';

    // If requesting continents only
    if (getContinents) {
      const [continents] = await pool.query<RowDataPacket[]>(`
        SELECT DISTINCT continent
        FROM visa_countries
        WHERE continent IS NOT NULL
        ORDER BY continent
      `);

      const uniqueContinents = continents.map(c => c.continent).sort();
      return NextResponse.json({
        success: true,
        data: ['all', ...uniqueContinents]
      });
    }

    // Build the WHERE clause for filtering
    let whereClause = 'WHERE 1=1'; // Default "true" condition
    let queryParams = [];

    if (search) {
      whereClause += ' AND (country_name LIKE ? OR description LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Add continent filter if provided
    if (continent && continent !== 'all') {
      whereClause += ' AND continent = ?';
      queryParams.push(continent);
    }

    // Query for fetching the paginated visa countries
    const [visaCountries] = await pool.query<RowDataPacket[]>(`
      SELECT id, country_name, description, continent, banner_image, country_image, price, discount_price, currency, created_at, slug
      FROM visa_countries
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, (page - 1) * limit]);

    // Get total count for pagination
    const [totalResult] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM visa_countries
      ${whereClause}
    `, queryParams);

    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);

    console.log('Fetched visa countries:', visaCountries)

    return NextResponse.json({
      success: true,
      data: visaCountries,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Error fetching visa countries:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch visa countries' },
      { status: 500 }
    );
  }
}
