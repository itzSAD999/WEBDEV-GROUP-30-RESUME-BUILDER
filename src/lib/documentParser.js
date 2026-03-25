// Document parsing utilities for extracting text from PDF, DOCX, and TXT files
// Implements LinkedIn-style intelligent extraction per PRD specifications
// Handles sparse data, multi-column layouts, and non-standard section headings

export interface ExtractedResumeData {
  fullText: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    portfolio: string;
    address: string;
    jobTitle: string;
    country: string;
  };
  profile: string;
  education: {
    id: string;
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa: string;
    coursework?: string;
    bullets: string[];
  }[];
  scholarships: {
    id: string;
    name: string;
    organization: string;
    date: string;
  }[];
  workExperience: {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    responsibilities: string[];
  }[];
  leadershipExperience: {
    id: string;
    title: string;
    organization: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    responsibilities: string[];
  }[];
  advocacyAndAmbassadorships: {
    id: string;
    title: string;
    organization: string;
    date: string;
    description: string;
  }[];
  awardsAndRecognition: {
    id: string;
    title: string;
    organization: string;
    date: string;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    date: string;
  }[];
  skills: string[];
  interests: string[];
  languages: {
    language: string;
    proficiency: string;
  }[];
  projects: {
    id: string;
    name: string;
    description: string;
    technologies: string;
    link: string;
    bullets: string[];
    role: string;
    startDate: string;
    endDate: string;
  }[];
  volunteering: {
    id: string;
    role: string;
    organization: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    bullets: string[];
  }[];
  references: {
    id: string;
    name: string;
    title: string;
    organization: string;
    email: string;
    phone: string;
    relationship: string;
  }[];
}

// ─── File Extraction ─────────────────────────────────────────────

async function loadPdfJs(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js library'));
    document.head.appendChild(script);
  });
}

/**
 * CRITICAL FIX: Extract text from PDF preserving line structure.
 * PDF.js text items have transform positions — we use Y-coordinate changes
 * to insert newlines, preserving the document's visual line structure.
 */
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageTexts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const items = textContent.items as any[];

      if (items.length === 0) continue;

      // Sort items by Y position (descending = top to bottom), then X (left to right)
      const sorted = [...items].filter(item => item.str && item.str.trim().length > 0);

      // Group items into lines based on Y-coordinate proximity
      const lines: { y: number; items: any[] }[] = [];
      const Y_THRESHOLD = 3; // pixels threshold to consider same line

      for (const item of sorted) {
        const y = item.transform ? item.transform[5] : 0;
        const existingLine = lines.find(l => Math.abs(l.y - y) < Y_THRESHOLD);
        if (existingLine) {
          existingLine.items.push(item);
        } else {
          lines.push({ y, items: [item] });
        }
      }

      // Sort lines top-to-bottom (higher Y = higher on page in PDF coords)
      lines.sort((a, b) => b.y - a.y);

      // Sort items within each line left-to-right by X coordinate
      for (const line of lines) {
        line.items.sort((a: any, b: any) => {
          const ax = a.transform ? a.transform[4] : 0;
          const bx = b.transform ? b.transform[4] : 0;
          return ax - bx;
        });
      }

      // Build text with proper line breaks
      const pageLines: string[] = [];
      for (const line of lines) {
        let lineText = '';
        let prevEnd = 0;
        for (const item of line.items) {
          const x = item.transform ? item.transform[4] : 0;
          // Add space if there's a gap between items
          if (lineText && x - prevEnd > 5) {
            lineText += ' ';
          }
          lineText += item.str;
          prevEnd = x + (item.width || item.str.length * 5);
        }
        const trimmed = lineText.trim();
        if (trimmed) pageLines.push(trimmed);
      }

      pageTexts.push(pageLines.join('\n'));
    }

    return pageTexts.join('\n\n');
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF. Please try a different file or paste content manually.');
  }
}

async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const JSZip = (await import('jszip')).default;
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const documentXml = await zip.file('word/document.xml')?.async('text');
    if (!documentXml) throw new Error('Could not find document content');
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(documentXml, 'text/xml');
    
    // Extract text paragraph by paragraph
    const paragraphs = xmlDoc.getElementsByTagName('w:p');
    const lines: string[] = [];
    
    for (let i = 0; i < paragraphs.length; i++) {
      const textNodes = paragraphs[i].getElementsByTagName('w:t');
      let paragraphText = '';
      for (let j = 0; j < textNodes.length; j++) {
        paragraphText += textNodes[j].textContent || '';
      }
      lines.push(paragraphText);
    }
    
    return lines.join('\n');
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX. Please try a different file or paste content manually.');
  }
}

async function extractTextFromTXT(file: File): Promise<string> {
  return await file.text();
}

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return await extractTextFromPDF(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return await extractTextFromDOCX(file);
  } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await extractTextFromTXT(file);
  }
  
  throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
}

// ─── Utility Helpers ─────────────────────────────────────────────

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const MONTH_NAMES = /(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i;

// Extract date range from a line of text
function extractDateRange(text: string): { startDate: string; endDate: string; current: boolean } {
  const patterns = [
    // "August 2025 - present", "September,2024-present", "Jan 2020 – Dec 2022"
    new RegExp(`(${MONTH_NAMES.source}[s,]*d{4})s*[-–—to]+s*((?:expecteds+)?${MONTH_NAMES.source}[s,]*d{4}|present|current|now|ongoing)`, 'i'),
    // "2024-Expected September, 2027"
    /(\d{4})\s*[-–—to]+\s*((?:expected\s+)?\w+\s*,?\s*\d{4}|present|current|now|ongoing|\d{4})/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        startDate: match[1].trim().replace(/,\s*$/, ''),
        endDate: match[2].trim().replace(/,\s*$/, ''),
        current: /present|current|now|ongoing/i.test(match[2])
      };
    }
  }
  return { startDate: '', endDate: '', current: false };
}

function extractSingleDate(text: string): string {
  const patterns = [
    new RegExp(`b(${MONTH_NAMES.source}s*,?s*d{4})b`, 'i'),
    /\b(20\d{2}|19\d{2})\b/
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1];
  }
  return '';
}

