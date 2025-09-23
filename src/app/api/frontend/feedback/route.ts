import pool from "../../../../lib/db/db";
import { NextResponse } from "next/server";

// Mapping scale 1–5 to text labels
const ratingMap: Record<number, string> = {
  1: "Very Dissatisfied",
  2: "Dissatisfied",
  3: "Neutral",
  4: "Satisfied",
  5: "Very Satisfied",
};

// ------------------ POST feedback ------------------
export async function POST(req: Request) {

  const connection = await pool.getConnection(); // Start a new connection

  try {

    await connection.beginTransaction(); // Start a transaction

    const body = await req.json();
    const {
      full_name,
      contact_number,
      consultant_id,
      rating,
      average_rating,
      behaviour_satis_level,
      timely_response,
      call_response,
      knowledge,
      likelihood,
      suggestion, // will be stored in customer_experience
    } = body;

    if (!full_name || !contact_number || !consultant_id || !rating) {
      return NextResponse.json(
        { ok: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert numeric ratings (1–5) to text
    const behaviourText = ratingMap[behaviour_satis_level] || "Neutral";
    const timelyText = ratingMap[timely_response] || "Neutral";
    const callText = ratingMap[call_response] || "Neutral";
    const knowledgeText = ratingMap[knowledge] || "Neutral";
    const likelihoodText = ratingMap[likelihood] || "Neutral";

    // Insert feedback
    const [result] = await pool.query(
      `INSERT INTO client_feedbacks 
        (full_name, contact_number, consultant_id, rating, average_rating, 
         behaviour_satis_level, timely_response, call_response, knowledge, 
         likelihood, customer_experience, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        full_name,
        contact_number,
        consultant_id,
        rating,
        average_rating,
        behaviourText,
        timelyText,
        callText,
        knowledgeText,
        likelihoodText,
        suggestion || null, // store suggestion in customer_experience
      ]
    );

    const feedbackData = {
      full_name: full_name,
      contact_number: contact_number,
      consultant_id: consultant_id,
      rating: rating,
      average_rating: average_rating,
      behaviour_satis_level: behaviourText,
      timely_response: timelyText,
      call_response: callText,
      knowledge: knowledgeText,
      likelihood: likelihoodText,
      customer_experience: suggestion || null
    };

    console.log(JSON.stringify(feedbackData))

    const response = await fetch("https://crm-universitiespage.com/reactapis/api/website_client_feedback_crm/store", {
      method: "POST",
      body: JSON.stringify(feedbackData),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${process.env.CRM_API_KEY}`,
      },
    })

    const data = await response.json();

    if (data?.status_code !== 200) {

      await connection.rollback();

      return NextResponse.json(
        {
          message: "Failed to submit your form. Please try again later.",
          success: false
        },
        {
          status: 500
        }
      )
    }

    await connection.commit();

    return NextResponse.json({
      ok: true,
      message: "Feedback submitted successfully",
      feedback_id: (result as any).insertId,
    });
  } catch (error) {

    await connection.rollback();

    console.error("POST /feedbacks error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
