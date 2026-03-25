import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
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
  Check,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --danger: #f75f5f;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }
  
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--r-sm);
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: all 0.2s; border: none; font-family: var(--font);
  }
  .btn-outline { border: 1px solid var(--border); background: var(--surface2); color: var(--text); }
  .btn-outline:hover { background: var(--border); }
  .btn-primary { background: var(--text); color: var(--bg); }
  .btn-primary:hover { opacity: 0.9; }
  .btn-sm { padding: 6px 12px; font-size: 12px; }

  .dialog-overlay {
    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7);
    display: flex; align-items: center; justify-content: center;
    z-index: 50; padding: 16px; backdrop-filter: blur(4px);
  }
  
  .dialog-content {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); width: 100%; max-width: 450px;
    max-height: 90vh; display: flex; flex-direction: column;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); font-family: var(--font);
    color: var(--text); overflow: hidden;
  }

  .dialog-header {
    padding: 20px 20px 16px; border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: flex-start;
  }
  
  .dialog-title-wrapper { display: flex; flex-direction: column; gap: 4px; }
  .dialog-title { font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
  .dialog-desc { font-size: 13px; color: var(--text-muted); }
  
  .close-btn {
    background: transparent; border: none; color: var(--text-muted);
    cursor: pointer; padding: 4px; border-radius: 4px; transition: background 0.2s;
  }
  .close-btn:hover { background: var(--surface2); color: var(--text); }

  .scroll-area {
    padding: 16px 20px; overflow-y: auto; flex: 1;
    display: flex; flex-direction: column; gap: 8px;
  }

  .dialog-footer {
    padding: 16px 20px; border-top: 1px solid var(--border);
    display: flex; gap: 8px; justify-content: flex-end;
    background: var(--surface2);
  }

  .sortable-item {
    display: flex; align-items: center; gap: 12px; padding: 10px;
    border-radius: var(--r-sm); border: 1px solid var(--border);
    transition: all 0.2s;
  }
  
  .sortable-item.active { background: var(--surface); border-color: var(--border); }
  .sortable-item.inactive { background: rgba(31, 36, 53, 0.5); border-color: rgba(42, 48, 72, 0.5); opacity: 0.6; }
  
  .drag-handle {
    cursor: grab; color: var(--text-muted); padding: 4px;
    border-radius: 4px; transition: background 0.2s; flex-shrink: 0; background: transparent; border: none;
  }
  .drag-handle:hover { background: var(--surface2); }
  
  .item-content { flex: 1; display: flex; align-items: center; gap: 8px; min-width: 0; }
  .item-icon-box {
    padding: 6px; border-radius: 6px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  }
  .item-icon-box.active { background: rgba(79, 142, 247, 0.1); color: var(--accent); }
  .item-icon-box.inactive { background: var(--surface2); color: var(--text-muted); }
  
  .item-name { font-size: 13.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .item-name.active { color: var(--text); }
  .item-name.inactive { color: var(--text-muted); }

  .item-actions { display: flex; items-center; gap: 8px; flex-shrink: 0; }
  
  .badge {
    font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: 500;
  }
  .badge-data { background: rgba(74, 222, 128, 0.1); color: #4ade80; }
  .badge-empty { border: 1px solid var(--border); color: var(--text-muted); }

  .toggle-checkbox {
    width: 20px; height: 20px; border-radius: 4px; border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    transition: all 0.2s; background: transparent; flex-shrink: 0;
  }
  .toggle-checkbox.checked {
    background: var(--text); border-color: var(--text); color: var(--bg);
  }
  .toggle-checkbox:hover { border-color: rgba(228, 232, 245, 0.5); }
\`;

const SECTION_ICONS = {
  personalInfo: <User size={16} />,
  profile: <FileText size={16} />,
  education: <GraduationCap size={16} />,
  workExperience: <Briefcase size={16} />,
  volunteering: <Heart size={16} />,
  projects: <Code size={16} />,
  skills: <Wrench size={16} />,
  achievements: <Award size={16} />,
  customSections: <Plus size={16} />
};

const SECTION_NAMES = {
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

export const DEFAULT_ORDER = [
  "personalInfo", "profile", "education", "workExperience",
  "volunteering", "projects", "skills", "achievements", "customSections"
];

const SortableSectionItem = ({ section, onToggleVisibility }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const blockStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={blockStyle}
      className={\`sortable-item \${section.visible ? 'active' : 'inactive'}\`}
    >
      <button
        type="button"
        className="drag-handle touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>
      
      <div className="item-content">
        <div className={\`item-icon-box \${section.visible ? 'active' : 'inactive'}\`}>
          {section.icon}
        </div>
        <span className={\`item-name \${section.visible ? 'active' : 'inactive'}\`}>
          {section.name}
        </span>
      </div>
      
      <div className="item-actions">
        {section.hasData ? (
          <span className="badge badge-data">Data</span>
        ) : (
          <span className="badge badge-empty">Empty</span>
        )}
        
        <button
          type="button"
          onClick={() => onToggleVisibility(section.id)}
          className={\`toggle-checkbox \${section.visible ? 'checked' : ''}\`}
        >
          {section.visible && <Check size={12} />}
        </button>
      </div>
    </div>
  );
};

export const SectionOrderManager = ({ 
  resumeData, 
  sectionOrder,
  onOrderChange,
  trigger 
}) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const currentOrder = sectionOrder && sectionOrder.length > 0 ? sectionOrder : DEFAULT_ORDER;
  
  const checkHasData = (sectionId) => {
    switch (sectionId) {
      case "personalInfo":
        return !!(resumeData.personalInfo?.fullName || resumeData.personalInfo?.email);
      case "profile":
        return !!(resumeData.profile && resumeData.profile.length > 0);
      case "education":
        return resumeData.education && resumeData.education.length > 0;
      case "workExperience":
        return resumeData.workExperience && resumeData.workExperience.length > 0;
      case "volunteering":
        return resumeData.volunteering && resumeData.volunteering.length > 0;
      case "projects":
        return resumeData.projects && resumeData.projects.length > 0;
      case "skills":
        return (resumeData.technicalSkills && resumeData.technicalSkills.length > 0) || 
               (resumeData.softSkills && resumeData.softSkills.length > 0);
      case "achievements":
        return resumeData.achievements && resumeData.achievements.length > 0;
      case "customSections":
        return resumeData.customSections && resumeData.customSections.length > 0;
      default:
        return false;
    }
  };

  const buildSections = () => {
    return currentOrder.map(id => ({
      id,
      name: SECTION_NAMES[id] || id,
      icon: SECTION_ICONS[id] || <FileText size={16} />,
      visible: true,
      hasData: checkHasData(id)
    }));
  };
  
  const [sections, setSections] = useState(buildSections);
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      const reordered = arrayMove(sections, oldIndex, newIndex);
      setSections(reordered);
    }
  };
  
  const toggleVisibility = (id) => {
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
      icon: SECTION_ICONS[id] || <FileText size={16} />,
      visible: true,
      hasData: checkHasData(id)
    }));
    setSections(resetSections);
  };

  return (
    <>
      <style>{styles}</style>
      
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <button className="btn btn-outline btn-sm" onClick={() => setOpen(true)}>
          <Layers size={14} /> Section Order
        </button>
      )}

      {open && (
        <div className="dialog-overlay" onClick={() => setOpen(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div className="dialog-title-wrapper">
                <h2 className="dialog-title"><Layers size={18} style={{color: 'var(--accent)'}} /> Reorder Sections</h2>
                <p className="dialog-desc">Drag and drop to reorder resume sections.</p>
              </div>
              <button className="close-btn" onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
            
            <div className="scroll-area">
              <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={sections.map(s => s.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '16px' }}>
                Drag sections to reorder how they appear in your resume
              </p>
            </div>
            
            <div className="dialog-footer">
              <button className="btn btn-outline" onClick={handleReset} style={{flex: '1'}}>Reset to Default</button>
              <button className="btn btn-primary" onClick={handleSave} style={{flex: '1'}}>Save Order</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
