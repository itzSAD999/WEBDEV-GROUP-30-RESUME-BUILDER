import { ResumeData } from "@/types/resume";
import { Card } from "@/components/ui/card";

interface CVPreviewProps {
  data: ResumeData;
}

export const CVPreview = ({ data }: CVPreviewProps) => {
  return (
    <Card className="p-8 bg-white text-black min-h-[1000px] shadow-lg" style={{ fontFamily: 'inherit' }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 uppercase tracking-wide text-center">
          {data.personalInfo.fullName || "YOUR NAME"}
        </h1>
        <div className="text-sm text-gray-700 text-center">
          {[
            data.personalInfo.email && `Email: ${data.personalInfo.email}`,
            data.personalInfo.phone,
            data.personalInfo.linkedin && `LinkedIn: ${data.personalInfo.linkedin}`
          ].filter(Boolean).join(" | ")}
        </div>
      </div>

      {/* Profile */}
      {data.profile && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 uppercase border-b-2 border-black pb-1">
            Profile
          </h2>
          <p className="text-sm leading-relaxed">{data.profile}</p>
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 uppercase border-b-2 border-black pb-1">
            Education
          </h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-base font-bold">{edu.degree}</h3>
                <span className="text-sm text-gray-600">
                  {edu.startDate && edu.endDate && `${edu.startDate} - ${edu.endDate}`}
                </span>
              </div>
              <div className="text-sm text-gray-700 mb-1">
                {edu.institution}, {edu.location}
              </div>
              {edu.coursework && (
                <p className="text-sm text-gray-600 italic">
                  Relevant Coursework: {edu.coursework}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Work Experience */}
      {data.workExperience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 uppercase border-b-2 border-black pb-1">
            Work Experience
          </h2>
          {data.workExperience.map((work) => (
            <div key={work.id} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-base font-bold">{work.title}</h3>
                <span className="text-sm text-gray-600">
                  {work.startDate && (work.current ? `${work.startDate} - Present` : `${work.startDate} - ${work.endDate}`)}
                </span>
              </div>
              <div className="text-sm text-gray-700 mb-2">
                {work.company}, {work.location}
              </div>
              {work.responsibilities.filter(r => r.trim()).length > 0 && (
                <ul className="list-disc list-inside text-sm space-y-1">
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
      {data.achievements.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 uppercase border-b-2 border-black pb-1">
            Achievements/Awards
          </h2>
          <div className="space-y-2">
            {data.achievements.map((ach) => (
              <div key={ach.id} className="flex justify-between text-sm">
                <span className="font-semibold">{ach.title}</span>
                <span className="text-gray-600">{ach.date}</span>
                <span className="text-gray-700">{ach.organization}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 uppercase border-b-2 border-black pb-1">
            Projects/Research Experience
          </h2>
          {data.projects.map((proj) => (
            <div key={proj.id} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-base font-bold">{proj.title}</h3>
                <span className="text-sm text-gray-600">{proj.startDate}{proj.endDate ? ` — ${proj.endDate}` : ""}</span>
              </div>
              {proj.role && (
                <div className="text-sm text-gray-700 italic mb-2">{proj.role}</div>
              )}
              {proj.description.filter(d => d.trim()).length > 0 && (
                <ul className="list-disc list-inside text-sm space-y-1">
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
      {data.certifications.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 uppercase border-b-2 border-black pb-1">
            Professional Training/Certifications
          </h2>
          <div className="space-y-2">
            {data.certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between text-sm">
                <span className="font-semibold">{cert.name}</span>
                <span className="text-gray-600">{cert.date}</span>
                <span className="text-gray-700">{cert.issuer}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Leadership */}
      {data.leadership.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 uppercase border-b-2 border-black pb-1">
            Leadership Experience
          </h2>
          {data.leadership.map((lead) => (
            <div key={lead.id} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-base font-bold">{lead.title}</h3>
                <span className="text-sm text-gray-600">
                  {lead.startDate && (lead.current ? `${lead.startDate} - Present` : `${lead.startDate} - ${lead.endDate}`)}
                </span>
              </div>
              <div className="text-sm text-gray-700 mb-2">{lead.organization}</div>
              {lead.responsibilities.filter(r => r.trim()).length > 0 && (
                <ul className="list-disc list-inside text-sm space-y-1">
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
      {data.technicalSkills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 uppercase border-b-2 border-black pb-1">
            Technical Skills
          </h2>
          <p className="text-sm">{data.technicalSkills.join(", ")}</p>
        </section>
      )}

      {/* Soft Skills */}
      {data.softSkills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 uppercase border-b-2 border-black pb-1">
            Soft Skills
          </h2>
          <p className="text-sm">{data.softSkills.join(", ")}</p>
        </section>
      )}

      {/* Interests */}
      {data.interests.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3 uppercase border-b-2 border-black pb-1">
            Interests
          </h2>
          <p className="text-sm">{data.interests.join(", ")}</p>
        </section>
      )}
    </Card>
  );
};
