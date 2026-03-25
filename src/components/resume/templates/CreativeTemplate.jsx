
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

export const CreativeTemplate = ({ data }) => {
  const accentColor = "#0891B2"; // Cyan

  const hasContent = 
    data.personalInfo.fullName || 
    data.education.length > 0 || 
    data.workExperience.length > 0 ||
    data.projects.length > 0;

  // Use section order from data or default
  const sectionOrder = data.sectionOrder?.length > 0 ? data.sectionOrder : DEFAULT_ORDER;

  // Main column sections (experience-heavy content)
  const mainSections = ["profile", "experience", "workExperience", "projects", "volunteering", "leadership"];
  // Sidebar sections (concise content)
  const sidebarSections = ["education", "skills", "certifications", "achievements", "interests", "custom", "customSections"];

  // Render main column section
  const renderMainSection = (sectionKey) => {
    switch (sectionKey) {
      case "profile":
        return data.profile ? (
          <section key="profile" className="mb-5">
            <h2 className="text-sm font-bold uppercase mb-2 flex items-center gap-2" style={{ color: accentColor }}>
              <span className="w-6 h-0.5" style={{ backgroundColor: accentColor }} />
              About Me
            </h2>
            <p className="text-xs leading-relaxed text-gray-700">{data.profile}</p>
          </section>
        ) : null;

      case "experience":
      case "workExperience":
        return data.workExperience.length > 0 ? (
          <Section key="experience" title="Work Experience" color={accentColor}>
            {data.workExperience.map((work) => (
              <div key={work.id} className="mb-4 pl-3 border-l-2 print:break-inside-avoid" style={{ borderColor: accentColor }}>
                <div className="font-bold text-sm text-gray-800">{work.title}</div>
                <div className="text-xs text-gray-500">{work.company} • {work.startDate} - {work.current ? "Present" : work.endDate}</div>
                <ul className="text-xs mt-1 space-y-0.5 text-gray-700">
                  {work.responsibilities.filter(r => r.trim()).map((resp, idx) => (
                    <li key={idx}>→ {resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        ) : null;

      case "volunteering":
        return data.volunteering && data.volunteering.length > 0 ? (
          <Section key="volunteering" title="Volunteering" color={accentColor}>
            {data.volunteering.map((vol) => (
              <div key={vol.id} className="mb-3 pl-3 border-l-2 print:break-inside-avoid" style={{ borderColor: accentColor }}>
                <div className="font-bold text-sm text-gray-800">{vol.title}</div>
                <div className="text-xs text-gray-500">{vol.organization}{vol.location && ` • ${vol.location}`} • {vol.startDate} - {vol.current ? "Present" : vol.endDate}</div>
                <ul className="text-xs mt-1 text-gray-700">
                  {vol.responsibilities.filter(r => r.trim()).map((resp, idx) => (
                    <li key={idx}>→ {resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        ) : null;

      case "leadership":
        return data.leadership.length > 0 ? (
          <Section key="leadership" title="Leadership" color={accentColor}>
            {data.leadership.map((lead) => (
              <div key={lead.id} className="mb-3 pl-3 border-l-2 print:break-inside-avoid" style={{ borderColor: accentColor }}>
                <div className="font-bold text-sm text-gray-800">{lead.title}</div>
                <div className="text-xs text-gray-500">{lead.organization} • {lead.startDate} - {lead.current ? "Present" : lead.endDate}</div>
                <ul className="text-xs mt-1 text-gray-700">
                  {lead.responsibilities.filter(r => r.trim()).map((resp, idx) => (
                    <li key={idx}>→ {resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        ) : null;

      case "projects":
        return data.projects.length > 0 ? (
          <Section key="projects" title="Projects & Research" color={accentColor}>
            {data.projects.map((proj) => (
              <div key={proj.id} className="mb-3 pl-3 border-l-2 print:break-inside-avoid" style={{ borderColor: accentColor }}>
                <div className="font-bold text-sm text-gray-800">{proj.title}</div>
                {proj.role && <div className="text-xs text-gray-500">{proj.role}</div>}
                {proj.technologies && (
                  <div className="text-xs text-gray-500 italic">Tech: {proj.technologies}</div>
                )}
                <ul className="text-xs mt-1 text-gray-700">
                  {proj.description.filter(d => d.trim()).map((desc, idx) => (
                    <li key={idx}>→ {desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        ) : null;

      case "certifications":
        return data.certifications.length > 0 ? (
          <Section key="certifications" title="Certifications" color={accentColor}>
            {data.certifications.map((cert) => (
              <div key={cert.id} className="text-xs mb-2 pl-3 border-l-2" style={{ borderColor: accentColor }}>
                <span className="font-bold text-gray-800">{cert.name}</span>
                <span className="text-gray-500"> — {cert.issuer} ({cert.date})</span>
              </div>
            ))}
          </Section>
        ) : null;

      case "achievements":
        return data.achievements.length > 0 ? (
          <Section key="achievements" title="Awards" color={accentColor}>
            {data.achievements.map((ach) => (
              <div key={ach.id} className="text-xs mb-2 pl-3 border-l-2" style={{ borderColor: accentColor }}>
                <span className="font-bold text-gray-800">{ach.title}</span>
                <span className="text-gray-500"> — {ach.organization} ({ach.date})</span>
              </div>
            ))}
          </Section>
        ) : null;

      default:
        return null;
    }
  };

  // Render sidebar section
  const renderSidebarSection = (sectionKey) => {
    switch (sectionKey) {
      case "education":
        return data.education.length > 0 ? (
          <Section key="education" title="Education" color={accentColor}>
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-3">
                <div className="font-bold text-xs text-gray-800">{edu.degree}</div>
                <div className="text-xs text-gray-600">{edu.institution}</div>
                <div className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</div>
                {edu.gpa && <div className="text-xs text-gray-500">GPA: {edu.gpa}</div>}
                {edu.bullets && edu.bullets.filter(b => b.trim()).length > 0 && (
                  <ul className="text-xs text-gray-600 mt-1">
                    {edu.bullets.filter(b => b.trim()).map((bullet, idx) => (
                      <li key={idx}>• {bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </Section>
        ) : null;

      case "skills":
        return (data.technicalSkills.length > 0 || data.softSkills.length > 0 || (data.skillCategories && data.skillCategories.length > 0)) ? (
          <>
            {data.technicalSkills.length > 0 && (
              <Section key="skills" title="Skills" color={accentColor}>
                <div className="flex flex-wrap gap-1">
                  {data.technicalSkills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Section>
            )}
            {data.skillCategories && data.skillCategories.length > 0 && (
              <Section key="otherSkills" title="Other Skills" color={accentColor}>
                {data.skillCategories.map((cat, idx) => (
                  <div key={idx} className="mb-2">
                    <div className="text-xs font-bold text-gray-700">{cat.name}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {cat.skills.map((skill, sidx) => (
                        <span 
                          key={sidx} 
                          className="text-xs px-2 py-0.5 rounded-full border"
                          style={{ borderColor: accentColor, color: accentColor }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </Section>
            )}
            {data.softSkills.length > 0 && (
              <Section key="softSkills" title="Soft Skills" color={accentColor}>
                <div className="flex flex-wrap gap-1">
                  {data.softSkills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs px-2 py-0.5 rounded-full border"
                      style={{ borderColor: accentColor, color: accentColor }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Section>
            )}
          </>
        ) : null;

      case "interests":
        return data.interests.length > 0 ? (
          <Section key="interests" title="Interests" color={accentColor}>
            <p className="text-xs text-gray-600">{data.interests.join(" • ")}</p>
          </Section>
        ) : null;

      case "custom":
      case "customSections":
        return data.customSections?.filter(s => s.title.trim()).map((section) => (
          <Section key={section.id} title={section.title} color={accentColor}>
            <ul className="text-xs text-gray-700">
              {section.bullets.filter(b => b.trim()).map((item, idx) => (
                <li key={idx}>→ {item}</li>
              ))}
            </ul>
          </Section>
        ));

      case "references":
        return data.references && data.references.length > 0 ? (
          <Section key="references" title="Referees" color={accentColor}>
            <div className="space-y-3">
              {data.references.map((ref) => (
                <div key={ref.id} className="text-xs pl-3 border-l-2" style={{ borderColor: accentColor }}>
                  <div className="font-bold text-gray-800">
                    {ref.title && `${ref.title}, `}{ref.name}
                  </div>
                  {ref.organization && <div className="text-gray-600">{ref.organization},</div>}
                  {ref.phone && <div className="text-gray-500">Phone: {ref.phone}</div>}
                  {ref.email && <div className="text-gray-500">Email: {ref.email}</div>}
                  {ref.relationship && <div className="text-gray-500 italic text-[10px] mt-1">{ref.relationship}</div>}
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
      {/* Header with accent bar */}
      <div data-pdf-section className="mb-3 pb-2 border-b-4" style={{ borderColor: accentColor }}>
        <h1 className="text-3xl font-bold mb-1" style={{ color: accentColor }}>
          {data.personalInfo.fullName || "Your Name"}
        </h1>
        {data.personalInfo.jobTitle && (
          <p className="text-base text-gray-600 mb-2">{data.personalInfo.jobTitle}</p>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-600">
          {[
            data.personalInfo.email,
            data.personalInfo.phone,
            data.personalInfo.linkedin?.replace(/^https?:\/\//, ""),
            data.personalInfo.portfolio?.replace(/^https?:\/\//, ""),
          ].filter(Boolean).map((item, idx, arr) => (
            <span key={idx}>
              {item}{idx < arr.length - 1 ? " |" : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content - 2 cols */}
        <div className="col-span-2 space-y-5">
          {sectionOrder
            .filter(key => mainSections.includes(key))
            .map(sectionKey => renderMainSection(sectionKey))}
        </div>

        {/* Sidebar - 1 col */}
        <div className="space-y-5">
          {sectionOrder
            .filter(key => sidebarSections.includes(key))
            .map(sectionKey => renderSidebarSection(sectionKey))}
        </div>
      </div>

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
  <section data-pdf-section>
    <h2 className="text-sm font-bold uppercase mb-1 flex items-center gap-2" style={{ color }}>
      <span className="w-4 h-0.5" style={{ backgroundColor: color }} />
      {title}
    </h2>
    {children}
  </section>
);
