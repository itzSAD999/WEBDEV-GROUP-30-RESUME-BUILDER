
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

export const DeedyTemplate = ({ data }) => {
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
          <Section key="profile" title="SUMMARY">
            <p className="text-xs leading-relaxed text-gray-700">{data.profile}</p>
          </Section>
        ) : null;

      case "education":
        return data.education.length > 0 ? (
          <Section key="education" title="EDUCATION">
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-2 print:break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-sm text-gray-800">{edu.institution}{edu.location && `, ${edu.location}`}</span>
                  <span className="text-xs text-gray-500">{edu.startDate} — {edu.endDate}</span>
                </div>
                <div className="text-xs italic text-gray-600">{edu.degree}</div>
                {edu.gpa && <div className="text-xs text-gray-500">GPA: {edu.gpa}</div>}
                {edu.coursework && <div className="text-xs text-gray-500 mt-1">{edu.coursework}</div>}
                {edu.bullets && edu.bullets.filter(b => b.trim()).length > 0 && (
                  <ul className="text-xs text-gray-600 mt-1 ml-3">
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
          <Section key="experience" title="WORK EXPERIENCE">
            {data.workExperience.map((work) => (
              <div key={work.id} className="mb-2 print:break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-sm text-gray-800">{work.title}</span>
                  <span className="text-xs text-gray-500">{work.startDate} — {work.current ? "Present" : work.endDate}</span>
                </div>
                <div className="text-xs italic text-gray-600">{work.company}{work.location && `, ${work.location}`}</div>
                <ul className="text-xs mt-1 space-y-1 text-gray-700 ml-3">
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
          <Section key="volunteering" title="VOLUNTEERING">
            {data.volunteering.map((vol) => (
              <div key={vol.id} className="mb-2 print:break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-sm text-gray-800">{vol.title}</span>
                  <span className="text-xs text-gray-500">{vol.startDate} — {vol.current ? "Present" : vol.endDate}</span>
                </div>
                <div className="text-xs italic text-gray-600">{vol.organization}{vol.location && `, ${vol.location}`}</div>
                <ul className="text-xs mt-1 space-y-1 text-gray-700 ml-3">
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
          <Section key="leadership" title="LEADERSHIP">
            {data.leadership.map((lead) => (
              <div key={lead.id} className="mb-2 print:break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-sm text-gray-800">{lead.title}</span>
                  <span className="text-xs text-gray-500">{lead.startDate} — {lead.current ? "Present" : lead.endDate}</span>
                </div>
                <div className="text-xs italic text-gray-600">{lead.organization}</div>
                <ul className="text-xs mt-1 space-y-1 text-gray-700 ml-3">
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
          <Section key="projects" title="PROJECTS & RESEARCH">
            {data.projects.map((proj) => (
              <div key={proj.id} className="mb-2 print:break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-sm text-gray-800">
                    {proj.title}
                    {proj.role && <span className="font-normal text-gray-500"> — {proj.role}</span>}
                  </span>
                  <span className="text-xs text-gray-500">{proj.startDate}{proj.endDate ? ` — ${proj.endDate}` : ""}</span>
                </div>
                {proj.technologies && (
                  <div className="text-xs text-gray-500 italic">Technologies: {proj.technologies}</div>
                )}
                <ul className="text-xs mt-1 space-y-1 text-gray-700 ml-3">
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
          <Section key="certifications" title="CERTIFICATIONS">
            <table className="w-full text-xs">
              <tbody>
                {data.certifications.map((cert) => (
                  <tr key={cert.id}>
                    <td className="py-0.5 font-bold text-gray-800">{cert.name}</td>
                    <td className="py-0.5 text-gray-600">{cert.issuer}</td>
                    <td className="py-0.5 text-gray-500 text-right">{cert.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        ) : null;

      case "achievements":
        return data.achievements.length > 0 ? (
          <Section key="achievements" title="AWARDS">
            <table className="w-full text-xs">
              <tbody>
                {data.achievements.map((ach) => (
                  <tr key={ach.id}>
                    <td className="py-0.5 font-bold text-gray-800">{ach.title}</td>
                    <td className="py-0.5 text-gray-600">{ach.organization}</td>
                    <td className="py-0.5 text-gray-500 text-right">{ach.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        ) : null;

      case "skills":
        return (data.technicalSkills.length > 0 || data.softSkills.length > 0 || (data.skillCategories && data.skillCategories.length > 0)) ? (
          <Section key="skills" title="SKILLS">
            <div className="text-xs space-y-1 text-gray-700">
              {data.technicalSkills.length > 0 && (
                <p><strong className="text-gray-800">Languages:</strong> {data.technicalSkills.join(", ")}</p>
              )}
              {data.softSkills.length > 0 && (
                <p><strong className="text-gray-800">Frameworks:</strong> {data.softSkills.join(", ")}</p>
              )}
              {data.skillCategories && data.skillCategories.map((cat, idx) => (
                <p key={idx}><strong className="text-gray-800">{cat.name}:</strong> {cat.skills.join(", ")}</p>
              ))}
            </div>
          </Section>
        ) : null;

      case "interests":
        return data.interests.length > 0 ? (
          <Section key="interests" title="INTERESTS">
            <p className="text-xs text-gray-700">{data.interests.join(" • ")}</p>
          </Section>
        ) : null;

      case "custom":
      case "customSections":
        return data.customSections?.filter(s => s.title.trim()).map((section) => (
          <Section key={section.id} title={section.title.toUpperCase()}>
            <ul className="text-xs space-y-1 text-gray-700 ml-3">
              {section.bullets.filter(b => b.trim()).map((item, idx) => (
                <li key={idx} className="list-disc">{item}</li>
              ))}
            </ul>
          </Section>
        ));

      case "references":
        return data.references && data.references.length > 0 ? (
          <Section key="references" title="REFEREES">
            <div className="space-y-3">
              {data.references.map((ref) => (
                <div key={ref.id} className="text-xs print:break-inside-avoid">
                  <div className="font-bold text-gray-800">
                    {ref.title && `${ref.title}, `}{ref.name}
                  </div>
                  {ref.organization && <div className="text-gray-600">{ref.organization},</div>}
                  {ref.phone && <div className="text-gray-500">Phone: {ref.phone}</div>}
                  {ref.email && <div className="text-gray-500">Email: {ref.email}</div>}
                  {ref.relationship && <div className="text-gray-400 italic">{ref.relationship}</div>}
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
    <div className="resume-template p-6 bg-white text-black" style={{ fontFamily: 'inherit' }}>
      {/* Header - Always first */}
      <div data-pdf-section className="mb-3 border-b border-gray-200 pb-2">
        <h1 className="text-3xl font-light tracking-widest mb-1 text-gray-800">
          {data.personalInfo.fullName || "Your Name"}
        </h1>
        {data.personalInfo.jobTitle && (
          <p className="text-sm text-gray-500 tracking-wide mb-2">{data.personalInfo.jobTitle}</p>
        )}
        <div className="text-xs text-gray-500 flex flex-wrap gap-x-2">
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

const Section = ({ title, children }) => (
  <section data-pdf-section className="mb-2">
    <h2 className="font-bold text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-1 mb-1">
      {title}
    </h2>
    {children}
  </section>
);
