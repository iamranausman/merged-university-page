import pool from "../../../../lib/db/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    // Build where clause for search
    let whereClause = '';
    let queryParams = [];

    if (search && search.trim() !== '') {
      whereClause = `
        WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? 
        OR country LIKE ? OR country_name LIKE ?
      `;
      const searchValue = `%${search}%`;
      queryParams = [searchValue, searchValue, searchValue, searchValue, searchValue];
    }

    // Get total count for pagination
    const [totalResult] = await pool.execute(`
      SELECT COUNT(*) AS total FROM visit_visas ${whereClause}
    `, queryParams);
    
    const total = totalResult[0].total;
    
    // Get paginated results
    const [visas] = await pool.execute(`
      SELECT * FROM visit_visas ${whereClause} 
      ORDER BY created_at DESC LIMIT ? OFFSET ?
    `, [...queryParams, limit, skip]);

    const totalPages = Math.ceil(total / limit);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: visas,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching visit visas:', error);
    
    // Handle specific MySQL errors
    if (error.code === 'ECONNREFUSED') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Database pool failed',
          details: 'Cannot connect to database server'
        }),
        { status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal Server Error',
        details: error.message
      }),
      { status: 500 }
    );
  }
}
