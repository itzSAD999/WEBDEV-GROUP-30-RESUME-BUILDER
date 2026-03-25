export interface Template {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  style: "classic" | "modern" | "minimal" | "stanford" | "creative" | "professional";
}

export const templates: Template[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional Harvard-style resume. Classic serif fonts, centered header, ALL CAPS section titles.",
    accentColor: "hsl(0 0% 0%)",
    style: "classic",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Clean professional resume with contact icons, elegant section dividers, and tight spacing.",
    accentColor: "hsl(210 29% 24%)",
    style: "professional",
  },
  {
    id: "stanford",
    name: "Stanford",
    description: "Modern Stanford-style resume. Cardinal red accents, clean sans-serif, centered header.",
    accentColor: "hsl(0 70% 35%)",
    style: "stanford",
  },
  {
    id: "mit",
    name: "MIT",
    description: "Technical MIT-style resume. Clean sans-serif fonts, left-aligned header, tight spacing.",
    accentColor: "hsl(320 60% 40%)",
    style: "modern",
  },
  {
    id: "deedy",
    name: "Deedy",
    description: "Modern Deedy-style resume. Gray color scheme, large name, wide letter spacing.",
    accentColor: "hsl(220 10% 40%)",
    style: "minimal",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold creative resume. Vibrant accent colors, modern typography, unique layout.",
    accentColor: "hsl(200 80% 50%)",
    style: "creative",
  },
];
