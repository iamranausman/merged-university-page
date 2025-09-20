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
      SELECT id, country_name, description, continent, banner_image, country_image, price, discount_price, currency, created_at
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

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Validate required fields including continent
    if (!data.countryName || !data.currency || !data.amount ||
        !data.description || !data.countryImageUrl || !data.bannerImageUrl || !data.continent) {
      return NextResponse.json(
        { success: false, message: 'All fields including continent are required' },
        { status: 400 }
      );
    }

    // Generate a slug from the country name
    const slug = slugify(data.countryName, { lower: true, strict: true });

    // Prepare the country data
    const countryData = {
      country_name: data.countryName,
      slug,
      currency: data.currency,
      price: data.amount.toString(),
      discount_price: data.discount ? data.discount.toString() : null, // Handle null discount case
      description: data.description,
      country_image: data.countryImageUrl,
      banner_image: data.bannerImageUrl,
      continent: data.continent, // Add continent to the data
    };

    // SQL query to insert the new country into the database
    const insertQuery = `
      INSERT INTO visa_countries (country_name, slug, currency, price, discount_price, description, country_image, banner_image, continent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query<ResultSetHeader>(insertQuery, [
      countryData.country_name,
      countryData.slug,
      countryData.currency,
      countryData.price,
      countryData.discount_price,
      countryData.description,
      countryData.country_image,
      countryData.banner_image,
      countryData.continent
    ]);

    // Fetch the inserted visa country using the result.insertId to get the newly inserted row
    const [visaCountry] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM visa_countries WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json({
      success: true,
      data: visaCountry[0], // Return the newly created country data
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating visa country:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();

    // Validate required fields including continent
    if (!data.id || !data.countryName || !data.currency || !data.amount ||
        !data.description || !data.countryImageUrl || !data.bannerImageUrl || !data.continent) {
      return NextResponse.json(
        { success: false, message: 'All fields including ID and continent are required' },
        { status: 400 }
      );
    }

    // Generate a slug from the country name
    const slug = slugify(data.countryName, { lower: true, strict: true });

    // Prepare the country data
    const countryData = {
      country_name: data.countryName,
      slug,
      currency: data.currency,
      price: data.amount.toString(),
      discount_price: data.discount ? data.discount.toString() : null,
      description: data.description,
      country_image: data.countryImageUrl,
      banner_image: data.bannerImageUrl,
      continent: data.continent,
    };

    // SQL query to update the existing country by ID
    const updateQuery = `
      UPDATE visa_countries
      SET country_name = ?, slug = ?, currency = ?, price = ?, discount_price = ?, description = ?, country_image = ?, banner_image = ?, continent = ?
      WHERE id = ?
    `;

    const [result] = await pool.query<ResultSetHeader>(updateQuery, [
      countryData.country_name,
      countryData.slug,
      countryData.currency,
      countryData.price,
      countryData.discount_price,
      countryData.description,
      countryData.country_image,
      countryData.banner_image,
      countryData.continent,
      data.id // ID to update
    ]);

    // Fetch the updated visa country
    const [visaCountry] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM visa_countries WHERE id = ?',
      [data.id]
    );

    return NextResponse.json({
      message: 'Visa country updated successfully',
      success: true,
      data: visaCountry[0], // Return updated country data
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating visa country:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
