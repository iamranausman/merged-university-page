// app/api/internal/blogs/route.js
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db/db';
import { verifyAuthentication } from '../../../utils/verifyAuthentication';

export async function GET(request) {
  try {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';
    const popular = searchParams.get('popular') || '';
    const active = searchParams.get('active') || '';
    const country = searchParams.get('country') || '';
    const type = searchParams.get('type') || '';

    console.log('🔍 Blogs API Request:', { 
      page, 
      limit, 
      search, 
      category,
      startDate, 
      endDate, 
      popular, 
      active,
      country,
      type,
      url: request.url 
    });
    
    // Test database connection and count total posts
    console.log('🔍 Testing database connection...');
    
    // Counting total posts
    const [totalPostsCountResult] = await pool.query('SELECT COUNT(*) AS total FROM blogs');
    const totalPostsCount = totalPostsCountResult[0].total;
    console.log('✅ Total blogs in database:', totalPostsCount);

    if (totalPostsCount === 0) {
      console.log('🔍 No blogs found, creating sample blogs...');
      // Sample blogs creation logic if needed
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    let whereClause = 'WHERE 1=1'; // default where clause
    let queryParams = [];

    // Apply filters based on search
    if (search) {
      whereClause += ` AND (b.title LIKE ? OR b.short_description LIKE ? OR b.description LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Apply category filter
    if (category && category !== '') {
      whereClause += ` AND b.category_id = ?`;
      queryParams.push(category);
    }

    // Date range filters
    if (startDate || endDate) {
      if (startDate) {
        whereClause += ` AND b.created_at >= ?`;
        queryParams.push(`${startDate}T00:00:00Z`);
      }
      if (endDate) {
        whereClause += ` AND b.created_at <= ?`;
        queryParams.push(`${endDate}T23:59:59Z`);
      }
    }

    // Popular filter
    if (popular !== '') {
      whereClause += ` AND b.is_featured = ?`;
      queryParams.push(popular === 'true' ? 1 : 0);
    }

    // Active filter
    if (active !== '') {
      whereClause += ` AND b.is_active = ?`;
      queryParams.push(active === 'true' ? 1 : 0);
    }

    // Get total count after filtering
    const [totalCountResult] = await pool.query(`SELECT COUNT(*) AS total FROM blogs b ${whereClause}`, queryParams);
    const totalCount = totalCountResult[0].total;

    // Fetch paginated blogs
    const [posts] = await pool.query(`
      SELECT 
        b.id, b.title, b.short_description, b.description, b.image, b.category_id, b.user_id, 
        b.is_active, b.is_featured, b.enable_meta_tags, b.created_at, b.updated_at, b.custom_post_type,
        b.seo, b.post_attributes, b.slug, bc.name AS category_name, u.first_name AS user_name
      FROM blogs b
      LEFT JOIN blog_category bc ON b.category_id = bc.id
      LEFT JOIN users u ON b.user_id = u.id
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`, 
      [...queryParams, limit, skip]
    );

    // Pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        startItem: skip + 1,
        endItem: Math.min(skip + posts.length, totalCount),
      },
      filters: {
        country,
        category,
        search,
        startDate,
        endDate,
        popular,
        active,
      }
    });

  } catch (err) {
    console.error("❌ GET API Error:", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch blogs", 
      details: err.message 
    }, { status: 500 });
  }
}

export async function POST(request) {

  const token = request.cookies.get("university-token")?.value || null;
  
  if (!token) {
    return NextResponse.json(
      {
        message: "Please Login to continue"
      },
      {
        status: 400
      }
    );
  }

  const decoded = await verifyAuthentication(token)

  if (decoded instanceof NextResponse) {
    return NextResponse.json(
      {
        message: "You are not authorized to do this action"
      },
      {
        status: 400
      }
    );
  }

  try {
    const body = await request.json();
    console.log('🔍 POST /api/internal/blogs - Request body:', body);

    const {
      title,
      slug,
      category_id,
      short_description,
      description,
      image,
      is_featured = false,
      is_active = true,
      enable_meta_tags = false,
      custom_post_type = 'blog',
      seo = '',
      post_attributes = '',
    } = body;

    console.log('🔍 POST /api/internal/blogs - Extracted description:', description);

    // Validation
    const errors = [];
    if (!title?.trim()) errors.push('Title is required');
    if (!slug?.trim()) errors.push('Slug is required');
    if (!category_id) errors.push('Category is required');

    if (errors.length > 0) {
      console.error('Validation failed:', { errors, body });
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors },
        { status: 400 }
      );
    }

    // Check if category exists
    const [categoryExists] = await pool.execute(
      'SELECT id FROM blog_category WHERE id = ?',
      [category_id]
    );

    if (categoryExists.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid category' },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const [existingSlug] = await pool.execute(
      'SELECT id FROM blogs WHERE slug = ?',
      [slug.trim()]
    );

    if (existingSlug.length > 0) {
      return NextResponse.json(
        { success: false, message: 'A blog with this slug already exists' },
        { status: 400 }
      );
    }

    // Prepare blog data for insertion
    const blogData = {
      title: title.trim(),
      slug: slug.trim(),
      category_id: category_id,
      short_description: short_description?.trim() || null,
      description: description?.trim() || null,
      image: image?.trim() || null,
      is_featured: Boolean(is_featured),
      is_active: Boolean(is_active),
      enable_meta_tags: Boolean(enable_meta_tags),
      user_id: Number(decoded?.id),
      custom_post_type: custom_post_type.trim(),
      seo: seo?.trim() || null,
      post_attributes: post_attributes?.trim() || null,
    };

    console.log('🔍 POST /api/internal/blogs - Data being saved to database:', blogData);

    // Insert blog data
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO blogs (
        title,
        slug,
        category_id,
        short_description,
        description,
        image,
        is_featured,
        is_active,
        enable_meta_tags,
        user_id,
        custom_post_type,
        seo,
        post_attributes,
        sm_question,
        sm_answer,
        review_detail
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        blogData.title,
        blogData.slug,
        blogData.category_id,
        blogData.short_description,
        blogData.description,
        blogData.image,
        blogData.is_featured,
        blogData.is_active,
        blogData.enable_meta_tags,
        blogData.user_id,
        blogData.custom_post_type,
        blogData.seo,
        blogData.post_attributes,
      ]
    );

    const blogId = result.insertId;
    console.log('✅ Blog post created successfully:', { blogId, title: blogData.title });

    // Retrieve the inserted blog data
    const [newBlog] = await pool.execute(
      'SELECT * FROM blogs WHERE id = ?',
      [blogId]
    );

    return NextResponse.json({
      success: true,
      message: 'Blog post created successfully',
      data: newBlog[0]
    }, { status: 201 });

  } catch (error) {
    console.error('❌ POST /api/internal/blogs error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create blog post',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}