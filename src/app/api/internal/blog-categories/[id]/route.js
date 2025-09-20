import { NextResponse } from 'next/server';
import pool from '../../../../../lib/db/db';

export async function GET(_, { params }) {

  try {
    // Get the category ID from params
    const categoryId = parseInt(params.id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ success: false, error: 'Invalid category ID' }, { status: 400 });
    }

    // Query to fetch category details from the database
    const [category] = await pool.execute(
      'SELECT * FROM blog_category WHERE id = ?',
      [categoryId]
    );

    // If no category is found
    if (category.length === 0) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    // Return category data
    return NextResponse.json({ success: true, data: category[0] });
  } catch (error) {
    // Log the error and return server error response
    console.error('GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {

  try {
    const body = await req.json();

    const {id} = await params;

    const categoryId = Number(id);

    console.log("Receiving Body", body);

    if(body.is_active !== null){
      const updatedResult = await pool.execute(
        'UPDATE blog_category SET is_active = ?, updated_at = NOW() WHERE id = ?',
        [body.is_active, Number(categoryId)]
      );

      if(updatedResult.affectedRows === 0){
        return NextResponse.json(
          { success: false, message: 'Category not found' }, {status: 404}
        )
      }

      return NextResponse.json(
        { success: true, data: { message: 'Category status updated successfully' } }, {status: 200}
      )
    }


    // Validate the request body
    if (!body.name || !body.slug) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    

    // Optional slug uniqueness check
    if (body.slug) {
      const [existingSlug] = await pool.execute(
        'SELECT id FROM blog_category WHERE slug = ? AND id != ?',
        [body.slug, categoryId]
      );

      if (existingSlug.length > 0) {
        return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 });
      }
    }

    // Update the blog category
    const [updatedResult] = await pool.execute(
      'UPDATE blog_category SET name = ?, slug = ?, description = ?, updated_at = NOW() WHERE id = ?',
      [body.name, body.slug, body.description, categoryId]
    );

    // If no rows were affected, return an error (category not found)
    if (updatedResult.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    // Return the updated category
    const [updatedCategory] = await pool.execute(
      'SELECT id, name, slug, description FROM blog_category WHERE id = ?',
      [categoryId]
    );

    return NextResponse.json({ success: true, data: updatedCategory[0] });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  
  try {
    const categoryId = Number(params.id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ success: false, error: 'Invalid category ID' }, { status: 400 });
    }

    // Check if the category is linked to any blogs
    const [linkedBlogs] = await pool.execute(
      'SELECT id FROM blogs WHERE category_id = ?',
      [categoryId]
    );

    if (linkedBlogs.length > 0) {
      return NextResponse.json({ success: false, error: 'Category is linked to one or more blogs and cannot be deleted' }, { status: 400 });
    }

    // Delete the category from the blog_category table
    const [deleteResult] = await pool.execute(
      'DELETE FROM blog_category WHERE id = ?',
      [categoryId]
    );

    if (deleteResult.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}