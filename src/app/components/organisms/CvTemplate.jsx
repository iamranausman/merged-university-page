import React, { useRef } from 'react';
import { CgProfile } from "react-icons/cg";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function CvTemplate({
  personalInfo,
  addressDetails,
  educations,
  experiences,
  skills,
  languages,
  drivingLicenses,
  hobbies,
  awards,
  projects
}) {
  const cvRef = useRef();

  const handleDownloadPDF = async () => {

    const element = cvRef.current;
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#fff' });
    console.log("Canvas Error", canvas)
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('cv.pdf');
  };

  return (
    <>
      <div ref={cvRef} className="max-w-2xl mx-auto bg-white p-0 rounded-lg shadow-lg mt-8 border border-gray-200 relative">
        {/* Header */}
        <div className="flex flex-row items-center justify-between px-8 pt-8 pb-2 border-b border-gray-200">
          <div className="flex items-center space-x-6">
            {personalInfo.profileImage ? (
              <img src={personalInfo.profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-blue-200" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-400">
                <CgProfile />
              </div>
            )}
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-blue-900">{personalInfo.fullName || 'Full Name'}</h2>
              <div className="text-xs text-gray-700">Nationality: {personalInfo.nationality || '-'}</div>
              <div className="text-xs text-gray-700">Date of birth: {personalInfo.dateOfBirth || '-'}</div>
              <div className="text-xs text-gray-700">Phone number: {personalInfo.phoneNumber || '-'}</div>
              <div className="text-xs text-gray-700">Email address: {personalInfo.email || '-'}</div>
              <div className="text-xs text-gray-700">Home: {addressDetails.address || '-'}{addressDetails.city ? ', ' + addressDetails.city : ''}{addressDetails.country ? ', ' + addressDetails.country : ''}</div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <img src="/assets/europass-logo.png" alt="europass" className="h-10 mb-2" onError={e => e.target.style.display='none'} />
          </div>
        </div>
        {/* Sections */}
        <div className="px-8 py-4">
          {/* Education and Training */}
          <div className="mb-2">
            <h3 className="text-[15px] font-bold text-blue-900 border-b border-gray-200 pb-1 uppercase tracking-wide">Education and Training</h3>
          </div>
          <div className="mb-4">
            {educations.length > 0 && !educations.every(e => !e.degree_name) ? (
              educations.map((edu, i) => (
                <div key={edu.id} className="text-gray-800 text-[13px] mb-1">
                  <span className="font-semibold">{edu.degree_name}</span> at {edu.university_name} ({edu.city}, {edu.country})<br/>
                  {edu.start_date} - {edu.education_present ? 'Present' : edu.end_date}
                </div>
              ))
            ) : (
              <div className="text-red-600 text-[13px]">Record Not Added</div>
            )}
          </div>
          {/* Work Experience */}
          <div className="mb-2">
            <h3 className="text-[15px] font-bold text-blue-900 border-b border-gray-200 pb-1 uppercase tracking-wide">Work Experience</h3>
          </div>
          <div className="mb-4">
            {experiences.length > 0 && !experiences.every(e => !e.position) ? (
              experiences.map((exp, i) => (
                <div key={exp.id} className="text-gray-800 text-[13px] mb-1">
                  <span className="font-semibold">{exp.position}</span> at {exp.employer} ({exp.city}, {exp.country})<br/>
                  {exp.start_date} - {exp.currentlyWorking ? 'Present' : exp.end_date}<br/>
                  <span className="italic text-gray-600">{exp.details}</span>
                </div>
              ))
            ) : (
              <div className="text-red-600 text-[13px]">Record Not Added</div>
            )}
          </div>
          {/* Language Skills */}
          <div className="mb-2">
            <h3 className="text-[15px] font-bold text-blue-900 border-b border-gray-200 pb-1 uppercase tracking-wide">Language Skills</h3>
          </div>
          <div className="mb-4">
            <div className="text-xs text-gray-700 mb-1">Mother tongue(s): <span className="font-semibold">{languages[0]?.name || '-'}</span></div>
            <div className="text-xs text-gray-700 mb-1">Other language(s):</div>
            {languages.length > 1 && languages[1].name ? (
              <div className="text-xs text-gray-800 ml-4">
                <span className="font-semibold">{languages[1].name}</span>
                {languages[1].cirtificate_type && <span className="ml-2 text-gray-500">({languages[1].cirtificate_type})</span>}
              </div>
            ) : (
              <div className="text-red-600 text-[13px] ml-4">Record Not Added</div>
            )}
          </div>
          {/* Digital Skills */}
          <div className="mb-2">
            <h3 className="text-[15px] font-bold text-blue-900 border-b border-gray-200 pb-1 uppercase tracking-wide">Digital Skills</h3>
          </div>
          <div className="mb-4">
            {skills.length && !skills.every(s => !s.name) ? (
              <div className="flex flex-wrap gap-2 text-xs text-gray-800">
                {skills.map(skill => (
                  <span key={skill.id} className="border-b border-dotted border-gray-400 pb-0.5">{skill.name}{skill.level && <span className="ml-1 text-gray-500">({skill.level})</span>}</span>
                ))}
              </div>
            ) : (
              <div className="text-red-600 text-[13px]">Record Not Added</div>
            )}
          </div>
          {/* Driving Licence */}
          <div className="mb-2">
            <h3 className="text-[15px] font-bold text-blue-900 border-b border-gray-200 pb-1 uppercase tracking-wide">Driving Licence</h3>
          </div>
          <div className="mb-4">
            {drivingLicenses.length && !drivingLicenses.every(l => !l.licenseType) ? (
              <div className="flex flex-wrap gap-2 text-xs text-gray-800">
                {drivingLicenses.map(lic => (
                  <span key={lic.id}>{lic.licenseType}</span>
                ))}
              </div>
            ) : (
              <div className="text-red-600 text-[13px]">Record Not Added</div>
            )}
          </div>
          {/* Hobbies and Interests */}
          <div className="mb-2">
            <h3 className="text-[15px] font-bold text-blue-900 border-b border-gray-200 pb-1 uppercase tracking-wide">Hobbies and Interests</h3>
          </div>
          <div className="mb-4">
            {hobbies.length && hobbies.some(h => typeof h === 'string' && h.trim()) ? (
              <div className="flex flex-wrap gap-2 text-xs text-gray-800">
                {hobbies.filter(h => typeof h === 'string' && h.trim()).map((hobby, i) => (
                  <span key={i}>{hobby}</span>
                ))}
              </div>
            ) : (
              <div className="text-red-600 text-[13px]">Record Not Added</div>
            )}
          </div>
          {/* Honours and Awards */}
          <div className="mb-2">
            <h3 className="text-[15px] font-bold text-blue-900 border-b border-gray-200 pb-1 uppercase tracking-wide">Honours and Awards</h3>
          </div>
          <div className="mb-4">
            {awards.length && !awards.every(a => !a.awarded_title) ? (
              awards.map((award, i) => (
                <div key={award.id} className="text-gray-800 text-[13px] mb-1">
                  <span className="font-semibold">{award.awarded_title}</span> ({award.awarded_date})<br/>
                  {award.awarded_uni_name}<br/>
                  <span className="italic text-gray-600">{award.details}</span>
                </div>
              ))
            ) : (
              <div className="text-red-600 text-[13px]">Record Not Added</div>
            )}
          </div>
          {/* Projects */}
          <div className="mb-2">
            <h3 className="text-[15px] font-bold text-blue-900 border-b border-gray-200 pb-1 uppercase tracking-wide">Projects</h3>
          </div>
          <div className="mb-4">
            {projects.length && !projects.every(p => !p.project_title && !p.details) ? (
              projects.map((project, i) => (
                <div key={project.id} className="text-gray-800 text-[13px] mb-1">
                  <span className="font-semibold">{project.project_title}</span> {project.project_start_date && `(${project.project_start_date}`} - {project.project_end_date || 'Present'})<br/>
                  <span className="italic text-gray-600">{project.details}</span>
                </div>
              ))
            ) : (
              <div className="text-red-600 text-[13px]">Record Not Added</div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-6 mb-12">
        <button
          onClick={handleDownloadPDF}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-lg shadow"
        >
          Download as PDF
        </button>
      </div>
    </>
  );
}

export default CvTemplate;