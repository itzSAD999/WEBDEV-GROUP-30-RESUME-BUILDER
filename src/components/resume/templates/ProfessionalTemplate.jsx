
const DEFAULT_ORDER = [
  "profile", "education", "experience", "volunteering", "leadership",
  "projects", "certifications", "achievements", "skills", "interests", "custom", "references"
];

export const ProfessionalTemplate = ({ data }) => {
  const hasContent =
    data.personalInfo.fullName ||
    data.education.length > 0 ||
    data.workExperience.length > 0 ||
    data.projects.length > 0 ||
    data.technicalSkills.length > 0;

  const sectionOrder = data.sectionOrder?.length > 0 ? data.sectionOrder : DEFAULT_ORDER;

  const renderSection = (sectionKey) => {
    switch (sectionKey) {
      case "profile":
        return data.profile ? (
          <Section key="profile" title="PROFILE">
            <p style={{ fontSize: "9.5pt", lineHeight: "1.45", margin: 0, color: "#2d2d2d" }}>{data.profile}</p>
          </Section>
        ) : null;

      case "education":
        return data.education.length > 0 ? (
          <Section key="education" title="EDUCATION">
            {data.education.map((edu) => (
              <div key={edu.id} className="education-item" style={{ marginBottom: "6pt" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: "10pt", color: "#1a1a1a" }}>{edu.degree}</span>
                  <span style={{ fontSize: "8.5pt", color: "#666", fontStyle: "italic", whiteSpace: "nowrap", marginLeft: "8pt" }}>{edu.startDate} – {edu.endDate}</span>
                </div>
                <div style={{ fontSize: "9.5pt", color: "#444", marginTop: "1pt" }}>
                  {edu.institution}{edu.location && <span style={{ color: "#777" }}>, {edu.location}</span>}
                </div>
                {edu.gpa && <div style={{ fontSize: "8.5pt", color: "#666", marginTop: "1pt" }}>GPA: {edu.gpa}</div>}
                {edu.coursework && (
                  <div style={{ fontSize: "8.5pt", color: "#555", marginTop: "2pt" }}>
                    <span style={{ fontWeight: 600 }}>Relevant Coursework:</span> {edu.coursework}
                  </div>
                )}
                {edu.bullets && edu.bullets.filter(b => b.trim()).length > 0 && (
                  <ul style={{ fontSize: "9pt", color: "#333", marginTop: "2pt", marginLeft: "12pt", paddingLeft: 0 }}>
                    {edu.bullets.filter(b => b.trim()).map((bullet, idx) => (
                      <li key={idx} style={{ marginBottom: "1pt", listStyleType: "disc" }}>{bullet}</li>
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
              <div key={work.id} className="experience-item" style={{ marginBottom: "8pt" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: "10pt", color: "#1a1a1a" }}>{work.title}</span>
                  <span style={{ fontSize: "8.5pt", color: "#666", fontStyle: "italic", whiteSpace: "nowrap", marginLeft: "8pt" }}>{work.startDate} – {work.current ? "Present" : work.endDate}</span>
                </div>
                <div style={{ fontSize: "9.5pt", color: "#444", marginTop: "1pt" }}>
                  {work.company}{work.location && <span style={{ color: "#777" }}>, {work.location}</span>}
                </div>
                <ul style={{ fontSize: "9pt", marginTop: "3pt", marginLeft: "12pt", paddingLeft: 0, color: "#2d2d2d" }}>
                  {work.responsibilities.filter(r => r.trim()).map((resp, idx) => (
                    <li key={idx} style={{ marginBottom: "1.5pt", listStyleType: "disc", lineHeight: "1.4" }}>{resp}</li>
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
              <div key={vol.id} style={{ marginBottom: "6pt" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: "10pt", color: "#1a1a1a" }}>{vol.title}</span>
                  <span style={{ fontSize: "8.5pt", color: "#666", fontStyle: "italic", whiteSpace: "nowrap", marginLeft: "8pt" }}>{vol.startDate} – {vol.current ? "Present" : vol.endDate}</span>
                </div>
                <div style={{ fontSize: "9.5pt", color: "#444" }}>{vol.organization}{vol.location && `, ${vol.location}`}</div>
                <ul style={{ fontSize: "9pt", marginTop: "2pt", marginLeft: "12pt", paddingLeft: 0, color: "#2d2d2d" }}>
                  {vol.responsibilities.filter(r => r.trim()).map((resp, idx) => (
                    <li key={idx} style={{ marginBottom: "1.5pt", listStyleType: "disc" }}>{resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        ) : null;

      case "leadership":
        return data.leadership.length > 0 ? (
          <Section key="leadership" title="LEADERSHIP EXPERIENCE">
            {data.leadership.map((lead) => (
              <div key={lead.id} style={{ marginBottom: "6pt" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: "10pt", color: "#1a1a1a" }}>{lead.title}</span>
                  <span style={{ fontSize: "8.5pt", color: "#666", fontStyle: "italic", whiteSpace: "nowrap", marginLeft: "8pt" }}>{lead.startDate} – {lead.current ? "Present" : lead.endDate}</span>
                </div>
                <div style={{ fontSize: "9.5pt", color: "#444" }}>{lead.organization}</div>
                <ul style={{ fontSize: "9pt", marginTop: "2pt", marginLeft: "12pt", paddingLeft: 0, color: "#2d2d2d" }}>
                  {lead.responsibilities.filter(r => r.trim()).map((resp, idx) => (
                    <li key={idx} style={{ marginBottom: "1.5pt", listStyleType: "disc" }}>{resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        ) : null;

      case "projects":
        return data.projects.length > 0 ? (
          <Section key="projects" title="PROJECTS / RESEARCH EXPERIENCE">
            {data.projects.map((proj) => (
              <div key={proj.id} className="project-item" style={{ marginBottom: "6pt" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: "10pt", color: "#1a1a1a" }}>{proj.title}</span>
                  {(proj.startDate || proj.endDate) && (
                    <span style={{ fontSize: "8.5pt", color: "#666", fontStyle: "italic", whiteSpace: "nowrap", marginLeft: "8pt" }}>
                      {proj.startDate}{proj.endDate ? ` – ${proj.endDate}` : " – Present"}
                    </span>
                  )}
                </div>
                {proj.role && <div style={{ fontSize: "9pt", color: "#555" }}>Role: {proj.role}</div>}
                {proj.technologies && <div style={{ fontSize: "8.5pt", color: "#666", fontStyle: "italic" }}>Technologies: {proj.technologies}</div>}
                <ul style={{ fontSize: "9pt", marginTop: "2pt", marginLeft: "12pt", paddingLeft: 0, color: "#2d2d2d" }}>
                  {proj.description.filter(d => d.trim()).map((desc, idx) => (
                    <li key={idx} style={{ marginBottom: "1.5pt", listStyleType: "disc" }}>{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        ) : null;

      case "certifications":
        return data.certifications.length > 0 ? (
          <Section key="certifications" title="CERTIFICATIONS">
            {data.certifications.map((cert) => (
              <div key={cert.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "9.5pt", marginBottom: "2pt" }}>
                <span><span style={{ fontWeight: 600 }}>{cert.name}</span>{cert.issuer && <span style={{ color: "#555" }}> — {cert.issuer}</span>}</span>
                <span style={{ color: "#666", fontSize: "8.5pt", fontStyle: "italic", whiteSpace: "nowrap", marginLeft: "8pt" }}>{cert.date}</span>
              </div>
            ))}
          </Section>
        ) : null;

      case "achievements":
        return data.achievements.length > 0 ? (
          <Section key="achievements" title="ACHIEVEMENTS / AWARDS">
            {data.achievements.map((ach) => (
              <div key={ach.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "9.5pt", marginBottom: "2pt" }}>
                <span><span style={{ fontWeight: 600 }}>{ach.title}</span>{ach.organization && <span style={{ color: "#555" }}> — {ach.organization}</span>}</span>
                <span style={{ color: "#666", fontSize: "8.5pt", fontStyle: "italic", whiteSpace: "nowrap", marginLeft: "8pt" }}>{ach.date}</span>
              </div>
            ))}
          </Section>
        ) : null;

      case "skills":
        return (data.technicalSkills.length > 0 || data.softSkills.length > 0 || (data.skillCategories && data.skillCategories.length > 0)) ? (
          <Section key="skills" title="SKILLS">
            <div style={{ fontSize: "9pt", color: "#2d2d2d", lineHeight: "1.5" }}>
              {data.technicalSkills.length > 0 && (
                <p style={{ margin: "0 0 2pt 0" }}><span style={{ fontWeight: 600 }}>Technical:</span> {data.technicalSkills.join(", ")}</p>
              )}
              {data.softSkills.length > 0 && (
                <p style={{ margin: "0 0 2pt 0" }}><span style={{ fontWeight: 600 }}>Soft Skills:</span> {data.softSkills.join(", ")}</p>
              )}
              {data.skillCategories && data.skillCategories.map((cat, idx) => (
                <p key={idx} style={{ margin: "0 0 2pt 0" }}><span style={{ fontWeight: 600 }}>{cat.name}:</span> {cat.skills.join(", ")}</p>
              ))}
            </div>
          </Section>
        ) : null;

      case "interests":
        return data.interests.length > 0 ? (
          <Section key="interests" title="INTERESTS">
            <p style={{ fontSize: "9pt", margin: 0, color: "#2d2d2d" }}>{data.interests.join(", ")}</p>
          </Section>
        ) : null;

      case "custom":
      case "customSections":
        return data.customSections?.filter(s => s.title.trim()).map((section) => (
          <Section key={section.id} title={section.title.toUpperCase()}>
            <ul style={{ fontSize: "9pt", marginLeft: "12pt", paddingLeft: 0, color: "#2d2d2d" }}>
              {section.bullets.filter(b => b.trim()).map((bullet, idx) => (
                <li key={idx} style={{ marginBottom: "1.5pt", listStyleType: "disc" }}>{bullet}</li>
              ))}
            </ul>
          </Section>
        ));

      case "references":
        return data.references && data.references.length > 0 ? (
          <Section key="references" title="REFERENCES">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8pt" }}>
              {data.references.map((ref) => (
                <div key={ref.id} style={{ fontSize: "9pt", padding: "4pt 0" }}>
                  <div style={{ fontWeight: 700, fontSize: "9.5pt", color: "#1a1a1a" }}>
                    {ref.title && `${ref.title} `}{ref.name}
                  </div>
                  {ref.organization && <div style={{ color: "#444" }}>{ref.organization}</div>}
                  {ref.phone && <div style={{ color: "#555" }}>Phone: {ref.phone}</div>}
                  {ref.email && <div style={{ color: "#555" }}>Email: {ref.email}</div>}
                  {ref.relationship && <div style={{ color: "#888", fontStyle: "italic", fontSize: "8.5pt", marginTop: "1pt" }}>{ref.relationship}</div>}
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
    <div
      className="resume-template"
      style={{
        fontFamily: "inherit",
        backgroundColor: "#fff",
        color: "#1a1a1a",
        padding: "0.5in 0.6in",
        fontSize: "9.5pt",
        lineHeight: "1.35",
      }}
    >
      {/* Header - clean text, no SVG icons */}
      <div data-pdf-section style={{ textAlign: "center", marginBottom: "6pt", borderBottom: "2pt solid #2c3e50", paddingBottom: "6pt" }}>
        <h1 style={{
          fontSize: "18pt",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "2pt",
          margin: "0 0 2pt 0",
          color: "#1a1a1a",
        }}>
          {data.personalInfo.fullName || "Your Name"}
        </h1>

        {data.personalInfo.jobTitle && (
          <div style={{ fontSize: "10pt", color: "#555", fontStyle: "italic", marginBottom: "4pt" }}>
            {data.personalInfo.jobTitle}
          </div>
        )}

        {/* Contact row - plain text */}
        <div style={{ fontSize: "8.5pt", color: "#444" }}>
          {[
            data.personalInfo.email,
            data.personalInfo.phone,
            data.personalInfo.linkedin?.replace(/^https?:\/\//, ""),
            data.personalInfo.portfolio?.replace(/^https?:\/\//, ""),
          ].filter(Boolean).join("  •  ")}
        </div>
      </div>

      {sectionOrder.map(sectionKey => renderSection(sectionKey))}

      {!hasContent && (
        <div style={{ textAlign: "center", color: "#bbb", padding: "40pt 0" }}>
          <p style={{ fontSize: "11pt" }}>Start filling out the form to see your resume preview</p>
          <p style={{ fontSize: "9pt", marginTop: "6pt" }}>Your changes will appear here in real-time</p>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, children }) => (
  <section data-pdf-section style={{ marginBottom: "6pt" }}>
    <h2 style={{
      fontWeight: 700,
      fontSize: "10.5pt",
      textTransform: "uppercase",
      letterSpacing: "1pt",
      color: "#2c3e50",
      borderBottom: "0.75pt solid #bdc3c7",
      paddingBottom: "2pt",
      marginBottom: "4pt",
    }}>
      {title}
    </h2>
    {children}
  </section>
);