// Strip date range from a string to get the clean title
function stripDateRange(text: string): string {
  return text
    .replace(new RegExp(`s*(${MONTH_NAMES.source}[s,]*d{4}|d{4})s*[-–—to]+s*((?:expecteds+)?${MONTH_NAMES.source}[s,]*d{4}|d{4}|present|current|now|ongoing)s*`, 'gi'), '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ─── Section Detection ──────────────────────────────────────────

const SECTION_PATTERNS: [RegExp, string][] = [
  [/^(?:#\s*)?(?:profile|professional\s*summary|summary|career\s*(?:summary|objective|profile)|objective|about\s*me|personal\s*(?:statement|profile))\s*$/i, 'profile'],
  [/^(?:#\s*)?(?:education(?:al)?(?:\s*background)?|academic\s*(?:background|qualifications|history))\s*$/i, 'education'],
  [/^(?:#\s*)?(?:work\s*experience|professional\s*experience|experience|employment(?:\s*history)?|career\s*history|work\s*history)\s*$/i, 'experience'],
  [/^(?:#\s*)?(?:leadership\s*(?:experience|roles?)?|leadership\s*(?:&|and)\s*(?:activities|involvement))\s*$/i, 'leadership'],
  [/^(?:#\s*)?(?:projects?(?:\s*(?:&|and)\s*research)?(?:\s*experience)?|research(?:\s*experience)?)\s*$/i, 'projects'],
  [/^(?:#\s*)?(?:volunteer(?:ing)?(?:\s*(?:&|and)\s*(?:extracurricular|community))?|community\s*service|extracurricular(?:s)?(?:\s*activities)?)\s*$/i, 'volunteering'],
  [/^(?:#\s*)?(?:awards?(?:\s*(?:&|and)\s*(?:achievements?|recognition|honours?))?|achievements?(?:\/awards?)?|honors?(?:\s*(?:&|and)\s*awards?)?|recognition)\s*$/i, 'awards'],
  [/^(?:#\s*)?(?:certifications?|certificates?|professional\s*(?:development|training)(?:\s*\/?\s*certifications?)?|training(?:\s*(?:&|and)\s*certifications?)?|credentials?)\s*$/i, 'certifications'],
  [/^(?:#\s*)?(?:(?:technical\s*)?skills?(?:\s*(?:&|and)?\s*(?:abilities|competencies))?|core\s*competencies|competencies|technologies|technical\s*proficiency)\s*$/i, 'skills'],
  [/^(?:#\s*)?(?:interests?|hobbies?(?:\s*(?:&|and)\s*interests?)?)\s*$/i, 'interests'],
  [/^(?:#\s*)?(?:languages?(?:\s*(?:skills?|proficiency))?)\s*$/i, 'languages'],
  [/^(?:#\s*)?(?:references?|referees?)\s*$/i, 'references'],
  [/^(?:#\s*)?(?:scholarships?|fellowships?|grants?)\s*$/i, 'scholarships'],
  [/^(?:#\s*)?(?:advocacy|ambassadorships?)\s*$/i, 'advocacy'],
];

function detectSectionHeader(line: string): string | null {
  const trimmed = line.trim().replace(/[:\-–—]+$/, '').trim();
  if (!trimmed || trimmed.length > 60) return null;

  for (const [pattern, name] of SECTION_PATTERNS) {
    if (pattern.test(trimmed)) return name;
  }

  // ALL-CAPS headings (common in resumes): short, letters/spaces/& only
  if (trimmed.length >= 3 && trimmed.length <= 50 && trimmed === trimmed.toUpperCase() && /^[A-Z\s&\/,]+$/.test(trimmed)) {
    const lower = trimmed.toLowerCase();
    if (lower.includes('education')) return 'education';
    if (lower.includes('experience') && lower.includes('work')) return 'experience';
    if (lower.includes('experience') && lower.includes('leadership')) return 'leadership';
    if (lower.includes('leadership')) return 'leadership';
    if (lower.includes('experience') && !lower.includes('leader')) return 'experience';
    if (lower.includes('project')) return 'projects';
    if (lower.includes('skill') || lower.includes('competenc') || lower.includes('technolog')) return 'skills';
    if (lower.includes('certif') || lower.includes('training')) return 'certifications';
    if (lower.includes('award') || lower.includes('achiev') || lower.includes('honor') || lower.includes('honour')) return 'awards';
    if (lower.includes('volunteer') || lower.includes('extracurricular') || lower.includes('community')) return 'volunteering';
    if (lower.includes('interest') || lower.includes('hobb')) return 'interests';
    if (lower.includes('language')) return 'languages';
    if (lower.includes('reference') || lower.includes('referee')) return 'references';
    if (lower.includes('profile') || lower.includes('summary') || lower.includes('objective') || lower.includes('about')) return 'profile';
    if (lower.includes('scholarship') || lower.includes('fellowship')) return 'scholarships';
  }

  // Title-case headings (e.g., "Work Experience", "Technical Skills")
  if (trimmed.length >= 5 && trimmed.length <= 40 && !trimmed.includes('@') && !/\d{3}/.test(trimmed)) {
    const words = trimmed.split(/\s+/);
    const allTitleCase = words.every(w => /^[A-Z]/.test(w) && w.length >= 2);
    if (allTitleCase && words.length <= 4) {
      const lower = trimmed.toLowerCase();
      if (lower.includes('education')) return 'education';
      if (lower.includes('experience') && !lower.includes('leader')) return 'experience';
      if (lower.includes('leadership')) return 'leadership';
      if (lower.includes('skill')) return 'skills';
      if (lower.includes('project')) return 'projects';
      if (lower.includes('reference') || lower.includes('referee')) return 'references';
      if (lower.includes('certif')) return 'certifications';
      if (lower.includes('award') || lower.includes('achiev')) return 'awards';
      if (lower.includes('volunteer')) return 'volunteering';
      if (lower.includes('summary') || lower.includes('profile') || lower.includes('objective')) return 'profile';
    }
  }

  return null;
}

// ─── Structured Section Extraction ──────────────────────────────

interface SectionBlock {
  name: string;
  startLine: number;
  endLine: number;
  lines: string[];
}

function extractSectionBlocks(allLines: string[]): SectionBlock[] {
  const blocks: SectionBlock[] = [];
  let currentSection: { name: string; startLine: number } | null = null;
  
  for (let i = 0; i < allLines.length; i++) {
    const sectionName = detectSectionHeader(allLines[i]);
    if (sectionName) {
      if (currentSection) {
        blocks.push({
          name: currentSection.name,
          startLine: currentSection.startLine,
          endLine: i,
          lines: allLines.slice(currentSection.startLine, i).filter(l => l.trim())
        });
      }
      currentSection = { name: sectionName, startLine: i + 1 };
    }
  }
  
  if (currentSection) {
    blocks.push({
      name: currentSection.name,
      startLine: currentSection.startLine,
      endLine: allLines.length,
      lines: allLines.slice(currentSection.startLine).filter(l => l.trim())
    });
  }
  
  return blocks;
}

// ─── Section Parsers ─────────────────────────────────────────────

function isBullet(line: string): boolean {
  return /^[•\-*▪◦○●→⁃▸]\s/.test(line.trim()) || /^\d+[.)]\s/.test(line.trim());
}

function cleanBullet(line: string): string {
  return line.replace(/^[•\-*▪◦○●→⁃▸]\s*/, '').replace(/^\d+[.)]\s*/, '').trim();
}

/**
 * IMPROVED: Determine if a line is a role/title header for experience sections.
 * Uses a scoring system instead of simple boolean to avoid false positives.
 */
function isRoleLine(line: string): boolean {
  const trimmed = line.trim();
  if (isBullet(trimmed)) return false;
  if (trimmed.length > 200 || trimmed.length < 3) return false;

  let score = 0;

  // Date range presence is a strong signal
  if (extractDateRange(trimmed).startDate !== '') score += 3;

  // Title keywords
  const titleKeywords = /\b(?:coordinator|administrator|director|manager|engineer|developer|designer|analyst|lead|head|deputy|founder|intern|assistant|volunteer|president|ambassador|mentor|teacher|lecturer|professor|officer|specialist|consultant|executive|associate|supervisor|ceo|cto|cfo|chairman|secretary|treasurer|representative)\b/i;
  if (titleKeywords.test(trimmed)) score += 2;

  // Separator patterns: "Title - Org" or "Title at Org" or "Title, Org"
  if (/\s+[-–—]\s+/.test(trimmed) || /\s+at\s+/i.test(trimmed)) score += 1;

  // Lines that are just organization names shouldn't match
  if (/^(?:university|college|school|institute)/i.test(trimmed)) return false;

  return score >= 2;
}

/**
 * IMPROVED: Parse role line with smarter separator handling.
 * Handles: "Title, Org, Location", "Title - Org, Location", "Title at Org"
 */
function parseRoleLine(line: string): { title: string; organization: string; location: string; startDate: string; endDate: string; current: boolean } {
  const dateRange = extractDateRange(line);
  let clean = stripDateRange(line);
  
  let title = clean;
  let organization = '';
  let location = '';

  // Try " at " separator: "Software Engineer at Google"
  const atMatch = clean.match(/^(.+?)\s+at\s+(.+)$/i);
  if (atMatch) {
    title = atMatch[1].trim();
    const rest = atMatch[2].trim();
    const commaParts = rest.split(',');
    organization = commaParts[0].trim();
    if (commaParts.length > 1) location = commaParts.slice(1).join(',').trim();
    return { title, organization, location, ...dateRange };
  }

  // Try " - " separator (with spaces around dash): "Country Coordinator - RenaiAfrica, Ghana"
  const dashMatch = clean.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  if (dashMatch) {
    title = dashMatch[1].trim();
    const rest = dashMatch[2].trim();
    const commaParts = rest.split(',');
    organization = commaParts[0].trim();
    if (commaParts.length > 1) location = commaParts.slice(1).join(',').trim();
    return { title, organization, location, ...dateRange };
  }

  // Try comma separator: "Software Engineer, Google, San Francisco"
  const commaParts = clean.split(',').map(p => p.trim());
  if (commaParts.length >= 2) {
    title = commaParts[0];
    organization = commaParts[1];
    if (commaParts.length > 2) location = commaParts.slice(2).join(', ');
    return { title, organization, location, ...dateRange };
  }
  
  return { title, organization, location, ...dateRange };
}

// ─── Experience-like section parser (works for leadership, work, volunteering) ───

interface ExperienceEntry {
  id: string;
  title: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string[];
}

function parseExperienceLikeSection(sectionLines: string[]): ExperienceEntry[] {
  const entries: ExperienceEntry[] = [];
  let current: ExperienceEntry | null = null;
  
  for (let i = 0; i < sectionLines.length; i++) {
    const line = sectionLines[i].trim();
    if (!line) continue;
    
    if (isBullet(line)) {
      if (current) {
        current.responsibilities.push(cleanBullet(line));
      }
      continue;
    }
    
    // Check if this is a new role line
    if (isRoleLine(line)) {
      if (current) entries.push(current);
      
      const parsed = parseRoleLine(line);
      current = {
        id: uid(),
        title: parsed.title,
        organization: parsed.organization,
        location: parsed.location,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        current: parsed.current,
        responsibilities: []
      };

      // Look ahead: if next non-empty line is NOT a bullet and NOT a role line,
      // it might be the organization name
      if (!current.organization) {
        for (let j = i + 1; j < sectionLines.length; j++) {
          const next = sectionLines[j].trim();
          if (!next) continue;
          if (isBullet(next) || isRoleLine(next)) break;
          // Short non-bullet line = likely org name
          if (next.length < 100 && !extractDateRange(next).startDate) {
            const parts = next.split(',').map(p => p.trim());
            current.organization = parts[0];
            if (parts.length > 1) current.location = parts.slice(1).join(', ');
            sectionLines[j] = ''; // consume this line
          }
          break;
        }
      }
      continue;
    }
    
    // Non-bullet, non-role line
    if (current) {
      // Check if it has a date but wasn't detected as role (might be org + date)
      const dateRange = extractDateRange(line);
      if (dateRange.startDate && !current.startDate) {
        current.startDate = dateRange.startDate;
        current.endDate = dateRange.endDate;
        current.current = dateRange.current;
        const cleanLine = stripDateRange(line);
        if (cleanLine && !current.organization) {
          const parts = cleanLine.split(',').map(p => p.trim());
          current.organization = parts[0];
          if (parts.length > 1) current.location = parts.slice(1).join(', ');
        }
      } else if (!current.organization && line.length < 100) {
        const parts = line.split(',').map(p => p.trim());
        current.organization = parts[0];
        if (parts.length > 1) current.location = parts.slice(1).join(', ');
      } else if (line.length > 15) {
        // Treat as a responsibility without bullet marker
        current.responsibilities.push(line);
      }
    } else {
      // No current entry — this might be a role line we didn't detect.
      // Start a new entry if the line is short enough.
      if (line.length < 120 && !line.includes('@')) {
        const dateRange = extractDateRange(line);
        const parsed = parseRoleLine(line);
        current = {
          id: uid(),
          title: parsed.title,
          organization: parsed.organization,
          location: parsed.location,
          startDate: dateRange.startDate || parsed.startDate,
          endDate: dateRange.endDate || parsed.endDate,
          current: dateRange.current || parsed.current,
          responsibilities: []
        };
      }
    }
  }
  
  if (current) entries.push(current);
  return entries;
}

// ─── Education Parser ───────────────────────────────────────────

function parseEducationLines(sectionLines: string[]): ExtractedResumeData['education'] {
  const education: ExtractedResumeData['education'] = [];
  const degreePattern = /(?:bachelor|master|phd|ph\.d|doctorate|associate|diploma|certificate|b\.?s\.?c?\.?|m\.?s\.?c?\.?|b\.?a\.?|m\.?a\.?|m\.?b\.?a\.?|bsc|msc|ba|ma|mba|gce|gcse|a[\s-]?level|o[\s-]?level|high\s*school|secondary\s*school|ssce|wassce|hnd|nd|ond)/i;
  const institutionPattern = /(?:university|college|institute|school|polytechnic|academy|knust|ugbs|legon|ucc|uew|uds|umat|upsa)/i;
  
  let current: ExtractedResumeData['education'][0] | null = null;
  
  for (let i = 0; i < sectionLines.length; i++) {
    const trimmed = sectionLines[i].trim();
    if (!trimmed) continue;

    const hasDegree = degreePattern.test(trimmed);
    const hasInstitution = institutionPattern.test(trimmed);
    const dateRange = extractDateRange(trimmed);
    const gpaMatch = trimmed.match(/(?:gpa|cgpa|cwa|first\s*class|second\s*class)[:\s]*([0-9.]+(?:\s*[~≈/]\s*(?:gpa\s*)?[0-9.]+)?)/i);

    // Start a new entry when we encounter a degree or institution
    if (hasDegree && !isBullet(trimmed)) {
      if (current) education.push(current);
      
      let degreeLine = stripDateRange(trimmed);
      if (gpaMatch) {
        degreeLine = degreeLine.replace(/(?:gpa|cgpa|cwa|first\s*class|second\s*class)[:\s]*[0-9.]+(?:\s*[~≈/]\s*(?:gpa\s*)?[0-9.]+)?/i, '').trim();
      }

      current = {
        id: uid(),
        degree: degreeLine.replace(/,\s*$/, '').trim(),
        institution: '',
        location: '',
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        gpa: gpaMatch ? gpaMatch[1] : '',
        coursework: '',
        bullets: []
      };

      // If same line has institution, extract it
      if (hasInstitution) {
        // Try to split degree from institution
        const parts = degreeLine.split(/\s*[-–—,]\s*/);
        if (parts.length >= 2) {
          // Find which part is the institution
          for (let p = 0; p < parts.length; p++) {
            if (institutionPattern.test(parts[p])) {
              current.institution = parts[p].trim();
              current.degree = parts.filter((_, idx) => idx !== p).join(', ').trim();
              break;
            }
          }
        }
      }
      continue;
    }

    // Institution-first format
    if (hasInstitution && !isBullet(trimmed) && !current) {
      if (current) education.push(current);
      
      const cleanInst = stripDateRange(trimmed);
      const commaParts = cleanInst.split(',').map(p => p.trim());
      
      current = {
        id: uid(),
        degree: '',
        institution: commaParts[0],
        location: commaParts.length > 1 ? commaParts.slice(1).join(', ') : '',
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        gpa: '',
        coursework: '',
        bullets: []
      };
      continue;
    }

    if (!current) {
      // Maybe first line is just a program name
      if (trimmed.length < 120 && !trimmed.includes('@') && !/\d{8,}/.test(trimmed)) {
        current = {
          id: uid(),
          degree: stripDateRange(trimmed),
          institution: '',
          location: '',
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          gpa: '',
          coursework: '',
          bullets: []
        };
      }
      continue;
    }

    // GPA line
    if (gpaMatch) {
      current.gpa = gpaMatch[1];
      continue;
    }

    // Coursework line
    if (/relevant\s*coursework|coursework/i.test(trimmed)) {
      current.coursework = trimmed.replace(/relevant\s*coursework\s*:?\s*/i, '').trim();
      continue;
    }

    // Institution line (when current entry exists but has no institution)
    if (!current.institution && hasInstitution) {
      if (dateRange.startDate && !current.startDate) {
        current.startDate = dateRange.startDate;
        current.endDate = dateRange.endDate;
      }
      const cleanInst = stripDateRange(trimmed);
      const commaParts = cleanInst.split(',').map(p => p.trim());
      current.institution = commaParts[0];
      if (commaParts.length > 1) current.location = commaParts.slice(1).join(', ');
      continue;
    }

    // Degree line (when current has institution but no degree)
    if (!current.degree && hasDegree) {
      current.degree = stripDateRange(trimmed);
      if (dateRange.startDate && !current.startDate) {
        current.startDate = dateRange.startDate;
        current.endDate = dateRange.endDate;
      }
      continue;
    }
    
    // Date-only line
    if (dateRange.startDate && trimmed.length < 60 && !current.startDate) {
      current.startDate = dateRange.startDate;
      current.endDate = dateRange.endDate;
      continue;
    }

    // Location line (short, no dates, looks like place)
    if (!current.location && trimmed.length < 60 && !dateRange.startDate && /[A-Z]/.test(trimmed[0]) && !isBullet(trimmed)) {
      const isLikelyLocation = /,\s*[A-Z]/.test(trimmed) || /ghana|nigeria|kenya|accra|kumasi|london|new york|remote/i.test(trimmed);
      if (isLikelyLocation) {
        current.location = trimmed;
        continue;
      }
    }
    
    // Bullets
    if (isBullet(trimmed)) {
      current.bullets.push(cleanBullet(trimmed));
    }

    // Check if this starts a new education entry (next degree/institution)
    if (i + 1 < sectionLines.length) {
      const nextLine = sectionLines[i + 1].trim();
      if ((degreePattern.test(nextLine) || institutionPattern.test(nextLine)) && !isBullet(nextLine)) {
        education.push(current);
        current = null;
      }
    }
  }
  
  if (current) education.push(current);
  return education;
}

// ─── Awards/Achievements Parser ──────────────────────────────────

function parseAwardsLines(sectionLines: string[]): ExtractedResumeData['awardsAndRecognition'] {
  const awards: ExtractedResumeData['awardsAndRecognition'] = [];
  
  // Handle pipe-separated table rows (from markdown table parsing)
  const tableRows = sectionLines.filter(l => l.includes(' | '));
  if (tableRows.length > 0) {
    for (const row of tableRows) {
      const cells = row.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 2) {
        const title = cells[0];
        const date = extractSingleDate(cells[1]) || cells[1];
        const org = cells.length >= 3 ? cells[2] : '';
        if (title.length > 2) {
          awards.push({ id: uid(), title, date, organization: org });
        }
      }
    }
    if (awards.length > 0) return awards;
  }
  
  const groups: string[][] = [];
  let currentGroup: string[] = [];
  
  for (const line of sectionLines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [];
      }
      continue;
    }
    currentGroup.push(trimmed);
  }
  if (currentGroup.length > 0) groups.push(currentGroup);
  
  if (groups.length === 1 && groups[0].length >= 3) {
    const lines = groups[0];
    const dateLineIndices: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (extractSingleDate(lines[i]) && lines[i].length < 30) {
        dateLineIndices.push(i);
      }
    }
    
    if (dateLineIndices.length >= 2) {
      for (let d = 0; d < dateLineIndices.length; d++) {
        const dateIdx = dateLineIndices[d];
        const titleIdx = dateIdx - 1;
        const orgIdx = dateIdx + 1;
        
        if (titleIdx >= 0) {
          awards.push({
            id: uid(),
            title: lines[titleIdx],
            date: lines[dateIdx],
            organization: orgIdx < lines.length && !dateLineIndices.includes(orgIdx) ? lines[orgIdx] : ''
          });
        }
      }
      return awards;
    }
  }
  
  for (const group of groups) {
    if (group.length === 1) {
      const line = group[0];
      if (line.length > 3) {
        awards.push({
          id: uid(),
          title: cleanBullet(line),
          date: extractSingleDate(line),
          organization: ''
        });
      }
    } else if (group.length >= 2) {
      const title = cleanBullet(group[0]);
      let date = '';
      let org = '';
      for (let i = 1; i < group.length; i++) {
        const d = extractSingleDate(group[i]);
        if (d && !date) {
          date = d;
        } else if (!org) {
          org = group[i];
        }
      }
      awards.push({ id: uid(), title, date, organization: org });
    }
  }
  
  return awards;
}

// ─── Certifications Parser ──────────────────────────────────────

function parseCertificationsLines(sectionLines: string[]): ExtractedResumeData['certifications'] {
  const certs: ExtractedResumeData['certifications'] = [];
  
  const groups: string[][] = [];
  let currentGroup: string[] = [];
  
  for (const line of sectionLines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [];
      }
      continue;
    }
    currentGroup.push(trimmed);
  }
  if (currentGroup.length > 0) groups.push(currentGroup);
  
  if (groups.length === 1 && groups[0].length >= 3) {
    const lines = groups[0];
    const dateLineIndices: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (extractSingleDate(lines[i]) && lines[i].length < 30) {
        dateLineIndices.push(i);
      }
    }
    
    if (dateLineIndices.length >= 2) {
      for (let d = 0; d < dateLineIndices.length; d++) {
        const dateIdx = dateLineIndices[d];
        const nameIdx = dateIdx - 1;
        const issuerIdx = dateIdx + 1;
        
        if (nameIdx >= 0) {
          certs.push({
            id: uid(),
            name: lines[nameIdx],
            date: lines[dateIdx],
            issuer: issuerIdx < lines.length && !dateLineIndices.includes(issuerIdx) ? lines[issuerIdx] : ''
          });
        }
      }
      return certs;
    }
  }
  
  for (const group of groups) {
    if (group.length === 1) {
      const line = group[0];
      if (line.length > 3 && !/^certif/i.test(line)) {
        certs.push({
          id: uid(),
          name: cleanBullet(line),
          date: extractSingleDate(line),
          issuer: ''
        });
      }
    } else {
      const name = cleanBullet(group[0]);
      let date = '';
      let issuer = '';
      for (let i = 1; i < group.length; i++) {
        const d = extractSingleDate(group[i]);
        if (d && !date) {
          date = d;
        } else if (!issuer) {
          issuer = group[i];
        }
      }
      certs.push({ id: uid(), name, date, issuer });
    }
  }
  
  return certs;
}

// ─── Projects Parser ────────────────────────────────────────────

function parseProjectsLines(sectionLines: string[]): ExtractedResumeData['projects'] {
  const projects: ExtractedResumeData['projects'] = [];
  let current: ExtractedResumeData['projects'][0] | null = null;
  
  for (let i = 0; i < sectionLines.length; i++) {
    const trimmed = sectionLines[i].trim();
    if (!trimmed) continue;
    
    if (isBullet(trimmed)) {
      if (current) current.bullets.push(cleanBullet(trimmed));
      continue;
    }

    // Role line: "Role: Product Manager"
    if (/^role\s*:/i.test(trimmed) && current) {
      current.role = trimmed.replace(/^role\s*:\s*/i, '').trim();
      continue;
    }

    // Technologies line
    if (/^tech(?:nologies?)?\s*:/i.test(trimmed) && current) {
      current.technologies = trimmed.replace(/^tech(?:nologies?)?\s*:\s*/i, '').trim();
      continue;
    }
    
    const hasDate = extractDateRange(trimmed).startDate !== '';
    const isShortTitle = trimmed.length < 120 && !trimmed.includes('@');
    const isNewProjectLine = isShortTitle && (hasDate || (
      // Detect project-name patterns: "ProjectName - Description" or short standalone title
      /\s+[-–—]\s+/.test(trimmed) && trimmed.length < 100
    ));
    
    // Start new project if: first project, or line has a date and looks like a title
    if ((!current && isShortTitle) || (current && isNewProjectLine && hasDate)) {
      if (current) projects.push(current);
      
      const dateRange = extractDateRange(trimmed);
      let name = stripDateRange(trimmed);
      let role = '';
      let technologies = '';
      
      // Extract inline role
      const roleMatch = name.match(/\b(?:product\s*manag(?:er|ement)?|developer|lead|engineer|designer|project\s*manag(?:er|ement)?)\b/i);
      if (roleMatch) {
        role = roleMatch[0].trim();
      }
      
      const linkMatch = name.match(/(https?:\/\/[^\s]+)/);
      const link = linkMatch ? linkMatch[1] : '';
      if (link) name = name.replace(link, '').trim();
      
      const techMatch = name.match(/(?:tech(?:nologies)?|stack|built\s*with)\s*:?\s*([^.]+)/i);
      if (techMatch) {
        technologies = techMatch[1].trim();
        name = name.replace(techMatch[0], '').trim();
      }
      
      current = {
        id: uid(),
        name: name.replace(/,\s*$/, '').replace(/\s*[-–—]\s*$/, '').trim(),
        description: '',
        technologies,
        link,
        bullets: [],
        role,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };
    } else if (current) {
      // Non-bullet content line - treat as responsibility
      if (trimmed.length > 15) {
        current.bullets.push(trimmed);
      }
    } else {
      // First line with no date — treat as project name
      current = {
        id: uid(),
        name: trimmed,
        description: '',
        technologies: '',
        link: '',
        bullets: [],
        role: '',
        startDate: '',
        endDate: ''
      };
    }
  }
  
  if (current) projects.push(current);
  return projects;
}

// ─── Skills Parser ──────────────────────────────────────────────

function parseSkillsLines(sectionLines: string[]): string[] {
  const skills: Set<string> = new Set();
  const excludeWords = new Set([
    'and', 'or', 'the', 'skills', 'technologies', 'proficient', 'experience',
    'abilities', 'skill', 'in', 'with', 'including', 'such', 'as', 'tools',
    'other', 'related', 'technical', 'professional', 'soft', 'core',
    'competencies', 'proficiency', 'knowledge'
  ]);
  
  for (const line of sectionLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Handle "Category: Skill1, Skill2, Skill3" format
    let content = trimmed;
    const colonIdx = content.indexOf(':');
    if (colonIdx !== -1 && colonIdx < 40) {
      // Everything after the colon is the actual skills
      content = content.substring(colonIdx + 1).trim();
    } else {
      // Remove leading category-like labels
      content = content.replace(/^(?:technical|programming|ai|cloud|product|project|professional|soft|hard|core)\s*(?:&|and)?\s*(?:\w+\s*)*(?:skills?|competenc\w*|tools?)\s*:?\s*/gi, '');
    }
    
    // Remove bullet markers
    content = cleanBullet(content);
    
    // Split by common delimiters: comma, pipe, semicolon, bullet
    const parts = content.split(/[,|;•·]\s*/);
    
    for (const part of parts) {
      const skill = part.trim()
        .replace(/^[-–—]\s*/, '')
        .replace(/\s*[-–—]\s*$/, '')
        .trim();
      
      if (skill.length >= 2 && skill.length <= 60 && !excludeWords.has(skill.toLowerCase())) {
        // Don't add if it looks like a sentence
        if (skill.split(/\s+/).length <= 5) {
          skills.add(skill);
        }
      }
    }
  }
  
  return [...skills].slice(0, 50);
}

// ─── References Parser ──────────────────────────────────────────

/**
 * IMPROVED: Parse references in multiple formats:
 * Format 1: "Title, Name\nOrganization,\nPhone: ...\nEmail: ..."
 * Format 2: "Name\nTitle at Organization\nPhone\nEmail"
 */
function parseReferencesLines(sectionLines: string[]): ExtractedResumeData['references'] {
  const references: ExtractedResumeData['references'] = [];

  // Group lines into reference blocks separated by blank lines or when a new name/title appears
  const blocks: string[][] = [];
  let currentBlock: string[] = [];

  for (const line of sectionLines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
        currentBlock = [];
      }
      continue;
    }
    currentBlock.push(trimmed);
  }
  if (currentBlock.length > 0) blocks.push(currentBlock);

  // If only one block, try to split by detecting name patterns
  if (blocks.length === 1 && blocks[0].length > 4) {
    const lines = blocks[0];
    const splitBlocks: string[][] = [];
    let tempBlock: string[] = [];

    for (const line of lines) {
      // New block starts when we see a name-like line (no digits, no @, no phone/email label)
      const isNameLine = line.length < 60 &&
        /^[A-Za-z\s\-'.,]+$/.test(line) &&
        !/@/.test(line) &&
        !/\d{3}/.test(line) &&
        !/^(?:phone|email|tel|mobile)/i.test(line);

      if (isNameLine && tempBlock.length >= 2) {
        splitBlocks.push(tempBlock);
        tempBlock = [line];
      } else {
        tempBlock.push(line);
      }
    }
    if (tempBlock.length > 0) splitBlocks.push(tempBlock);

    if (splitBlocks.length > 1) {
      blocks.length = 0;
      blocks.push(...splitBlocks);
    }
  }

  for (const block of blocks) {
    if (block.length === 0) continue;

    let name = '';
    let title = '';
    let organization = '';
    let email = '';
    let phone = '';
    let relationship = '';

    for (const line of block) {
      // Email detection
      const emailMatch = line.match(/(?:email\s*:?\s*)?([\w.+-]+@[\w.-]+\.\w{2,})/i);
      if (emailMatch) {
        email = emailMatch[1];
        continue;
      }

      // Phone detection
      const phoneMatch = line.match(/(?:phone|tel|mobile|contact)\s*:?\s*(\+?\d[\d\s\-()]{7,})/i);
      if (phoneMatch) {
        phone = phoneMatch[1].trim();
        continue;
      }
      // Phone without label
      const barePhone = line.match(/^(\+?\d[\d\s\-()]{9,})$/);
      if (barePhone) {
        phone = barePhone[1].trim();
        continue;
      }

      // Name/title line
      if (!name) {
        // Check "Title, Name" format: "CEO, Harriet Adams"
        const titleNameMatch = line.match(/^([\w\s.]+?)\s*,\s*([A-Z][a-zA-Z\s\-'.]+)$/);
        if (titleNameMatch) {
          const possibleTitle = titleNameMatch[1].trim();
          const possibleName = titleNameMatch[2].trim();
          // Check if first part looks like a title
          if (/\b(?:ceo|cto|cfo|dr|mr|mrs|ms|prof|teacher|lecturer|director|manager|supervisor|principal|dean|head|officer|coordinator|president)\b/i.test(possibleTitle) ||
              possibleTitle.split(/\s+/).length <= 2) {
            title = possibleTitle;
            name = possibleName;
          } else {
            name = line;
          }
        } else if (/^[A-Za-z\s\-'.,]+$/.test(line) && line.length < 60 && !/\d/.test(line)) {
          name = line.replace(/,\s*$/, '').trim();
        } else {
          name = line;
        }
        continue;
      }

      // Organization line
      if (!organization && line.length < 100 && !/^(?:phone|email|tel|mobile)/i.test(line)) {
        organization = line.replace(/,\s*$/, '').trim();
        continue;
      }

      // Relationship
      if (!relationship && /\b(?:supervisor|mentor|colleague|manager|professor|teacher|advisor)\b/i.test(line)) {
        relationship = line;
      }
    }

    if (name) {
      references.push({
        id: uid(),
        name,
        title,
        organization,
        email,
        phone,
        relationship
      });
    }
  }
  
  return references;
}

// ─── Main Parse Function ─────────────────────────────────────────

export function parseResumeText(text: string): ExtractedResumeData {
  // ── 1. Text Normalization ──
  let normalized = text
    .replace(/&#x26;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n');
  
  // Strip markdown heading markers (# ## ###) that come from PDF parsing
  normalized = normalized.replace(/^#{1,3}\s+/gm, '');
  
  // Split into lines, also split pipe-separated contact lines
  const rawLines = normalized.split('\n').map(l => l.trim());
  const allLines: string[] = [];
  for (const line of rawLines) {
    // Skip markdown table separator lines
    if (/^\|?\s*[-:]+\s*\|/.test(line)) continue;
    
    // Parse markdown table rows into structured data
    if (/^\|.+\|$/.test(line.trim())) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length > 0) {
        allLines.push(cells.join(' | '));
      }
      continue;
    }
    
    if (line.includes('|') && /@|linkedin|\+\d|phone|email/i.test(line)) {
      allLines.push(...line.split('|').map(l => l.trim()).filter(l => l));
    } else {
      allLines.push(line);
    }
  }
  
  // ── 2. Personal Info Extraction ──
  const emailMatch = normalized.match(/[\w.+-]+@[\w.-]+\.\w{2,}/);
  const email = emailMatch?.[0] || '';
  
  let phone = '';
  const phonePatterns = [
    /\+\d{1,3}[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3,4}/,
    /\+\d{10,15}/,
    /\+?[(]?[0-9]{1,3}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}/
  ];
  for (const p of phonePatterns) {
    const m = normalized.match(p);
    if (m && m[0].replace(/\D/g, '').length >= 10) {
      phone = m[0].trim();
      break;
    }
  }
  
  let linkedin = '';
  const linkedinPatterns = [
    /linkedin\.com\/in\/([a-zA-Z0-9\-_]+)/i,
    /linkedin\s*:?\s*([a-zA-Z0-9\-_\s]+?)(?:\n|$)/i,
  ];
  for (const p of linkedinPatterns) {
    const m = normalized.match(p);
    if (m) {
      const username = m[1].trim().replace(/\s+/g, '-');
      linkedin = `https://linkedin.com/in/${username}`;
      break;
    }
  }
  
  const websiteMatch = normalized.match(/(?:portfolio|website|github|site)[\s:]*?(https?:\/\/[^\s]+)/i);
  const portfolio = websiteMatch?.[1] || '';
  
  // Extract name — first substantive line that looks like a name
  let fullName = '';
  for (const line of allLines.slice(0, 10)) {
    const clean = line.replace(/[|:]/g, ' ').trim();
    if (!clean.includes('@') && 
        !/\d{3}/.test(clean) && 
        !/linkedin|phone|email|address|profile|summary|education|experience|skill|objective/i.test(clean) &&
        clean.length > 2 && clean.length < 50 &&
        /^[A-Za-z\s\-'.]+$/.test(clean)) {
      const words = clean.split(/\s+/);
      if (words.length >= 2 && words.length <= 6) {
        fullName = clean;
        break;
      }
    }
  }
  if (!fullName && allLines.length > 0) {
    const first = allLines[0].replace(/[|:]/g, ' ').trim();
    if (first.length < 50 && /^[A-Za-z\s\-'.]+$/.test(first) && first.split(/\s+/).length >= 2) {
      fullName = first;
    }
  }
  
  // Extract job title
  let jobTitle = '';
  const titlePatterns = [
    /(?:computer science|software|senior|junior|lead|principal|staff)\s*(?:student|engineer|developer|designer|manager|analyst)/i,
    /(?:data|product|project|program)\s*(?:scientist|analyst|manager|engineer)/i,
    /(?:full[\s-]?stack|front[\s-]?end|back[\s-]?end|mobile)\s*developer/i,
  ];
  for (const p of titlePatterns) {
    const m = normalized.match(p);
    if (m) { jobTitle = m[0]; break; }
  }
  
  // Country
  let country = '';
  const countryMatch = normalized.match(/(?:Ghana|Nigeria|Kenya|South Africa|Egypt|Morocco|Tanzania|Uganda|Ethiopia|Rwanda|Senegal|Cameroon)/i);
  if (countryMatch) country = countryMatch[0];
  
  // ── 3. Section-based Extraction ──
  const blocks = extractSectionBlocks(allLines);
  
  let profile = '';
  const education: ExtractedResumeData['education'] = [];
  const workExperience: ExtractedResumeData['workExperience'] = [];
  const leadershipExperience: ExtractedResumeData['leadershipExperience'] = [];
  const projects: ExtractedResumeData['projects'] = [];
  const certifications: ExtractedResumeData['certifications'] = [];
  const awardsAndRecognition: ExtractedResumeData['awardsAndRecognition'] = [];
  let skills: string[] = [];
  const interests: string[] = [];
  const references: ExtractedResumeData['references'] = [];
  const volunteering: ExtractedResumeData['volunteering'] = [];
  const scholarships: ExtractedResumeData['scholarships'] = [];
  const advocacyAndAmbassadorships: ExtractedResumeData['advocacyAndAmbassadorships'] = [];
  const languages: ExtractedResumeData['languages'] = [];
  
  for (const block of blocks) {
    switch (block.name) {
      case 'profile':
        profile = block.lines.join(' ').substring(0, 500);
        break;
        
      case 'education':
        education.push(...parseEducationLines(block.lines));
        break;
        
      case 'experience': {
        const expEntries = parseExperienceLikeSection(block.lines);
        workExperience.push(...expEntries.map(e => ({
          id: e.id,
          title: e.title,
          company: e.organization,
          location: e.location,
          startDate: e.startDate,
          endDate: e.endDate,
          current: e.current,
          responsibilities: e.responsibilities
        })));
        break;
      }
        
      case 'leadership':
        leadershipExperience.push(...parseExperienceLikeSection(block.lines));
        break;
        
      case 'projects':
        projects.push(...parseProjectsLines(block.lines));
        break;
        
      case 'certifications':
        certifications.push(...parseCertificationsLines(block.lines));
        break;
        
      case 'awards':
        awardsAndRecognition.push(...parseAwardsLines(block.lines));
        break;
        
      case 'skills':
        skills.push(...parseSkillsLines(block.lines));
        break;
        
      case 'references':
        references.push(...parseReferencesLines(block.lines));
        break;
        
      case 'volunteering': {
        const volEntries = parseExperienceLikeSection(block.lines);
        volunteering.push(...volEntries.map(e => ({
          id: e.id,
          role: e.title,
          organization: e.organization,
          location: e.location,
          startDate: e.startDate,
          endDate: e.endDate,
          description: '',
          bullets: e.responsibilities
        })));
        break;
      }
        
      case 'interests':
        for (const line of block.lines) {
          const clean = cleanBullet(line);
          // Split by comma, pipe, semicolon
          const parts = clean.split(/[,|;•·]\s*/);
          for (const part of parts) {
            const interest = part.trim().replace(/^[-–—]\s*/, '').trim();
            if (interest.length >= 2 && interest.length <= 60) {
              interests.push(interest);
            }
          }
        }
        break;
        
      case 'languages':
        for (const line of block.lines) {
          const clean = cleanBullet(line);
          if (clean.length > 2 && clean.length < 50) {
            const profMatch = clean.match(/(?:native|fluent|advanced|intermediate|basic|beginner|proficient|conversational)/i);
            languages.push({
              language: profMatch ? clean.replace(profMatch[0], '').replace(/[:\-–—]/g, '').trim() : clean,
              proficiency: profMatch ? profMatch[0] : ''
            });
          }
        }
        break;
        
      case 'scholarships':
        for (const line of block.lines) {
          const clean = cleanBullet(line);
          if (clean.length > 3) {
            scholarships.push({
              id: uid(),
              name: clean,
              organization: '',
              date: extractSingleDate(line)
            });
          }
        }
        break;
        
      case 'advocacy':
        for (const line of block.lines) {
          if (line.length > 5) {
            advocacyAndAmbassadorships.push({
              id: uid(),
              title: cleanBullet(line),
              organization: '',
              date: extractSingleDate(line),
              description: ''
            });
          }
        }
        break;
    }
  }
  
  // ── 4. Fallback: If no sections detected, try to extract from unstructured text ──
  if (blocks.length === 0 || (education.length === 0 && workExperience.length === 0 && leadershipExperience.length === 0 && projects.length === 0)) {
    if (!profile) {
      for (let i = 0; i < allLines.length && i < 15; i++) {
        const line = allLines[i];
        if (line.length > 80 && !/@/.test(line) && !/\+\d/.test(line)) {
          profile = line.substring(0, 500);
          break;
        }
      }
    }
  }
  
  // De-duplicate skills
  skills = [...new Set(skills)];
  
  return {
    fullText: normalized,
    personalInfo: {
      fullName,
      email,
      phone,
      linkedin,
      portfolio,
      address: '',
      jobTitle,
      country
    },
    profile,
    education,
    scholarships,
    workExperience,
    leadershipExperience,
    advocacyAndAmbassadorships,
    awardsAndRecognition,
    certifications,
    skills,
    interests: [...new Set(interests)],
    languages,
    projects,
    volunteering,
    references
  };
}
