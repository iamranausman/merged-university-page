
import { RowDataPacket } from 'mysql2';
import pool from '../../../../../lib/db/db';


import { NextResponse } from 'next/server';

export async function GET(req) {

  const { searchParams } = new URL(req.url);
  const std = searchParams.get('stId');
  const i = searchParams.get('i');
  let student_id = std || i;

  if (!student_id) {
    return NextResponse.json({ error: 'Missing student id' }, { status: 400 });
  }

  try {
    // Fetch the resume from the database
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM resumes WHERE student_id = ? LIMIT 1',
      [student_id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const resume = rows[0];

    if (std) {
      // Check the link_status and update the edit count (if applicable)
      let count = 0;
      if (resume.link_status && !isNaN(Number(resume.link_status))) {
        count = Number(resume.link_status);
      }

      if (count >= 3) {
        return NextResponse.json({ error: 'Edit limit reached' }, { status: 403 });
      }

      // Update the link_status (edit count)
      await pool.query(
        'UPDATE resumes SET link_status = ? WHERE id = ?',
        [String(count + 1), resume.id]
      );
    }

    // Helper function to parse JSON fields
    const parseField = (f) => {
      try {
        return JSON.parse(f);
      } catch {
        return f;
      }
    };

    // Prepare the result object
    const result = {
      id: resume.id,
      studentId: resume.student_id,
      fullName: resume.full_name,
      email: resume.email,
      emailStatus: resume.email_status,
      link_status: resume.link_status,
      phoneNumber: resume.phone_number,
      gender: resume.gender,
      dateOfBirth: resume.birth_date,
      nationality: resume.nationality,
      aboutYourself: resume.about_yourself,
      profileImage: resume.profile_image,
      postalCode: resume.postal_code,
      city: resume.city,
      country: resume.country,
      address: resume.address,
      education_details: parseField(resume.education_details),
      experience_details: parseField(resume.experience_details),
      skills: parseField(resume.skills),
      languages: parseField(resume.languages),
      driving_licence: parseField(resume.driving_licence),
      hobbies_and_interest: parseField(resume.hobbies_and_interest),
      awards: parseField(resume.awards),
      projects: parseField(resume.projects),
      motherLanguage: resume.mother_language,
      createdAt: resume.created_at,
      updatedAt: resume.updated_at,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}