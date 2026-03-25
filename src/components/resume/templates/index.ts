import React from "react";
import { ClassicTemplate } from "./ClassicTemplate";
import { ProfessionalTemplate } from "./ProfessionalTemplate";
import { StanfordTemplate } from "./StanfordTemplate";
import { MITTemplate } from "./MITTemplate";
import { DeedyTemplate } from "./DeedyTemplate";
import { CreativeTemplate } from "./CreativeTemplate";
import { ResumeData } from "@/types/resume";

export const templateComponents: Record<string, React.ComponentType<{ data: ResumeData }>> = {
  classic: ClassicTemplate,
  professional: ProfessionalTemplate,
  stanford: StanfordTemplate,
  mit: MITTemplate,
  deedy: DeedyTemplate,
  creative: CreativeTemplate,
};

export { ClassicTemplate, ProfessionalTemplate, StanfordTemplate, MITTemplate, DeedyTemplate, CreativeTemplate };
