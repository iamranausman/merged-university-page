import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';


export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('Received data:', data);

    // Map form fields to model fields
    const {
        studentId,
      fullName,
      email,
      phoneNumber,
      gender,
      dateOfBirth,
      nationality,
      aboutYourself,
      profileImage,
      postalCode,
      city,
      country,
      address,
      educations,
      experiences,
      skills,
      languages,
      drivingLicenses,
      hobbies,
      awards,
      projects
    } = data;

    console.log('Required fields check:', {
      fullName: !!fullName,
      email: !!email,
      phoneNumber: !!phoneNumber,
      gender: !!gender,
      dateOfBirth: !!dateOfBirth,
      nationality: !!nationality,
      city: !!city,
      country: !!country,
      address: !!address
    });

    // Validate required fields
    if (!fullName || !email || !phoneNumber || !gender || !dateOfBirth || !nationality || !city || !country || !address) {
      const missingFields = [];
      if (!fullName) missingFields.push('fullName');
      if (!email) missingFields.push('email');
      if (!phoneNumber) missingFields.push('phoneNumber');
      if (!gender) missingFields.push('gender');
      if (!dateOfBirth) missingFields.push('dateOfBirth');
      if (!nationality) missingFields.push('nationality');
      if (!city) missingFields.push('city');
      if (!country) missingFields.push('country');
      if (!address) missingFields.push('address');

      console.log('Missing fields:', missingFields);
      return NextResponse.json({ 
        success: false, 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Validate gender enum values and convert to proper case
    const validGenders = ['Male', 'Female', 'Other'];
    const normalizedGender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
    console.log('Gender validation:', { 
      received: gender, 
      normalized: normalizedGender,
      valid: validGenders, 
      isValid: validGenders.includes(normalizedGender) 
    });

    if (!validGenders.includes(normalizedGender)) {
      return NextResponse.json({ success: false, error: 'Invalid gender value. Must be Male, Female, or Other.' }, { status: 400 });
    }

    // Validate date format
    console.log('Date validation:', { received: dateOfBirth, isValid: !isNaN(new Date(dateOfBirth).getTime()) });
    if (!dateOfBirth || isNaN(new Date(dateOfBirth).getTime())) {
      return NextResponse.json({ success: false, error: 'Invalid date of birth format.' }, { status: 400 });
    }

    // Convert the date of birth to MySQL format
    const birthDate = new Date(dateOfBirth).toISOString().split('T')[0]; // Format as YYYY-MM-DD

    // Prepare JSON fields for SQL insertion
    const educationDetails = educations ? JSON.stringify(educations) : null;
    const experienceDetails = experiences ? JSON.stringify(experiences) : null;
    const skillsJson = skills ? JSON.stringify(skills) : null;
    const languagesJson = languages ? JSON.stringify(languages) : null;
    const drivingLicensesJson = drivingLicenses ? JSON.stringify(drivingLicenses) : null;
    const hobbiesJson = hobbies ? JSON.stringify(hobbies) : null;
    const awardsJson = awards ? JSON.stringify(awards) : null;
    const projectsJson = projects ? JSON.stringify(projects) : null;

    const [checkStudentID] = await pool.query<RowDataPacket[]>("SELECT * FROM resumes WHERE student_id = ?", [studentId])

    if(checkStudentID.length > 0)
    {
            // Save to database
        const [rows] = await pool.query<ResultSetHeader>(
            `UPDATE resumes 
            SET 
                full_name = ?, 
                email = ?, 
                phone_number = ?, 
                gender = ?, 
                birth_date = ?, 
                nationality = ?, 
                about_yourself = ?, 
                profile_image = ?, 
                postal_code = ?, 
                city = ?, 
                country = ?, 
                address = ?, 
                education_details = ?, 
                experience_details = ?, 
                skills = ?, 
                languages = ?, 
                driving_licence = ?, 
                hobbies_and_interest = ?, 
                awards = ?, 
                projects = ? 
            WHERE student_id = ?`,
            [
                fullName,
                email,
                phoneNumber,
                normalizedGender,
                birthDate,
                nationality,
                aboutYourself,
                profileImage,
                postalCode,
                city,
                country,
                address,
                educationDetails,
                experienceDetails,
                skillsJson,
                languagesJson,
                drivingLicensesJson,
                hobbiesJson,
                awardsJson,
                projectsJson,
                studentId
            ]
        );
        if(rows.affectedRows === 0)
        {
            return NextResponse.json({ success: false, message: 'Resume Updation failed.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, resume: rows });
    }
    else{
        const [rows] = await pool.query<ResultSetHeader>(
        `INSERT INTO resumes (student_id, full_name, email, phone_number, gender, birth_date, nationality, about_yourself, profile_image, postal_code, city, country, address, education_details, experience_details, skills, languages, driving_licence, hobbies_and_interest, awards, projects) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            studentId,
            fullName,
            email,
            phoneNumber,
            normalizedGender,
            birthDate,
            nationality,
            aboutYourself,
            profileImage,
            postalCode,
            city,
            country,
            address,
            educationDetails,
            experienceDetails,
            skillsJson,
            languagesJson,
            drivingLicensesJson,
            hobbiesJson,
            awardsJson,
            projectsJson
        ]
        );

        if(rows.affectedRows === 0)
        {
            return NextResponse.json({ success: false, message: 'Resume creation failed.' }, { status: 500 });
        }
        return NextResponse.json({ success: true, resume: rows });
    }
  } catch (error) {
    console.error('Resume creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
