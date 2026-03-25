import { useState, useEffect } from "react";
import { VolunteerExperience, ResumeData } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, GripVertical } from "lucide-react";
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

interface VolunteeringFormProps {
  data: ResumeData;
  onChange: (data: Partial<ResumeData>) => void;
}

const SortableVolunteerItem = ({
  vol,
  index,
  updateVolunteer,
  updateResponsibility,
  addResponsibility,
  removeResponsibility,
  removeVolunteer,
}: {
  vol: VolunteerExperience;
  index: number;
  updateVolunteer: (id: string, field: keyof VolunteerExperience, value: any) => void;
  updateResponsibility: (id: string, index: number, value: string) => void;
  addResponsibility: (id: string) => void;
  removeResponsibility: (id: string, index: number) => void;
  removeVolunteer: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: vol.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="space-y-4 p-4 border border-border rounded-lg relative bg-card"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-medium text-muted-foreground">Activity #{index + 1}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => removeVolunteer(vol.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Role / Title</Label>
        <Input
          placeholder="Volunteer Coordinator, Event Organizer..."
          value={vol.title}
          onChange={(e) => updateVolunteer(vol.id, "title", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Organization</Label>
        <Input
          placeholder="Red Cross, Local Community Center..."
          value={vol.organization}
          onChange={(e) => updateVolunteer(vol.id, "organization", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Location (Optional)</Label>
        <Input
          placeholder="City, State"
          value={vol.location || ""}
          onChange={(e) => updateVolunteer(vol.id, "location", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input
            placeholder="Jan 2023"
            value={vol.startDate}
            onChange={(e) => updateVolunteer(vol.id, "startDate", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input
            placeholder="Present"
            value={vol.endDate}
            disabled={vol.current}
            onChange={(e) => updateVolunteer(vol.id, "endDate", e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id={`current-vol-${vol.id}`}
          checked={vol.current}
          onCheckedChange={(checked) => {
            updateVolunteer(vol.id, "current", checked);
            if (checked) updateVolunteer(vol.id, "endDate", "Present");
          }}
        />
        <Label htmlFor={`current-vol-${vol.id}`} className="text-sm">Currently active</Label>
      </div>

      <div className="space-y-2">
        <Label>Key Responsibilities & Achievements</Label>
        {vol.responsibilities.map((resp, idx) => (
          <div key={idx} className="flex gap-2">
            <Textarea
              placeholder="Organized events for 50+ participants..."
              value={resp}
              onChange={(e) => updateResponsibility(vol.id, idx, e.target.value)}
              rows={2}
              className="flex-1"
            />
            {vol.responsibilities.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeResponsibility(vol.id, idx)}
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
          onClick={() => addResponsibility(vol.id)}
          className="gap-1"
        >
          <Plus className="w-3 h-3" />
          Add Bullet Point
        </Button>
      </div>
    </div>
  );
};

export const VolunteeringForm = ({ data, onChange }: VolunteeringFormProps) => {
  const [volunteering, setVolunteering] = useState<VolunteerExperience[]>(data.volunteering || []);

  useEffect(() => { setVolunteering(data.volunteering || []); }, [data.volunteering]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addVolunteer = () => {
    const newVol: VolunteerExperience = {
      id: Date.now().toString(),
      title: "",
      organization: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      responsibilities: [""],
    };
    const updated = [...volunteering, newVol];
    setVolunteering(updated);
    onChange({ volunteering: updated });
  };

  const updateVolunteer = (id: string, field: keyof VolunteerExperience, value: any) => {
    const updated = volunteering.map((vol) =>
      vol.id === id ? { ...vol, [field]: value } : vol
    );
    setVolunteering(updated);
    onChange({ volunteering: updated });
  };

  const updateResponsibility = (id: string, index: number, value: string) => {
    const updated = volunteering.map((vol) => {
      if (vol.id === id) {
        const responsibilities = [...vol.responsibilities];
        responsibilities[index] = value;
        return { ...vol, responsibilities };
      }
      return vol;
    });
    setVolunteering(updated);
    onChange({ volunteering: updated });
  };

  const addResponsibility = (id: string) => {
    const updated = volunteering.map((vol) =>
      vol.id === id ? { ...vol, responsibilities: [...vol.responsibilities, ""] } : vol
    );
    setVolunteering(updated);
    onChange({ volunteering: updated });
  };

  const removeResponsibility = (id: string, index: number) => {
    const updated = volunteering.map((vol) => {
      if (vol.id === id && vol.responsibilities.length > 1) {
        const responsibilities = vol.responsibilities.filter((_, i) => i !== index);
        return { ...vol, responsibilities };
      }
      return vol;
    });
    setVolunteering(updated);
    onChange({ volunteering: updated });
  };

  const removeVolunteer = (id: string) => {
    const updated = volunteering.filter((vol) => vol.id !== id);
    setVolunteering(updated);
    onChange({ volunteering: updated });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = volunteering.findIndex((v) => v.id === active.id);
      const newIndex = volunteering.findIndex((v) => v.id === over.id);
      const reordered = arrayMove(volunteering, oldIndex, newIndex);
      setVolunteering(reordered);
      onChange({ volunteering: reordered });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Add volunteer work, extracurricular activities, or community involvement
        </p>
        <Button onClick={addVolunteer} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {volunteering.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground mb-2">No volunteering or activities added yet</p>
          <Button onClick={addVolunteer} variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Activity
          </Button>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={volunteering.map((v) => v.id)} strategy={verticalListSortingStrategy}>
          {volunteering.map((vol, index) => (
            <SortableVolunteerItem
              key={vol.id}
              vol={vol}
              index={index}
              updateVolunteer={updateVolunteer}
              updateResponsibility={updateResponsibility}
              addResponsibility={addResponsibility}
              removeResponsibility={removeResponsibility}
              removeVolunteer={removeVolunteer}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Bottom Add Button */}
      {volunteering.length > 0 && (
        <Button onClick={addVolunteer} variant="outline" className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Add Another Activity
        </Button>
      )}
    </div>
  );
};