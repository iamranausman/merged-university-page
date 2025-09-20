import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const search = searchParams.get('search') || '';
    const country = searchParams.get('country') || '';
    const qualification = searchParams.get('qualification') || '';
    const scholarship = searchParams.get('scholarship') || '';
    const subject = searchParams.get('subject') || '';
    const sort = searchParams.get('sort') || 'relevance';

    console.log('🔍 Search API called with:', { 
      type, page, limit, search, country, qualification, scholarship, subject, sort 
    });

    // Base queries
    let universityWhere = "WHERE u.display = true AND u.active = true";
    let courseWhere = "WHERE c.active = '1'";
    let universityParams: any[] = [];
    let courseParams: any[] = [];
    let universityOrderBy = "";
    let courseOrderBy = "";

    // Apply sort options
    switch(sort) {
      case 'popularity':
        universityOrderBy = "ORDER BY u.popular DESC, u.created_at DESC";
        courseOrderBy = "ORDER BY c.popular DESC, c.created_at DESC";
        break;
      case 'ranking':
        universityOrderBy = "ORDER BY u.ranking IS NULL, u.ranking ASC, u.created_at DESC";
        courseOrderBy = "ORDER BY u.ranking IS NULL, u.ranking ASC, c.created_at DESC";
        break;
      case 'newest':
        universityOrderBy = "ORDER BY u.created_at DESC";
        courseOrderBy = "ORDER BY c.created_at DESC";
        break;
      default: // relevance
        universityOrderBy = "ORDER BY u.created_at DESC";
        courseOrderBy = "ORDER BY c.created_at DESC";
    }

    // Apply filters
    if (search) {
      universityWhere += " AND (u.name LIKE ? OR u.country LIKE ? OR u.city LIKE ?)";
      universityParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      
      courseWhere += " AND (c.name LIKE ? OR c.about LIKE ? OR u.name LIKE ?)";
      courseParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (country && country !== 'Select Country') {
      universityWhere += " AND u.country LIKE ?";
      universityParams.push(`%${country}%`);
      
      courseWhere += " AND u.country LIKE ?";
      courseParams.push(`%${country}%`);
    }

    if (qualification) {
      courseWhere += " AND c.qualification = ?";
      courseParams.push(qualification);
    }

    if (scholarship) {
      if (scholarship === 'With Scholarship') {
        universityWhere += " AND u.scholarship = true";
        courseWhere += " AND c.scholarship = true";
      } else if (scholarship === 'Without Scholarship') {
        universityWhere += " AND u.scholarship = false";
        courseWhere += " AND c.scholarship = false";
      }
    }

    if (subject) {
      courseWhere += " AND s.name LIKE ?";
      courseParams.push(`%${subject}%`);
    }

    let results: any[] = [];
    let totalCount = 0;

    // ---------- Universities ----------
    if (type === 'university' || type === 'all') {
      const [uniCountRows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM university_details u ${universityWhere}`,
        universityParams
      );
      
      const uniCount = uniCountRows[0].count;
      totalCount += uniCount;

      const skip = (page - 1) * limit;
      const [uniRows] = await pool.query<RowDataPacket[]>(
        `SELECT u.* FROM university_details u ${universityWhere} 
         ${universityOrderBy} LIMIT ? OFFSET ?`,
        [...universityParams, limit, skip]
      );

      results = [
        ...results,
        ...uniRows.map(u => ({
          id: u.id,
          type: 'university',
          name: u.name,
          slug: u.slug,
          image: u.logo || '/university-placeholder.png',
          location: `${u.city ? u.city + ', ' : ''}${u.country}`,
          ranking: u.ranking,
          scholarship: u.scholarship,
          phone: u.phone_no ? u.phone_no.toString() : null,
          email: u.alternate_email,
          rawData: u
        }))
      ];
    }

    // ---------- Courses ----------
    if (type === 'course' || type === 'all') {
      const courseJoin = `
        LEFT JOIN university_details u ON c.university_id = u.id
        LEFT JOIN subjects s ON c.subject_id = s.id
        LEFT JOIN posts p ON c.qualification = p.id
      `;
      
      const [courseCountRows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM courses c ${courseJoin} ${courseWhere}`,
        courseParams
      );
      
      const courseCount = courseCountRows[0].count;
      totalCount += courseCount;

      const skip = (page - 1) * limit;
      const [courseRows] = await pool.query<RowDataPacket[]>(
        `SELECT c.*, 
                u.name as university_name, 
                u.logo as university_logo, 
                u.country as university_country, 
                u.city as university_city,
                u.ranking as university_ranking,
                s.name as subject_name,
                p.id as qualification_id,
                p.title as qualification_title
         FROM courses c ${courseJoin} ${courseWhere} 
         ${courseOrderBy} LIMIT ? OFFSET ?`,
        [...courseParams, limit, skip]
      );

      results = [
        ...results,
        ...courseRows.map(c => ({
          id: c.id,
          type: 'course',
          name: c.name,
          slug: c.slug,
          image: c.image || c.university_logo || '/course-placeholder.png',
          university: c.university_name,
          location: `${c.university_city ? c.university_city + ', ' : ''}${c.university_country}`,
          duration: c.duration,
          fee: c.fee,
          scholarship: c.scholarship,
          subject: c.subject_name,
          qualification: c.qualification_title,
          qualification_id: c.qualification_id,
          ranking: c.university_ranking,
          rawData: c
        }))
      ];
    }

    // ---------- Filters ----------
    const [countries] = await pool.query<RowDataPacket[]>(
      "SELECT DISTINCT country FROM countries WHERE country IS NOT NULL AND country != '' ORDER BY country"
    );
    
    // Get qualifications with ID and title
    const [qualifications] = await pool.query<RowDataPacket[]>(
      "SELECT id, title FROM posts WHERE title IS NOT NULL AND is_active = '1' ORDER BY title"
    );
    
    const [subjects] = await pool.query<RowDataPacket[]>(
      "SELECT id, name FROM subjects ORDER BY name"
    );

    return NextResponse.json({
      success: true,
      data: results,
      filters: {
        countries: countries.map(c => c.country),
        qualifications: qualifications.map(q => ({ id: q.id, title: q.title })),
        subjects: subjects
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit
      }
    });

  } catch (error: any) {
    console.error('🔍 Search API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}