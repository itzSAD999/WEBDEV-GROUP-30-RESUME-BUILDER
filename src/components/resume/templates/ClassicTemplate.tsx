import { ResumeData } from "@/types/resume";

interface TemplateProps {
  data: ResumeData;
}

const DEFAULT_ORDER = [
  "profile", "education", "experience", "volunteering", "leadership",
  "projects", "certifications", "achievements", "skills", "interests", "custom", "references"
];

export const ClassicTemplate = ({ data }: TemplateProps) => {
  const hasContent =
    data.personalInfo.fullName ||
    data.education.length > 0 ||
    data.workExperience.length > 0 ||
    data.projects.length > 0 ||
    data.technicalSkills.length > 0;

  const sectionOrder = data.sectionOrder?.length > 0 ? data.sectionOrder : DEFAULT_ORDER;

  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case "profile":
        return data.profile ? (
          <Section key="profile" title="PROFILE">
            <p style={{ fontSize: "10pt", lineHeight: "1.4", margin: 0, color: "#333" }}>{data.profile}</p>
          </Section>
        ) : null;

      case "education":
        return data.education.length > 0 ? (
          <Section key="education" title="EDUCATION">
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: "6pt" }} className="education-item">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: "10.5pt" }}>{edu.degree}</span>
                  <span style={{ fontSize: "9pt", color: "#555" }}>{edu.startDate} – {edu.endDate}</span>
                </div>
                <div style={{ fontSize: "10pt", color: "#333" }}>
                  {edu.institution}{edu.location && `, ${edu.location}`}
                </div>
                {edu.gpa && <div style={{ fontSize: "9pt", color: "#555" }}>GPA: {edu.gpa}</div>}
                {edu.coursework && (
                  <div style={{ fontSize: "9pt", color: "#555", marginTop: "2pt" }}>
                    <span style={{ fontStyle: "italic" }}>Relevant Coursework:</span> {edu.coursework}
                  </div>
                )}
                {edu.bullets && edu.bullets.filter(b => b.trim()).length > 0 && (
                  <ul style={{ fontSize: "9.5pt", color: "#333", marginTop: "3pt", marginLeft: "14pt", paddingLeft: 0 }}>
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
              <div key={work.id} style={{ marginBottom: "8pt" }} className="experience-item">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: "10.5pt" }}>{work.title}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: "10pt", color: "#333" }}>
                    {work.company}{work.location && `, ${work.location}`}
                  </span>
                  <span style={{ fontSize: "9pt", color: "#555" }}>{work.startDate} – {work.current ? "Present" : work.endDate}</span>
                </div>
                <ul style={{ fontSize: "9.5pt", marginTop: "3pt", marginLeft: "14pt", paddingLeft: 0, color: "#333" }}>
                  {work.responsibilities.filter(r => r.trim()).map((resp, idx) => (
                    <li key={idx} style={{ marginBottom: "2pt", listStyleType: "disc" }}>{resp}</li>
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
                  <span style={{ fontWeight: 700, fontSize: "10.5pt" }}>{vol.title}</span>
                  <span style={{ fontSize: "9pt", color: "#555" }}>{vol.startDate} – {vol.current ? "Present" : vol.endDate}</span>
                </div>
                <div style={{ fontSize: "10pt", color: "#333" }}>{vol.organization}{vol.location && `, ${vol.location}`}</div>
                <ul style={{ fontSize: "9.5pt", marginTop: "3pt", marginLeft: "14pt", paddingLeft: 0, color: "#333" }}>
                  {vol.responsibilities.filter(r => r.trim()).map((resp, idx) => (
                    <li key={idx} style={{ marginBottom: "2pt", listStyleType: "disc" }}>{resp}</li>
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
              <div key={lead.id} style={{ marginBottom: "6pt" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: "10.5pt" }}>{lead.title}</span>
                  <span style={{ fontSize: "9pt", color: "#555" }}>{lead.startDate} – {lead.current ? "Present" : lead.endDate}</span>
                </div>
                <div style={{ fontSize: "10pt", color: "#333" }}>{lead.organization}</div>
                <ul style={{ fontSize: "9.5pt", marginTop: "3pt", marginLeft: "14pt", paddingLeft: 0, color: "#333" }}>
                  {lead.responsibilities.filter(r => r.trim()).map((resp, idx) => (
                    <li key={idx} style={{ marginBottom: "2pt", listStyleType: "disc" }}>{resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        ) : null;

      case "projects":
        return data.projects.length > 0 ? (
          <Section key="projects" title="PROJECTS/RESEARCH EXPERIENCE">
            {data.projects.map((proj) => (
              <div key={proj.id} style={{ marginBottom: "6pt" }} className="project-item">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: "10.5pt" }}>
                    {proj.title}
                    {proj.role && <span style={{ fontWeight: 400, color: "#555" }}> ({proj.startDate}{proj.endDate ? `–${proj.endDate}` : "–Present"})</span>}
                  </span>
                </div>
                {proj.role && (
                  <div style={{ fontSize: "10pt", color: "#333" }}>Role: {proj.role}</div>
                )}
                {proj.technologies && (
                  <div style={{ fontSize: "9pt", color: "#555", fontStyle: "italic" }}>Technologies: {proj.technologies}</div>
                )}
                <ul style={{ fontSize: "9.5pt", marginTop: "3pt", marginLeft: "14pt", paddingLeft: 0, color: "#333" }}>
                  {proj.description.filter(d => d.trim()).map((desc, idx) => (
                    <li key={idx} style={{ marginBottom: "2pt", listStyleType: "disc" }}>{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        ) : null;

      case "certifications":
        return data.certifications.length > 0 ? (
          <Section key="certifications" title="CERTIFICATIONS">
            <table style={{ fontSize: "9.5pt", width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {data.certifications.map((cert) => (
                  <tr key={cert.id}>
                    <td style={{ fontWeight: 500, paddingRight: "12pt", paddingBottom: "2pt" }}>{cert.name}</td>
                    <td style={{ color: "#555", paddingRight: "12pt", paddingBottom: "2pt" }}>{cert.issuer}</td>
                    <td style={{ color: "#555", textAlign: "right", paddingBottom: "2pt" }}>{cert.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        ) : null;

      case "achievements":
        return data.achievements.length > 0 ? (
          <Section key="achievements" title="ACHIEVEMENTS/AWARDS">
            <table style={{ fontSize: "9.5pt", width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {data.achievements.map((ach) => (
                  <tr key={ach.id}>
                    <td style={{ fontWeight: 500, paddingRight: "12pt", paddingBottom: "2pt" }}>{ach.title}</td>
                    <td style={{ color: "#555", paddingRight: "12pt", paddingBottom: "2pt" }}>{ach.date}</td>
                    <td style={{ color: "#555", textAlign: "right", paddingBottom: "2pt" }}>{ach.organization}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        ) : null;

      case "skills":
        return (data.technicalSkills.length > 0 || data.softSkills.length > 0 || (data.skillCategories && data.skillCategories.length > 0)) ? (
          <Section key="skills" title="SKILLS">
            <div style={{ fontSize: "9.5pt", color: "#333" }}>
              {data.technicalSkills.length > 0 && (
                <p style={{ margin: "0 0 2pt 0" }}><strong>Technical:</strong> {data.technicalSkills.join(", ")}</p>
              )}
              {data.softSkills.length > 0 && (
                <p style={{ margin: "0 0 2pt 0" }}><strong>Soft Skills:</strong> {data.softSkills.join(", ")}</p>
              )}
              {data.skillCategories && data.skillCategories.map((cat, idx) => (
                <p key={idx} style={{ margin: "0 0 2pt 0" }}><strong>{cat.name}:</strong> {cat.skills.join(", ")}</p>
              ))}
            </div>
          </Section>
        ) : null;

      case "interests":
        return data.interests.length > 0 ? (
          <Section key="interests" title="INTERESTS">
            <p style={{ fontSize: "9.5pt", margin: 0, color: "#333" }}>{data.interests.join(", ")}</p>
          </Section>
        ) : null;

      case "custom":
      case "customSections":
        return data.customSections?.filter(s => s.title.trim()).map((section) => (
          <Section key={section.id} title={section.title.toUpperCase()}>
            <ul style={{ fontSize: "9.5pt", marginLeft: "14pt", paddingLeft: 0, color: "#333" }}>
              {section.bullets.filter(b => b.trim()).map((bullet, idx) => (
                <li key={idx} style={{ marginBottom: "2pt", listStyleType: "disc" }}>{bullet}</li>
              ))}
            </ul>
          </Section>
        ));

      case "references":
        return data.references && data.references.length > 0 ? (
          <Section key="references" title="REFERENCES">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10pt" }}>
              {data.references.map((ref) => (
                <div key={ref.id} style={{ fontSize: "9.5pt" }}>
                  <div style={{ fontWeight: 700, color: "#111" }}>
                    {ref.title && `${ref.title} `}{ref.name}
                  </div>
                  {ref.organization && <div style={{ color: "#333" }}>{ref.organization}</div>}
                  {ref.phone && <div style={{ color: "#555" }}>Phone: {ref.phone}</div>}
                  {ref.email && <div style={{ color: "#555" }}>Email: {ref.email}</div>}
                  {ref.relationship && <div style={{ color: "#777", fontStyle: "italic", fontSize: "9pt" }}>{ref.relationship}</div>}
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
        color: "#111",
        padding: "0.5in 0.6in",
        fontSize: "10pt",
        lineHeight: "1.3",
      }}
    >
      {/* Header - no icons, clean text */}
      <div data-pdf-section style={{ textAlign: "center", marginBottom: "6pt" }}>
        <h1 style={{
          fontSize: "16pt",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1pt",
          margin: "0 0 4pt 0",
          color: "#111",
        }}>
          {data.personalInfo.fullName || "Your Name"}
        </h1>

        {data.personalInfo.jobTitle && (
          <div style={{ fontSize: "10pt", color: "#444", marginBottom: "4pt" }}>
            {data.personalInfo.jobTitle}
          </div>
        )}

        {/* Contact line - plain text with pipe separators */}
        <div style={{ fontSize: "9pt", color: "#444" }}>
          {[
            data.personalInfo.email,
            data.personalInfo.phone,
            data.personalInfo.linkedin?.replace(/^https?:\/\//, ""),
            data.personalInfo.portfolio?.replace(/^https?:\/\//, ""),
          ].filter(Boolean).join("  |  ")}
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1.5pt solid #111", margin: "0 0 8pt 0" }} />

      {sectionOrder.map(sectionKey => renderSection(sectionKey))}

      {!hasContent && (
        <div style={{ textAlign: "center", color: "#aaa", padding: "40pt 0" }}>
          <p style={{ fontSize: "11pt" }}>Start filling out the form to see your resume preview</p>
          <p style={{ fontSize: "9pt", marginTop: "6pt" }}>Your changes will appear here in real-time</p>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section data-pdf-section style={{ marginBottom: "6pt" }}>
    <h2 style={{
      fontWeight: 700,
      fontSize: "11pt",
      textTransform: "uppercase",
      borderBottom: "1pt solid #111",
      paddingBottom: "2pt",
      marginBottom: "4pt",
      letterSpacing: "0.5pt",
      color: "#111",
    }}>
      {title}
    </h2>
    {children}
  </section>
);
