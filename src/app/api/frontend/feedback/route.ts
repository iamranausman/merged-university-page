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
  try {
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

    return NextResponse.json({
      ok: true,
      message: "Feedback submitted successfully",
      feedback_id: (result as any).insertId,
    });
  } catch (error) {
    console.error("POST /feedbacks error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
