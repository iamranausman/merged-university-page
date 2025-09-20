"use client";
import { useState } from "react";
import Swal from "sweetalert2";

export default function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [experience, setExperience] = useState({});
  const [recommend, setRecommend] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [consultantId, setConsultantId] = useState(1);
  const [activeSection, setActiveSection] = useState("personal");

  const stars = [1, 2, 3, 4, 5];
  const questions = [
    "Behaviour",
    "Timely Response",
    "Call pickup response",
    "Knowledge",
    "Problem Solving",
    "Professionalism",
  ];
  const experienceOptions = [
    "Very Satisfied",
    "Satisfied",
    "Neutral",
    "Dissatisfied",
    "Very Dissatisfied",
  ];
  const recommendOptions = [
    "Very Likely",
    "Likely",
    "Neutral",
    "Unlikely",
    "Very Unlikely",
  ];

  const handleExperienceChange = (question, value) => {
    setExperience((prev) => ({ ...prev, [question]: value }));
  };

  function getExperienceValue(question) {
    const value = experience[question];
    switch (value) {
      case "Very Satisfied": return 5;
      case "Satisfied": return 4;
      case "Neutral": return 3;
      case "Dissatisfied": return 2;
      case "Very Dissatisfied": return 1;
      default: return 0;
    }
  }

  function getRecommendValue() {
    switch (recommend) {
      case "Very Likely": return 5;
      case "Likely": return 4;
      case "Neutral": return 3;
      case "Unlikely": return 2;
      case "Very Unlikely": return 1;
      default: return 0;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaChecked) {
      Swal.fire({ icon: "warning", title: "Please verify the reCAPTCHA" });
      return;
    }
    if (!fullName || !contactNumber) {
      Swal.fire({ icon: "warning", title: "Please fill in your name and contact number" });
      return;
    }
    for (const q of questions) {
      if (!experience[q]) {
        Swal.fire({ icon: "warning", title: `Please answer: ${q}` });
        return;
      }
    }
    if (!recommend) {
      Swal.fire({ icon: "warning", title: "Please select a recommendation option" });
      return;
    }
    const formData = {
      full_name: fullName,
      contact_number: contactNumber,
      consultant_id: Number(consultantId),
      rating: Number(rating),
      average_rating: Number(rating),
      behaviour_satis_level: Number(getExperienceValue("Behaviour")),
      timely_response: Number(getExperienceValue("Timely Response")),
      call_response: Number(getExperienceValue("Call pickup response")),
      knowledge: Number(getExperienceValue("Knowledge")),
      likelihood: Number(getRecommendValue()),
      customer_experience: Number(getExperienceValue("Professionalism")),
      suggestion,
    };
    try {
      const res = await fetch("/api/frontend/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.ok) {
        Swal.fire({ 
          icon: "success", 
          title: "Thank You for Your Feedback!", 
          text: "Your insights help us improve our services. We appreciate your time.",
          confirmButtonColor: "#0B6D76"
        });
        setRating(0);
        setExperience({});
        setRecommend("");
        setSuggestion("");
        setFullName("");
        setContactNumber("");
        setCaptchaChecked(false);
        setActiveSection("personal");
      } else {
        Swal.fire({ icon: "error", title: "Error", text: result.message || "Failed to submit feedback." });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to submit feedback." });
    }
  };

  const progressPercentage = () => {
    let completed = 0;
    if (fullName && contactNumber) completed += 20;
    if (rating > 0) completed += 20;
    if (Object.keys(experience).length === questions.length) completed += 20;
    if (recommend) completed += 20;
    if (suggestion || captchaChecked) completed += 20;
    return completed;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f9fa] to-[#e0f2f3] py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#0B6D76] to-[#095b5a] text-white p-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Client Satisfaction Survey</h1>
          <p className="text-lg opacity-90">
            Your feedback helps us improve our services and provide better support
          </p>
        </div>

        {/* Progress Bar */}
        <div className="px-8 pt-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Survey Progress</span>
              <span className="text-sm font-medium text-[#0B6D76]">{progressPercentage()}% Complete</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-gradient-to-r from-[#0B6D76] to-[#14b8c6] rounded-full transition-all duration-500" 
                style={{ width: `${progressPercentage()}%` }}
              ></div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 font-medium ${activeSection === "personal" ? "text-[#0B6D76] border-b-2 border-[#0B6D76]" : "text-gray-500"}`}
              onClick={() => setActiveSection("personal")}
            >
              Personal Info
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeSection === "rating" ? "text-[#0B6D76] border-b-2 border-[#0B6D76]" : "text-gray-500"}`}
              onClick={() => setActiveSection("rating")}
            >
              Rating
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeSection === "experience" ? "text-[#0B6D76] border-b-2 border-[#0B6D76]" : "text-gray-500"}`}
              onClick={() => setActiveSection("experience")}
            >
              Experience
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeSection === "feedback" ? "text-[#0B6D76] border-b-2 border-[#0B6D76]" : "text-gray-500"}`}
              onClick={() => setActiveSection("feedback")}
            >
              Additional Feedback
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {/* Personal Information Section */}
          {(activeSection === "personal") && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Information</h3>
              <p className="text-gray-600 mb-6">
                Please provide your contact information so we can follow up if needed. 
                All information is kept confidential.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter Your Full Name"
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Contact Number *</label>
                  <input
                    type="text"
                    placeholder="Enter Your Contact Number"
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                    value={contactNumber}
                    onChange={e => setContactNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div>
              <label className="block text-gray-700 font-medium mb-2">Branch Visited</label>
              <select 
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                value={consultantId}
                onChange={e => setConsultantId(Number(e.target.value))}
              >
                <option value={1}>Lahore Branch</option>
                <option value={2}>Islamabad Branch</option>
                <option value={3}>Karachi Branch</option>
                <option value={4}>Thailand Office</option>
                <option value={5}>China Office</option>
              </select>
            </div>

              
              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={() => setActiveSection("rating")}
                  className="bg-[#0B6D76] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#095b5a] transition-colors"
                >
                  Next: Rating
                </button>
              </div>
            </div>
          )}

          {/* Rating Section */}
          {(activeSection === "rating") && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Overall Satisfaction</h3>
              <p className="text-gray-600 mb-6">
                How would you rate your overall satisfaction with our counselor service?
              </p>
              
              <div className="text-center mb-6 bg-gray-50 p-6 rounded-xl">
                <div className="flex justify-center space-x-1 mb-4">
                  {stars.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      className={`cursor-pointer text-4xl transition-all ${
                        rating >= s ? "text-yellow-400 scale-110" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p className="text-gray-700 font-medium">
                  {rating === 0 ? "Select your rating" : `You rated: ${rating} star${rating > 1 ? 's' : ''}`}
                </p>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setActiveSection("personal")}
                  className="text-[#0B6D76] px-6 py-2 rounded-lg font-medium border border-[#0B6D76] hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection("experience")}
                  className="bg-[#0B6D76] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#095b5a] transition-colors"
                >
                  Next: Experience
                </button>
              </div>
            </div>
          )}

          {/* Experience Section */}
          {(activeSection === "experience") && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Experience</h3>
              <p className="text-gray-600 mb-6">
                Please rate your experience with our counselor on the following aspects:
              </p>
              
              <div className="overflow-x-auto mb-6 bg-white rounded-xl border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-4 px-4 text-left font-semibold text-gray-700">
                        Evaluation Criteria
                      </th>
                      {experienceOptions.map((opt) => (
                        <th
                          key={opt}
                          className="py-4 px-4 text-center font-semibold text-gray-700"
                        >
                          {opt}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {questions.map((q, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="py-4 px-4 text-gray-800 font-medium">{q}</td>
                        {experienceOptions.map((opt) => (
                          <td key={opt} className="py-4 px-4 text-center">
                            <input
                              type="radio"
                              name={q}
                              value={opt}
                              checked={experience[q] === opt}
                              onChange={() => handleExperienceChange(q, opt)}
                              className="w-4 h-4 accent-[#0B6D76]"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setActiveSection("rating")}
                  className="text-[#0B6D76] px-6 py-2 rounded-lg font-medium border border-[#0B6D76] hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection("feedback")}
                  className="bg-[#0B6D76] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#095b5a] transition-colors"
                >
                  Next: Additional Feedback
                </button>
              </div>
            </div>
          )}

          {/* Feedback Section */}
          {(activeSection === "feedback") && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional Feedback</h3>
              
              <div className="mb-6">
                <p className="mb-4 font-medium text-gray-700">
                  How likely are you to recommend our service to a friend or colleague?
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {recommendOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setRecommend(opt)}
                      className={`px-5 py-2 rounded-full border transition-all ${
                        recommend === opt
                          ? "bg-[#0B6D76] text-white shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block mb-4 font-medium text-gray-700">
                  Do you have any suggestions for how we can improve our customer experience?
                </label>
                <textarea
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="border border-gray-300 rounded-lg p-3 w-full h-32 focus:outline-none focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                  placeholder="Your suggestions are valuable to us..."
                ></textarea>
              </div>
              
              <div className="mb-6">
                <div
                  onClick={() => setCaptchaChecked(!captchaChecked)}
                  className="border border-gray-300 rounded-lg p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 flex items-center justify-center border rounded-sm transition-colors ${
                        captchaChecked
                          ? "bg-[#0B6D76] border-[#0B6D76]"
                          : "border-gray-400"
                      }`}
                    >
                      {captchaChecked && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-700 font-medium">
                      I am not a robot
                    </span>
                  </div>
                  <div className="bg-gray-100 p-1 rounded">
                    <span className="text-xs font-mono text-gray-500">reCAPTCHA</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  By checking this box, you help prevent automated submissions.
                </p>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setActiveSection("experience")}
                  className="text-[#0B6D76] px-6 py-2 rounded-lg font-medium border border-[#0B6D76] hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-[#0B6D76] text-white px-8 py-2 rounded-lg font-medium hover:bg-[#095b5a] transition-colors shadow-md"
                  disabled={!captchaChecked}
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          )}
        </form>
        
        {/* Footer Note */}
        <div className="bg-gray-50 p-6 text-center border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Your feedback is confidential and will be used solely to improve our services.<br />
            Thank you for taking the time to share your experience with us.
          </p>
        </div>
      </div>
    </div>
  );
}