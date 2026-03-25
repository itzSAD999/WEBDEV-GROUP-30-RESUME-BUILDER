import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  GripVertical, 
  Layers, 
  User, 
  FileText, 
  GraduationCap, 
  Briefcase, 
  Heart,
  Code,
  Wrench,
  Award,
  Plus,
  Check
} from "lucide-react";
import { ResumeData } from "@/types/resume";
import { useToast } from "@/hooks/use-toast";

export interface SectionConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  visible: boolean;
  hasData: boolean;
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  personalInfo: <User className="w-4 h-4" />,
  profile: <FileText className="w-4 h-4" />,
  education: <GraduationCap className="w-4 h-4" />,
  workExperience: <Briefcase className="w-4 h-4" />,
  volunteering: <Heart className="w-4 h-4" />,
  projects: <Code className="w-4 h-4" />,
  skills: <Wrench className="w-4 h-4" />,
  achievements: <Award className="w-4 h-4" />,
  customSections: <Plus className="w-4 h-4" />
};

const SECTION_NAMES: Record<string, string> = {
  personalInfo: "Personal Info",
  profile: "Profile Summary",
  education: "Education",
  workExperience: "Work Experience",
  volunteering: "Volunteering",
  projects: "Projects & Research",
  skills: "Skills",
  achievements: "Achievements",
  customSections: "Custom Sections"
};

const DEFAULT_ORDER = [
  "personalInfo",
  "profile", 
  "education",
  "workExperience",
  "volunteering",
  "projects",
  "skills",
  "achievements",
  "customSections"
];

interface SortableSectionItemProps {
  section: SectionConfig;
  onToggleVisibility: (id: string) => void;
}

const SortableSectionItem = ({ section, onToggleVisibility }: SortableSectionItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-all ${
        section.visible 
          ? "bg-card border-border" 
          : "bg-muted/50 border-muted opacity-60"
      }`}
    >
      <button
        type="button"
        className="p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>
      
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className={`p-1 sm:p-1.5 rounded flex-shrink-0 ${section.visible ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
          {section.icon}
        </div>
        <span className={`text-xs sm:text-sm font-medium truncate ${section.visible ? "text-foreground" : "text-muted-foreground"}`}>
          {section.name}
        </span>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {section.hasData ? (
          <Badge variant="secondary" className="text-[10px] sm:text-xs bg-green-500/10 text-green-700 px-1 sm:px-2">
            Data
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] sm:text-xs text-muted-foreground px-1 sm:px-2">
            Empty
          </Badge>
        )}
        
        <button
          type="button"
          onClick={() => onToggleVisibility(section.id)}
          className={`w-5 h-5 sm:w-6 sm:h-6 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
            section.visible 
              ? "bg-primary border-primary text-primary-foreground" 
              : "border-border hover:border-primary/50"
          }`}
        >
          {section.visible && <Check className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
};

interface SectionOrderManagerProps {
  resumeData: ResumeData;
  sectionOrder: string[];
  onOrderChange: (newOrder: string[]) => void;
  trigger?: React.ReactNode;
}

export const SectionOrderManager = ({ 
  resumeData, 
  sectionOrder,
  onOrderChange,
  trigger 
}: SectionOrderManagerProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const currentOrder = sectionOrder.length > 0 ? sectionOrder : DEFAULT_ORDER;
  
  const buildSections = (): SectionConfig[] => {
    return currentOrder.map(id => ({
      id,
      name: SECTION_NAMES[id] || id,
      icon: SECTION_ICONS[id] || <FileText className="w-4 h-4" />,
      visible: true,
      hasData: checkHasData(id)
    }));
  };
  
  const checkHasData = (sectionId: string): boolean => {
    switch (sectionId) {
      case "personalInfo":
        return !!(resumeData.personalInfo?.fullName || resumeData.personalInfo?.email);
      case "profile":
        return !!(resumeData.profile && resumeData.profile.length > 0);
      case "education":
        return resumeData.education?.length > 0;
      case "workExperience":
        return resumeData.workExperience?.length > 0;
      case "volunteering":
        return resumeData.volunteering?.length > 0;
      case "projects":
        return resumeData.projects?.length > 0;
      case "skills":
        return (resumeData.technicalSkills?.length > 0 || resumeData.softSkills?.length > 0);
      case "achievements":
        return resumeData.achievements?.length > 0;
      case "customSections":
        return resumeData.customSections?.length > 0;
      default:
        return false;
    }
  };
  
  const [sections, setSections] = useState<SectionConfig[]>(buildSections);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      const reordered = arrayMove(sections, oldIndex, newIndex);
      setSections(reordered);
    }
  };
  
  const toggleVisibility = (id: string) => {
    setSections(prev => prev.map(s => 
      s.id === id ? { ...s, visible: !s.visible } : s
    ));
  };
  
  const handleSave = () => {
    const newOrder = sections.map(s => s.id);
    onOrderChange(newOrder);
    setOpen(false);
    toast({
      title: "Section Order Updated",
      description: "Your resume sections have been reordered."
    });
  };
  
  const handleReset = () => {
    const resetSections = DEFAULT_ORDER.map(id => ({
      id,
      name: SECTION_NAMES[id] || id,
      icon: SECTION_ICONS[id] || <FileText className="w-4 h-4" />,
      visible: true,
      hasData: checkHasData(id)
    }));
    setSections(resetSections);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Layers className="w-4 h-4" />
            Section Order
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md mx-auto max-h-[90vh] flex flex-col p-4 sm:p-6">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Reorder Sections
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Drag and drop to reorder resume sections.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 -mx-4 px-4 sm:-mx-6 sm:px-6">
          <div className="py-2 sm:py-4">
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCenter} 
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={sections.map(s => s.id)} 
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1.5 sm:space-y-2">
                  {sections.map(section => (
                    <SortableSectionItem
                      key={section.id}
                      section={section}
                      onToggleVisibility={toggleVisibility}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-4 text-center">
              Drag sections to reorder how they appear in your resume
            </p>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-shrink-0 gap-2 pt-2 sm:pt-4 flex-col sm:flex-row">
          <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
            Reset to Default
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto">
            Save Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { DEFAULT_ORDER };
