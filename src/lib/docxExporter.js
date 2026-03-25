import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, TabStopPosition, TabStopType,
} from "docx";
import { saveAs } from "file-saver";
import { ResumeData } from "@/types/resume";

const FONT = "Times New Roman";
const HEADING_SIZE = 24; // 12pt
const BODY_SIZE = 22;   // 11pt
const SMALL_SIZE = 20;  // 10pt

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: text.toUpperCase(), bold: true, font: FONT, size: HEADING_SIZE })],
    spacing: { before: 200, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999", space: 4 } },
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: BODY_SIZE })],
    bullet: { level: 0 },
    spacing: { after: 40 },
  });
}

function lineRun(parts: { text: string; bold?: boolean; italics?: boolean }[]): Paragraph {
  return new Paragraph({
    children: parts.map(p => new TextRun({ ...p, font: FONT, size: BODY_SIZE })),
    spacing: { after: 40 },
  });
}

export async function generateDocx(data: ResumeData, fileName: string) {
  const sections: Paragraph[] = [];

  // ─── Header ───
  if (data.personalInfo.fullName) {
    sections.push(new Paragraph({
      children: [new TextRun({ text: data.personalInfo.fullName.toUpperCase(), bold: true, font: FONT, size: 32 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
    }));
  }
  if (data.personalInfo.jobTitle) {
    sections.push(new Paragraph({
      children: [new TextRun({ text: data.personalInfo.jobTitle, font: FONT, size: HEADING_SIZE, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
    }));
  }
  const contact: string[] = [];
  if (data.personalInfo.email) contact.push(data.personalInfo.email);
  if (data.personalInfo.phone) contact.push(data.personalInfo.phone);
  if (data.personalInfo.linkedin) contact.push(data.personalInfo.linkedin);
  if (data.personalInfo.portfolio) contact.push(data.personalInfo.portfolio);
  if (contact.length) {
    sections.push(new Paragraph({
      children: [new TextRun({ text: contact.join("  |  "), font: FONT, size: SMALL_SIZE })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }));
  }

  // ─── Profile ───
  if (data.profile) {
    sections.push(sectionHeading("Professional Summary"));
    sections.push(new Paragraph({
      children: [new TextRun({ text: data.profile, font: FONT, size: BODY_SIZE })],
      spacing: { after: 80 },
    }));
  }

  // ─── Education ───
  if (data.education.length > 0) {
    sections.push(sectionHeading("Education"));
    data.education.forEach(edu => {
      sections.push(lineRun([
        { text: edu.institution, bold: true },
        { text: `  |  ${edu.startDate} – ${edu.endDate}`, italics: true },
      ]));
      sections.push(lineRun([{ text: edu.degree }]));
      edu.bullets?.filter(b => b.trim()).forEach(b => sections.push(bullet(b)));
    });
  }

  // ─── Work Experience ───
  if (data.workExperience.length > 0) {
    sections.push(sectionHeading("Experience"));
    data.workExperience.forEach(work => {
      sections.push(lineRun([
        { text: work.title, bold: true },
        { text: `  –  ${work.company}` },
      ]));
      sections.push(lineRun([{ text: `${work.startDate} – ${work.current ? "Present" : work.endDate}`, italics: true }]));
      work.responsibilities.filter(r => r.trim()).forEach(r => sections.push(bullet(r)));
    });
  }

  // ─── Projects ───
  if (data.projects.length > 0) {
    sections.push(sectionHeading("Projects"));
    data.projects.forEach(proj => {
      sections.push(lineRun([
        { text: proj.title, bold: true },
        ...(proj.role ? [{ text: `  –  ${proj.role}`, italics: true }] : []),
      ]));
      if (proj.technologies) sections.push(lineRun([{ text: `Technologies: ${proj.technologies}`, italics: true }]));
      proj.description.filter(d => d.trim()).forEach(d => sections.push(bullet(d)));
    });
  }

  // ─── Skills ───
  if (data.technicalSkills.length > 0 || data.softSkills.length > 0) {
    sections.push(sectionHeading("Skills"));
    if (data.technicalSkills.length) sections.push(lineRun([{ text: "Technical: ", bold: true }, { text: data.technicalSkills.join(", ") }]));
    if (data.softSkills.length) sections.push(lineRun([{ text: "Soft Skills: ", bold: true }, { text: data.softSkills.join(", ") }]));
  }

  // ─── Certifications ───
  if (data.certifications.length > 0) {
    sections.push(sectionHeading("Certifications"));
    data.certifications.forEach(cert => sections.push(lineRun([
      { text: cert.name, bold: true },
      { text: `  |  ${cert.issuer}  |  ${cert.date}` },
    ])));
  }

  // ─── Interests ───
  if (data.interests.length > 0) {
    sections.push(sectionHeading("Interests"));
    sections.push(lineRun([{ text: data.interests.join(", ") }]));
  }

  const doc = new Document({
    sections: [{ properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children: sections }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileName}.docx`);
}
