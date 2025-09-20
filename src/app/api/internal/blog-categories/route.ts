import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

const DEFAULT_CATEGORIES = [
  { name: 'Technology', slug: 'technology', is_active: true, sort_order: 1 },
  { name: 'Health', slug: 'health', is_active: true, sort_order: 2 },
  { name: 'Education', slug: 'education', is_active: true, sort_order: 3 },
];

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { name, slug, description = "" } = body;

    // Validate if name and slug are provided
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, message: 'Missing fields' },
        { status: 400 }
      );
    }

    // Prepare data to insert into the blog_category table
    const is_active = body.is_active ?? true;
    const sort_order = body.sort_order ?? 1;

    // Insert new category into the database
    const insertQuery = `
      INSERT INTO blog_category (name, slug, description, is_active, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query<ResultSetHeader>(insertQuery, [name, slug, description, is_active, sort_order]);

    // Fetch the inserted category data (after insertion) by ID (use result.insertId)
    const [category] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM blog_category WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json({ success: true, data: category[0] });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating category' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if categories exist
    const [rows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS count FROM blog_category');
    const count = rows[0].count;

    // If no categories exist, insert the default categories
    if (count === 0) {
      const insertQuery = `
        INSERT INTO blog_category (name, slug, is_active, sort_order)
        VALUES ?
      `;
      const defaultCategoryValues = DEFAULT_CATEGORIES.map(category => [
        category.name,
        category.slug,
        category.is_active,
        category.sort_order
      ]);

      await pool.query(insertQuery, [defaultCategoryValues]);
      console.log('✅ Default categories inserted');
    }

    // Fetch categories ordered by sort_order
    const [categories] = await pool.query<RowDataPacket[]>('SELECT * FROM blog_category ORDER BY sort_order ASC');
    
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}