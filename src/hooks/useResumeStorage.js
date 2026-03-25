import { useState, useEffect, useCallback, useRef } from "react";
import { ResumeData } from "@/types/resume";
import { FontFamily } from "@/components/resume/FontSelector";

const STORAGE_KEY = "resume_draft";
const TEMPLATE_KEY = "selected_template";
const FORM_MODE_KEY = "form_only_mode";
const FONT_KEY = "resume_font";
const AUTO_SAVE_DELAY = 2000;

const DEFAULT_SECTION_ORDER = [
  "profile",
  "education",
  "experience",
  "volunteering",
  "leadership",
  "projects",
  "achievements",
  "certifications",
  "skills",
  "interests",
   "custom",
   "references"
];

const initialData: ResumeData = {
  personalInfo: {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    linkedin: "",
    portfolio: "",
  },
  profile: "",
  education: [],
  workExperience: [],
  volunteering: [],
  achievements: [],
  projects: [],
  certifications: [],
  leadership: [],
  technicalSkills: [],
  softSkills: [],
  interests: [],
  customSections: [],
  skillCategories: [],
  sectionOrder: DEFAULT_SECTION_ORDER,
  references: [],
};

export const useResumeStorage = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure sectionOrder exists
      if (!parsed.sectionOrder) {
        parsed.sectionOrder = DEFAULT_SECTION_ORDER;
      }
      // Ensure customSections exists
      if (!parsed.customSections) {
        parsed.customSections = [];
      }
      // Ensure portfolio exists
      if (!parsed.personalInfo.portfolio) {
        parsed.personalInfo.portfolio = "";
      }
      // Ensure education bullets exist
      parsed.education = parsed.education?.map((edu: any) => ({
        ...edu,
        bullets: edu.bullets || [],
        gpa: edu.gpa || "",
      })) || [];
      // Ensure volunteering exists
      if (!parsed.volunteering) {
        parsed.volunteering = [];
      }
      // Ensure skillCategories exists
      if (!parsed.skillCategories) {
        parsed.skillCategories = [];
      }
      // Ensure references exists
      if (!parsed.references) {
        parsed.references = [];
      }
       // Ensure references is in sectionOrder
       if (parsed.sectionOrder && !parsed.sectionOrder.includes('references')) {
         parsed.sectionOrder.push('references');
       }
      return parsed;
    }
    return initialData;
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>(() => {
    return localStorage.getItem(TEMPLATE_KEY) || "classic";
  });

  const [selectedFont, setSelectedFont] = useState<FontFamily>(() => {
    return (localStorage.getItem(FONT_KEY) as FontFamily) || "serif";
  });

  const [formOnlyMode, setFormOnlyMode] = useState<boolean>(() => {
    return localStorage.getItem(FORM_MODE_KEY) === "true";
  });

  const [hasDraft, setHasDraft] = useState<boolean>(() => {
    return !!localStorage.getItem(STORAGE_KEY);
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save with debounce
  const saveToLocalStorage = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData));
    setLastSaved(new Date());
    setHasDraft(true);
  }, [resumeData]);

  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveToLocalStorage();
    }, AUTO_SAVE_DELAY);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [resumeData, saveToLocalStorage]);

  useEffect(() => {
    localStorage.setItem(TEMPLATE_KEY, selectedTemplate);
  }, [selectedTemplate]);

  useEffect(() => {
    localStorage.setItem(FONT_KEY, selectedFont);
  }, [selectedFont]);

  useEffect(() => {
    localStorage.setItem(FORM_MODE_KEY, String(formOnlyMode));
  }, [formOnlyMode]);

  const updateResumeData = useCallback((section: Partial<ResumeData>) => {
    setResumeData((prev) => ({ ...prev, ...section }));
  }, []);

  const updateSectionOrder = useCallback((newOrder: string[]) => {
    setResumeData((prev) => ({ ...prev, sectionOrder: newOrder }));
  }, []);

  const clearDraft = useCallback(() => {
    setResumeData(initialData);
    localStorage.removeItem(STORAGE_KEY);
    setHasDraft(false);
    setLastSaved(null);
  }, []);

  const forceSave = useCallback(() => {
    saveToLocalStorage();
  }, [saveToLocalStorage]);

  return {
    resumeData,
    setResumeData,
    updateResumeData,
    clearDraft,
    selectedTemplate,
    setSelectedTemplate,
    selectedFont,
    setSelectedFont,
    formOnlyMode,
    setFormOnlyMode,
    hasDraft,
    lastSaved,
    forceSave,
    updateSectionOrder,
  };
};
