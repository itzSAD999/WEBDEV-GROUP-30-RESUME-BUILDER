
// Default section order when none specified
const DEFAULT_ORDER = [
  "profile",
  "education",
  "experience",
  "volunteering",
  "leadership",
  "projects",
  "certifications",
  "achievements",
  "skills",
  "interests",
  "custom",
  "references"
];

export const StanfordTemplate = ({ data }) => {
  const accentColor = "#8B0000"; // Cardinal red

  const hasContent = 
    data.personalInfo.fullName || 
    data.education.length > 0 || 
    data.workExperience.length > 0 ||
    data.projects.length > 0;

  // Use section order from data or default
  const sectionOrder = data.sectionOrder?.length > 0 ? data.sectionOrder : DEFAULT_ORDER;

  // Section renderers mapped by key
  const renderSection = (sectionKey) => {
    switch (sectionKey) {
      case "profile":
        return data.profile ? (
          <Section key="profile" title="SUMMARY" color={accentColor}>
            <p className="text-xs leading-relaxed">{data.profile}</p>
          </Section>
        ) : null;

      case "education":
        return data.education.length > 0 ? (
          <Section key="education" title="EDUCATION" color={accentColor}>
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-2 print:break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold">{edu.institution}{edu.location && `, ${edu.location}`}</span>
                  <span className="text-xs text-gray-600">{edu.startDate} — {edu.endDate}</span>
                </div>
                <div className="italic text-gray-700">{edu.degree}</div>
                {edu.gpa && <div className="text-xs text-gray-600">GPA: {edu.gpa}</div>}
                {edu.coursework && <div className="text-xs text-gray-600 mt-1">{edu.coursework}</div>}
                {edu.bullets && edu.bullets.filter(b => b.trim()).length > 0 && (
                  <ul className="text-xs text-gray-600 mt-1 ml-4">
                    {edu.bullets.filter(b => b.trim()).map((bullet, idx) => (
                      <li key={idx} className="list-disc">{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </Section>
        ) : null;

      case "experience":
      case "workExperience":
        return data.workExperience.length > 0 ? (
          <Section key="experience" title="WORK EXPERIENCE" color={accentColor}>
            {data.workExperience.map((work) => (
              <div key={work.id} className="mb-2 print:break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold">{work.title}</span>
                  <span className="text-xs text-gray-600">{work.startDate} — {work.current ? "Present" : work.endDate}</span>
                </div>
                <div className="italic text-gray-700">{work.company}{work.location && `, ${work.location}`}</div>
                <ul className="text-xs mt-1 space-y-1 ml-4">
                  {work.responsibilities.filter(r => r.trim()).map((resp, idx) => (
                    <li key={idx} className="list-disc">{resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        ) : null;

      case "volunteering":
        return data.volunteering && data.volunteering.length > 0 ? (
          <Section key="volunteering" title="VOLUNTEERING & EXTRACURRICULARS" color={accentColor}>
            {data.volunteering.map((vol) => (
              <div key={vol.id} className="mb-2 print:break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold">{vol.title}</span>
                  <span className="text-xs text-gray-600">{vol.startDate} — {vol.current ? "Present" : vol.endDate}</span>
                </div>
                <div className="italic text-gray-700">{vol.organization}{vol.location && `, ${vol.location}`}</div>
                <ul className="text-xs mt-1 space-y-1 ml-4">
                  {vol.responsibilities.filter(r => r.trim()).map((resp, idx) => (
                    <li key={idx} className="list-disc">{resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        ) : null;

      case "leadership":
        return data.leadership.length > 0 ? (
          <Section key="leadership" title="LEADERSHIP" color={accentColor}>
            {data.leadership.map((lead) => (
              <div key={lead.id} className="mb-2 print:break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold">{lead.title}</span>
                  <span className="text-xs text-gray-600">{lead.startDate} — {lead.current ? "Present" : lead.endDate}</span>
                </div>
                <div className="italic text-gray-700">{lead.organization}</div>
                <ul className="text-xs mt-1 space-y-1 ml-4">
                  {lead.responsibilities.filter(r => r.trim()).map((resp, idx) => (
                    <li key={idx} className="list-disc">{resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        ) : null;

      case "projects":
        return data.projects.length > 0 ? (
          <Section key="projects" title="PROJECTS & RESEARCH" color={accentColor}>
            {data.projects.map((proj) => (
              <div key={proj.id} className="mb-2 print:break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold">
                    {proj.title}
                    {proj.role && <span className="font-normal text-gray-600"> — {proj.role}</span>}
                  </span>
                  <span className="text-xs text-gray-600">{proj.startDate}{proj.endDate ? ` — ${proj.endDate}` : ""}</span>
                </div>
                {proj.technologies && (
                  <div className="text-xs text-gray-600 italic">Technologies: {proj.technologies}</div>
                )}
                <ul className="text-xs mt-1 space-y-1 ml-4">
                  {proj.description.filter(d => d.trim()).map((desc, idx) => (
                    <li key={idx} className="list-disc">{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        ) : null;

      case "certifications":
        return data.certifications.length > 0 ? (
          <Section key="certifications" title="CERTIFICATIONS" color={accentColor}>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 font-bold">Certification</th>
                  <th className="text-left py-1 font-bold">Issuer</th>
                  <th className="text-left py-1 font-bold">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.certifications.map((cert) => (
                  <tr key={cert.id} className="border-b border-gray-200">
                    <td className="py-1">{cert.name}</td>
                    <td className="py-1">{cert.issuer}</td>
                    <td className="py-1">{cert.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        ) : null;

      case "achievements":
        return data.achievements.length > 0 ? (
          <Section key="achievements" title="AWARDS & ACHIEVEMENTS" color={accentColor}>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 font-bold">Award</th>
                  <th className="text-left py-1 font-bold">Organization</th>
                  <th className="text-left py-1 font-bold">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.achievements.map((ach) => (
                  <tr key={ach.id} className="border-b border-gray-200">
                    <td className="py-1">{ach.title}</td>
                    <td className="py-1">{ach.organization}</td>
                    <td className="py-1">{ach.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        ) : null;

      case "skills":
        return (data.technicalSkills.length > 0 || data.softSkills.length > 0 || (data.skillCategories && data.skillCategories.length > 0)) ? (
          <Section key="skills" title="SKILLS" color={accentColor}>
            <div className="text-xs space-y-1">
              {data.technicalSkills.length > 0 && (
                <p><strong>Technical:</strong> {data.technicalSkills.join(", ")}</p>
              )}
              {data.softSkills.length > 0 && (
                <p><strong>Frameworks:</strong> {data.softSkills.join(", ")}</p>
              )}
              {data.skillCategories && data.skillCategories.map((cat, idx) => (
                <p key={idx}><strong>{cat.name}:</strong> {cat.skills.join(", ")}</p>
              ))}
            </div>
          </Section>
        ) : null;

      case "interests":
        return data.interests.length > 0 ? (
          <Section key="interests" title="INTERESTS" color={accentColor}>
            <p className="text-xs">{data.interests.join(" • ")}</p>
          </Section>
        ) : null;

      case "custom":
      case "customSections":
        return data.customSections?.filter(s => s.title.trim()).map((section) => (
          <Section key={section.id} title={section.title.toUpperCase()} color={accentColor}>
            <ul className="text-xs space-y-1 ml-4">
              {section.bullets.filter(b => b.trim()).map((item, idx) => (
                <li key={idx} className="list-disc">{item}</li>
              ))}
            </ul>
          </Section>
        ));

      case "references":
        return data.references && data.references.length > 0 ? (
          <Section key="references" title="REFEREES" color={accentColor}>
            <div className="space-y-3">
              {data.references.map((ref) => (
                <div key={ref.id} className="text-xs">
                  <div className="font-bold">
                    {ref.title && `${ref.title}, `}{ref.name}
                  </div>
                  {ref.organization && <div className="text-gray-700">{ref.organization},</div>}
                  {ref.phone && <div className="text-gray-600">Phone: {ref.phone}</div>}
                  {ref.email && <div className="text-gray-600">Email: {ref.email}</div>}
                  {ref.relationship && <div className="text-gray-500 italic">{ref.relationship}</div>}
                </div>
              ))}
            </div>
          </Section>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="resume-template p-6 bg-white text-black text-sm" style={{ fontFamily: 'inherit' }}>
      {/* Header - Always first */}
      <div data-pdf-section className="mb-3 text-center border-b-2 pb-2" style={{ borderColor: accentColor }}>
        <h1 className="text-2xl font-bold uppercase tracking-wide mb-1" style={{ color: accentColor }}>
          {data.personalInfo.fullName || "Your Name"}
        </h1>
        {data.personalInfo.jobTitle && (
          <p className="text-base text-gray-700 mb-2">{data.personalInfo.jobTitle}</p>
        )}
        <div className="text-xs text-gray-600 flex flex-wrap justify-center gap-x-2">
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.phone && data.personalInfo.email && <span>|</span>}
          {data.personalInfo.email && (
            <a href={`mailto:${data.personalInfo.email}`} className="text-blue-700 underline">{data.personalInfo.email}</a>
          )}
          {data.personalInfo.email && data.personalInfo.linkedin && <span>|</span>}
          {data.personalInfo.linkedin && (
            <a href={data.personalInfo.linkedin.startsWith('http') ? data.personalInfo.linkedin : `https://${data.personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
              {data.personalInfo.linkedin.replace(/^https?:\/\//, "")}
            </a>
          )}
          {data.personalInfo.portfolio && <span>|</span>}
          {data.personalInfo.portfolio && (
            <a href={data.personalInfo.portfolio.startsWith('http') ? data.personalInfo.portfolio : `https://${data.personalInfo.portfolio}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
              {data.personalInfo.portfolio.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      </div>

      {/* Render sections in order */}
      {sectionOrder.map(sectionKey => renderSection(sectionKey))}

      {/* Empty State */}
      {!hasContent && (
        <div className="text-center text-gray-400 py-8">
          <p className="text-sm">Start filling out the form to see your resume preview</p>
          <p className="text-xs mt-2">Your changes will appear here in real-time</p>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, children, color }) => (
  <section data-pdf-section className="mb-2">
    <h2 className="font-bold text-sm uppercase pb-1 mb-1 border-b-2" style={{ color, borderColor: color }}>
      {title}
    </h2>
    {children}
  </section>
);
