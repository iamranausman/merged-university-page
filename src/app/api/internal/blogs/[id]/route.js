import pool from '../../../../../lib/db/db';
import { NextResponse } from 'next/server';

import { s3 } from "../../../../../lib/s3config";

import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export async function GET(request, { params }) {

  try {
    const { id } = await params;
    const blogId = parseInt(id);

    if (isNaN(blogId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    // Fetch blog data
    const [blog] = await pool.execute(
      `SELECT 
        blogs.*, 
        blog_category.id AS category_id, 
        blog_category.name AS category_name, 
        users.email AS user_email
      FROM blogs
      LEFT JOIN blog_category ON blogs.category_id = blog_category.id
      LEFT JOIN users ON blogs.user_id = users.id
      WHERE blogs.id = ?`,
      [blogId]
    );

    if (blog.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }

    // Format the result as per the structure you want
    const blogData = {
      ...blog[0],
      enable_meta_tags: blog[0].enable_meta_tags || false,
    };

    return NextResponse.json({
      success: true,
      data: blogData,
    });

  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  
  try {
    const { id } = await params;
    const blogId = parseInt(id);

    if (isNaN(blogId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('🔍 PUT /api/internal/blogs - Request body:', body);

    // Check if this is just a meta tag update
    const isMetaTagOnlyUpdate = Object.keys(body).length === 1 && 
                               body.enable_meta_tags !== undefined;

    // Sanitize the body to replace undefined with null
    const updateData = isMetaTagOnlyUpdate 
      ? { enable_meta_tags: body.enable_meta_tags ?? null }
      : {
          title: body.title ?? null,
          slug: body.slug ?? null,
          short_description: body.short_description ?? null,
          description: body.description ?? null,
          image: body.image ?? null,
          image_ext: body.image_ext ?? null,
          is_active: body.is_active ?? null,
          is_featured: body.is_featured ?? null,
          sm_question: body.sm_question ?? null,
          sm_answer: body.sm_answer ?? null,
          review_detail: body.review_detail ?? null,
          enable_meta_tags: body.enable_meta_tags ?? null,
          custom_post_type: body.custom_post_type ?? null,
          post_attributes: body.post_attributes ?? null,
          sort_order: body.sort_order ?? null,
          seo: body.seo ?? null,
          category_id: body.category_id ? Number(body.category_id) : null
        };

    console.log('🔍 PUT /api/internal/blogs - Update data:', updateData);

    // Update query logic
    const setClauses = Object.keys(updateData)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(updateData);

    // Ensure the blog ID is added to the values array for the WHERE clause
    values.push(blogId);

    // Execute the update query
    const [result] = await pool.execute(
      `UPDATE blogs 
       SET ${setClauses} 
       WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }

    // Retrieve the updated blog along with related category and user data
    const [updatedBlog] = await pool.execute(
      `SELECT 
        blogs.*, 
        blog_category.id AS category_id, 
        blog_category.name AS category_name, 
        users.email AS user_email
      FROM blogs
      LEFT JOIN blog_category ON blogs.category_id = blog_category.id
      LEFT JOIN users ON blogs.user_id = users.id
      WHERE blogs.id = ?`,
      [blogId]
    );

    if (updatedBlog.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }

    console.log('✅ PUT /api/internal/blogs - Blog updated successfully:', updatedBlog[0]);

    return NextResponse.json({
      success: true,
      message: 'Blog updated successfully',
      data: updatedBlog[0],
    });

  } catch (error) {
    console.error('PUT Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}


export async function DELETE(request, { params }) {

  try {
    const { id } = await params;
    const blogId = parseInt(id);

    if (isNaN(blogId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    // Check if the blog exists first (optional but recommended)
    const [blogExists] = await pool.execute(
      'SELECT id, image FROM blogs WHERE id = ?',
      [blogId]
    );

    if (blogExists.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }

    // Delete the blog from the database
    const [deleteResult] = await pool.execute(
      'DELETE FROM blogs WHERE id = ?',
      [blogId]
    );

    // If no rows were deleted, the blog doesn't exist
    if (deleteResult.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Blog not found' },
        { status: 404 }
      );
    }

    const blog = blogExists[0];
    const imageUrl = blog.image;

    // If there's an associated image, delete it from S3
    if (imageUrl) {
      // Extract the S3 key from the image URL (assuming it follows the standard S3 URL pattern)
      const imageKey = imageUrl.split('/').pop(); // Extract the filename from the URL

      const deleteParams = {
        Bucket: process.env.AWS_BUCKET,  // Your S3 bucket name
        Key: `uploads/articles/featured/${imageKey}`  // The key (path) to the object in S3
      };

      // Delete the image from S3
      try {
        await s3.send(new DeleteObjectCommand(deleteParams));
        console.log(`✅ Image ${imageKey} deleted from S3 successfully.`);
      } catch (error) {
        console.error('Error deleting image from S3:', error);
        return NextResponse.json(
          { success: false, message: 'Failed to delete image from S3', error: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Blog and its image deleted successfully'
    });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}