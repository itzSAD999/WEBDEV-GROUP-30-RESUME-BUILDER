import React from "react";
import { ClassicTemplate } from "./ClassicTemplate";
import { ProfessionalTemplate } from "./ProfessionalTemplate";
import { StanfordTemplate } from "./StanfordTemplate";
import { MITTemplate } from "./MITTemplate";
import { DeedyTemplate } from "./DeedyTemplate";
import { CreativeTemplate } from "./CreativeTemplate";

export const templateComponents = {
  classic: ClassicTemplate,
  professional: ProfessionalTemplate,
  stanford: StanfordTemplate,
  mit: MITTemplate,
  deedy: DeedyTemplate,
  creative: CreativeTemplate,
};

export { ClassicTemplate, ProfessionalTemplate, StanfordTemplate, MITTemplate, DeedyTemplate, CreativeTemplate };
