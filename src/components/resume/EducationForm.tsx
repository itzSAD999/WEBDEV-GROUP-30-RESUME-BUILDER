import { useState, useEffect } from "react";
import { Education } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical, GraduationCap, Lightbulb } from "lucide-react";
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

interface EducationFormProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

const SortableEducationItem = ({
  edu,
  index,
  updateEducation,
  updateBullet,
  addBullet,
  removeBullet,
  removeEducation,
}: {
  edu: Education;
  index: number;
  updateEducation: (id: string, field: keyof Education, value: string) => void;
  updateBullet: (id: string, index: number, value: string) => void;
  addBullet: (id: string) => void;
  removeBullet: (id: string, index: number) => void;
  removeEducation: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: edu.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const summary = edu.degree || edu.institution || `Education #${index + 1}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="space-y-4 p-4 border border-border rounded-lg relative bg-card"
      role="group"
      aria-label={`Education entry: ${summary}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing touch-none"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          <GraduationCap className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{summary}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => removeEducation(edu.id)}
          aria-label={`Remove ${summary}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Degree & Major <span className="text-destructive">*</span></Label>
          <Input
            placeholder="e.g. BSc Computer Science"
            value={edu.degree}
            onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
            aria-required="true"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Institution <span className="text-destructive">*</span></Label>
          <Input
            placeholder="e.g. University of Ghana"
            value={edu.institution}
            onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
            aria-required="true"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input
            placeholder="e.g. Accra, Ghana"
            value={edu.location}
            onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Start Date</Label>
          <Input
            placeholder="e.g. Sep 2020"
            value={edu.startDate}
            onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>End Date</Label>
          <Input
            placeholder="e.g. Jun 2024 or Expected Jun 2025"
            value={edu.endDate}
            onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>GPA (Optional)</Label>
        <Input
          placeholder="e.g. 3.8/4.0 or First Class"
          value={edu.gpa || ""}
          onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
          className="max-w-[200px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Achievements / Coursework</Label>
        {edu.bullets.map((bullet, idx) => (
          <div key={idx} className="flex gap-2">
            <Textarea
              placeholder="e.g. Dean's List 2023, Relevant coursework: Data Structures..."
              value={bullet}
              onChange={(e) => updateBullet(edu.id, idx, e.target.value)}
              rows={2}
              className="flex-1"
            />
            {edu.bullets.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeBullet(edu.id, idx)}
                aria-label="Remove bullet"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBullet(edu.id)}
          className="gap-1"
        >
          <Plus className="w-3 h-3" />
          Add Bullet
        </Button>
      </div>
    </div>
  );
};

export const EducationForm = ({ data, onChange }: EducationFormProps) => {
  const [education, setEducation] = useState<Education[]>(data);

  useEffect(() => { setEducation(data); }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      degree: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: "",
      coursework: "",
      bullets: [""],
    };
    const updated = [...education, newEducation];
    setEducation(updated);
    onChange(updated);
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    const updated = education.map((edu) =>
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    setEducation(updated);
    onChange(updated);
  };

  const updateBullet = (id: string, index: number, value: string) => {
    const updated = education.map((edu) => {
      if (edu.id === id) {
        const bullets = [...edu.bullets];
        bullets[index] = value;
        return { ...edu, bullets };
      }
      return edu;
    });
    setEducation(updated);
    onChange(updated);
  };

  const addBullet = (id: string) => {
    const updated = education.map((edu) =>
      edu.id === id ? { ...edu, bullets: [...edu.bullets, ""] } : edu
    );
    setEducation(updated);
    onChange(updated);
  };

  const removeBullet = (id: string, index: number) => {
    const updated = education.map((edu) => {
      if (edu.id === id && edu.bullets.length > 1) {
        const bullets = edu.bullets.filter((_, i) => i !== index);
        return { ...edu, bullets };
      }
      return edu;
    });
    setEducation(updated);
    onChange(updated);
  };

  const removeEducation = (id: string) => {
    const updated = education.filter((edu) => edu.id !== id);
    setEducation(updated);
    onChange(updated);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = education.findIndex((e) => e.id === active.id);
      const newIndex = education.findIndex((e) => e.id === over.id);
      const reordered = arrayMove(education, oldIndex, newIndex);
      setEducation(reordered);
      onChange(reordered);
    }
  };

  return (
    <div className="space-y-4" role="form" aria-label="Education">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Add your education, starting with the most recent.
          </p>
        </div>
        <Button onClick={addEducation} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {education.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <GraduationCap className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-2">No education added yet</p>
          <Button onClick={addEducation} variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Education
          </Button>
        </div>
      )}

      {education.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Include GPA only if it's 3.0+ or First/Second Class. Add relevant coursework for entry-level roles.
            </p>
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={education.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          {education.map((edu, index) => (
            <SortableEducationItem
              key={edu.id}
              edu={edu}
              index={index}
              updateEducation={updateEducation}
              updateBullet={updateBullet}
              addBullet={addBullet}
              removeBullet={removeBullet}
              removeEducation={removeEducation}
            />
          ))}
        </SortableContext>
      </DndContext>

      {education.length > 0 && (
        <Button onClick={addEducation} variant="outline" className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Add Another Education
        </Button>
      )}
    </div>
  );
};
