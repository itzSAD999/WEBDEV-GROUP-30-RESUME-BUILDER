const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  .cv-preview-card {
    background: #ffffff; color: #000000; min-height: 1000px;
    padding: 32px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    font-family: inherit; line-height: 1.5; text-align: left;
  }

  .cv-header { margin-bottom: 24px; text-align: center; }
  .cv-name { font-size: 24px; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.2; }
  .cv-contact { font-size: 14px; color: #374151; }

  .cv-section { margin-bottom: 24px; }
  .cv-section-title {
    font-size: 20px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase;
    border-bottom: 2px solid #000000; padding-bottom: 4px; line-height: 1.2;
  }
  .cv-section-content { font-size: 14px; line-height: 1.6; }

  .cv-item { margin-bottom: 16px; }
  .cv-item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
  .cv-item-title { font-size: 16px; font-weight: 700; line-height: 1.3; }
  .cv-item-date { font-size: 14px; color: #4b5563; flex-shrink: 0; }
  .cv-item-subtitle { font-size: 14px; color: #374151; margin-bottom: 4px; }
  .cv-item-role { font-size: 14px; color: #374151; font-style: italic; margin-bottom: 8px; }

  .cv-list { list-style-type: disc; list-style-position: inside; font-size: 14px; padding-left: 0; margin-top: 4px; }
  .cv-list li { margin-bottom: 4px; }

  .cv-flex-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
  .cv-flex-col1 { font-weight: 600; }
  .cv-flex-col2 { color: #4b5563; }
  .cv-flex-col3 { color: #374151; }
\`;

export const CVPreview = ({ data }) => {
  return (
    <>
      <style>{styles}</style>
      <div className="cv-preview-card">
        {/* Header */}
        <div className="cv-header">
          <h1 className="cv-name">
            {data.personalInfo?.fullName || "YOUR NAME"}
          </h1>
          <div className="cv-contact">
            {[
              data.personalInfo?.email && \`Email: \${data.personalInfo.email}\`,
              data.personalInfo?.phone,
              data.personalInfo?.linkedin && \`LinkedIn: \${data.personalInfo.linkedin}\`
            ].filter(Boolean).join(" | ")}
          </div>
        </div>

        {/* Profile */}
        {data.profile && (
          <section className="cv-section">
            <h2 className="cv-section-title">Profile</h2>
            <p className="cv-section-content">{data.profile}</p>
          </section>
        )}

        {/* Education */}
        {data.education?.length > 0 && (
          <section className="cv-section">
            <h2 className="cv-section-title">Education</h2>
            {data.education.map((edu) => (
              <div key={edu.id} className="cv-item">
                <div className="cv-item-header">
                  <h3 className="cv-item-title">{edu.degree}</h3>
                  <span className="cv-item-date">
                    {edu.startDate && edu.endDate && \`\${edu.startDate} - \${edu.endDate}\`}
                  </span>
                </div>
                <div className="cv-item-subtitle">
                  {edu.institution}, {edu.location}
                </div>
                {edu.coursework && (
                  <p className="cv-item-role">
                    Relevant Coursework: {edu.coursework}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Work Experience */}
        {data.workExperience?.length > 0 && (
          <section className="cv-section">
            <h2 className="cv-section-title">Work Experience</h2>
            {data.workExperience.map((work) => (
              <div key={work.id} className="cv-item">
                <div className="cv-item-header">
                  <h3 className="cv-item-title">{work.title}</h3>
                  <span className="cv-item-date">
                    {work.startDate && (work.current ? \`\${work.startDate} - Present\` : \`\${work.startDate} - \${work.endDate}\`)}
                  </span>
                </div>
                <div className="cv-item-subtitle">
                  {work.company}, {work.location}
                </div>
                {work.responsibilities?.filter(r => r.trim()).length > 0 && (
                  <ul className="cv-list">
                    {work.responsibilities.filter(r => r.trim()).map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Achievements */}
        {data.achievements?.length > 0 && (
          <section className="cv-section">
            <h2 className="cv-section-title">Achievements/Awards</h2>
            <div>
              {data.achievements.map((ach) => (
                <div key={ach.id} className="cv-flex-row">
                  <span className="cv-flex-col1">{ach.title}</span>
                  <span className="cv-flex-col2">{ach.date}</span>
                  <span className="cv-flex-col3">{ach.organization}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects?.length > 0 && (
          <section className="cv-section">
            <h2 className="cv-section-title">Projects/Research Experience</h2>
            {data.projects.map((proj) => (
              <div key={proj.id} className="cv-item">
                <div className="cv-item-header">
                  <h3 className="cv-item-title">{proj.title}</h3>
                  <span className="cv-item-date">{proj.startDate}{proj.endDate ? \` — \${proj.endDate}\` : ""}</span>
                </div>
                {proj.role && (
                  <div className="cv-item-role">{proj.role}</div>
                )}
                {proj.description?.filter(d => d.trim()).length > 0 && (
                  <ul className="cv-list">
                    {proj.description.filter(d => d.trim()).map((desc, idx) => (
                      <li key={idx}>{desc}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Certifications */}
        {data.certifications?.length > 0 && (
          <section className="cv-section">
            <h2 className="cv-section-title">Professional Training/Certifications</h2>
            <div>
              {data.certifications.map((cert) => (
                <div key={cert.id} className="cv-flex-row">
                  <span className="cv-flex-col1">{cert.name}</span>
                  <span className="cv-flex-col2">{cert.date}</span>
                  <span className="cv-flex-col3">{cert.issuer}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Leadership */}
        {data.leadership?.length > 0 && (
          <section className="cv-section">
            <h2 className="cv-section-title">Leadership Experience</h2>
            {data.leadership.map((lead) => (
              <div key={lead.id} className="cv-item">
                <div className="cv-item-header">
                  <h3 className="cv-item-title">{lead.title}</h3>
                  <span className="cv-item-date">
                    {lead.startDate && (lead.current ? \`\${lead.startDate} - Present\` : \`\${lead.startDate} - \${lead.endDate}\`)}
                  </span>
                </div>
                <div className="cv-item-subtitle">{lead.organization}</div>
                {lead.responsibilities?.filter(r => r.trim()).length > 0 && (
                  <ul className="cv-list">
                    {lead.responsibilities.filter(r => r.trim()).map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Technical Skills */}
        {data.technicalSkills?.length > 0 && (
          <section className="cv-section">
            <h2 className="cv-section-title">Technical Skills</h2>
            <p className="cv-section-content">{data.technicalSkills.join(", ")}</p>
          </section>
        )}

        {/* Soft Skills */}
        {data.softSkills?.length > 0 && (
          <section className="cv-section">
            <h2 className="cv-section-title">Soft Skills</h2>
            <p className="cv-section-content">{data.softSkills.join(", ")}</p>
          </section>
        )}

        {/* Interests */}
        {data.interests?.length > 0 && (
          <section className="cv-section">
            <h2 className="cv-section-title">Interests</h2>
            <p className="cv-section-content">{data.interests.join(", ")}</p>
          </section>
        )}
      </div>
    </>
  );
};
