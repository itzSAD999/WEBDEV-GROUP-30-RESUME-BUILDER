import { useState, useEffect } from "react";
import { WorkExperience, LeadershipExperience, ResumeData } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Lightbulb, GripVertical } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface WorkExperienceFormProps {
  data: ResumeData;
  onChange: (data: Partial<ResumeData>) => void;
}

const RESPONSIBILITY_TIPS = [
  "Accomplished X by implementing Y which led to Z",
  "Increased revenue by 20% through new feature implementation",
  "Led a team of 5 engineers to deliver project 2 weeks ahead of schedule",
  "Reduced page load time by 40% through performance optimization",
];

const SortableWorkItem = ({
  work,
  index,
  updateWork,
  updateWorkResponsibility,
  addWorkResponsibility,
  removeWorkResponsibility,
  removeWork,
}: {
  work: WorkExperience;
  index: number;
  updateWork: (id: string, field: keyof WorkExperience, value: any) => void;
  updateWorkResponsibility: (id: string, index: number, value: string) => void;
  addWorkResponsibility: (id: string) => void;
  removeWorkResponsibility: (id: string, index: number) => void;
  removeWork: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: work.id,
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
          <span className="text-sm font-medium text-muted-foreground">Position #{index + 1}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => removeWork(work.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Job Title</Label>
        <Input
          placeholder="Software Engineer"
          value={work.title}
          onChange={(e) => updateWork(work.id, "title", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Company</Label>
        <Input
          placeholder="Google, Microsoft, etc."
          value={work.company}
          onChange={(e) => updateWork(work.id, "company", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <Input
          placeholder="San Francisco, CA or Remote"
          value={work.location}
          onChange={(e) => updateWork(work.id, "location", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input
            placeholder="Jan 2023"
            value={work.startDate}
            onChange={(e) => updateWork(work.id, "startDate", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input
            placeholder="Present"
            value={work.endDate}
            disabled={work.current}
            onChange={(e) => updateWork(work.id, "endDate", e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id={`current-${work.id}`}
          checked={work.current}
          onCheckedChange={(checked: boolean) => {
            updateWork(work.id, "current", checked);
            if (checked) updateWork(work.id, "endDate", "Present");
          }}
        />
        <Label htmlFor={`current-${work.id}`} className="text-sm cursor-pointer">Currently working here</Label>
      </div>

      <div className="space-y-2">
        <Label>Key Achievements & Responsibilities</Label>
        {work.responsibilities.map((resp, idx) => (
          <div key={idx} className="flex gap-2">
            <Textarea
              placeholder="Accomplished X by implementing Y which led to Z..."
              value={resp}
              onChange={(e) => updateWorkResponsibility(work.id, idx, e.target.value)}
              rows={2}
              className="flex-1"
            />
            {work.responsibilities.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeWorkResponsibility(work.id, idx)}
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
          onClick={() => addWorkResponsibility(work.id)}
          className="gap-1"
        >
          <Plus className="w-3 h-3" />
          Add Bullet Point
        </Button>
      </div>
    </div>
  );
};

export const WorkExperienceForm = ({ data, onChange }: WorkExperienceFormProps) => {
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>(data.workExperience);
  const [leadership, setLeadership] = useState<LeadershipExperience[]>(data.leadership);

  useEffect(() => {
    setWorkExperience(data.workExperience);
    setLeadership(data.leadership);
  }, [data.workExperience, data.leadership]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addWork = () => {
    const newWork: WorkExperience = {
      id: Date.now().toString(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      responsibilities: [""],
    };
    const updated = [...workExperience, newWork];
    setWorkExperience(updated);
    onChange({ workExperience: updated });
  };

  const updateWork = (id: string, field: keyof WorkExperience, value: any) => {
    const updated = workExperience.map((work) =>
      work.id === id ? { ...work, [field]: value } : work
    );
    setWorkExperience(updated);
    onChange({ workExperience: updated });
  };

  const updateWorkResponsibility = (id: string, index: number, value: string) => {
    const updated = workExperience.map((work) => {
      if (work.id === id) {
        const responsibilities = [...work.responsibilities];
        responsibilities[index] = value;
        return { ...work, responsibilities };
      }
      return work;
    });
    setWorkExperience(updated);
    onChange({ workExperience: updated });
  };

  const addWorkResponsibility = (id: string) => {
    const updated = workExperience.map((work) =>
      work.id === id ? { ...work, responsibilities: [...work.responsibilities, ""] } : work
    );
    setWorkExperience(updated);
    onChange({ workExperience: updated });
  };

  const removeWorkResponsibility = (id: string, index: number) => {
    const updated = workExperience.map((work) => {
      if (work.id === id && work.responsibilities.length > 1) {
        const responsibilities = work.responsibilities.filter((_, i) => i !== index);
        return { ...work, responsibilities };
      }
      return work;
    });
    setWorkExperience(updated);
    onChange({ workExperience: updated });
  };

  const removeWork = (id: string) => {
    const updated = workExperience.filter((work) => work.id !== id);
    setWorkExperience(updated);
    onChange({ workExperience: updated });
  };

  const addLeadership = () => {
    const newLeadership: LeadershipExperience = {
      id: Date.now().toString(),
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      current: false,
      responsibilities: [""],
    };
    const updated = [...leadership, newLeadership];
    setLeadership(updated);
    onChange({ leadership: updated });
  };

  const updateLeadership = (id: string, field: keyof LeadershipExperience, value: any) => {
    const updated = leadership.map((lead) =>
      lead.id === id ? { ...lead, [field]: value } : lead
    );
    setLeadership(updated);
    onChange({ leadership: updated });
  };

  const updateLeadershipResponsibility = (id: string, index: number, value: string) => {
    const updated = leadership.map((lead) => {
      if (lead.id === id) {
        const responsibilities = [...lead.responsibilities];
        responsibilities[index] = value;
        return { ...lead, responsibilities };
      }
      return lead;
    });
    setLeadership(updated);
    onChange({ leadership: updated });
  };

  const addLeadershipResponsibility = (id: string) => {
    const updated = leadership.map((lead) =>
      lead.id === id ? { ...lead, responsibilities: [...lead.responsibilities, ""] } : lead
    );
    setLeadership(updated);
    onChange({ leadership: updated });
  };

  const removeLeadership = (id: string) => {
    const updated = leadership.filter((lead) => lead.id !== id);
    setLeadership(updated);
    onChange({ leadership: updated });
  };

  return (
    <Tabs defaultValue="work" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="work">Work Experience</TabsTrigger>
        <TabsTrigger value="leadership">Leadership</TabsTrigger>
      </TabsList>

      <TabsContent value="work">
        <div className="space-y-4">
          {/* Tips Box */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Writing Effective Bullet Points</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {RESPONSIBILITY_TIPS.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Start with your most recent position</p>
            <Button onClick={addWork} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          {workExperience.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <p className="text-muted-foreground mb-2">No work experience added yet</p>
              <Button onClick={addWork} variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Work Experience
              </Button>
            </div>
          )}

          {workExperience.map((work, index) => (
            <div key={work.id} className="space-y-4 p-4 border border-border rounded-lg relative bg-card">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Position #{index + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removeWork(work.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  placeholder="Software Engineer"
                  value={work.title}
                  onChange={(e) => updateWork(work.id, "title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  placeholder="Google, Microsoft, etc."
                  value={work.company}
                  onChange={(e) => updateWork(work.id, "company", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="San Francisco, CA or Remote"
                  value={work.location}
                  onChange={(e) => updateWork(work.id, "location", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    placeholder="Jan 2023"
                    value={work.startDate}
                    onChange={(e) => updateWork(work.id, "startDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    placeholder="Present"
                    value={work.endDate}
                    disabled={work.current}
                    onChange={(e) => updateWork(work.id, "endDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`current-${work.id}`}
                  checked={work.current}
                  onCheckedChange={(checked) => {
                    updateWork(work.id, "current", checked);
                    if (checked) updateWork(work.id, "endDate", "Present");
                  }}
                />
                <Label htmlFor={`current-${work.id}`} className="text-sm">Currently working here</Label>
              </div>

              <div className="space-y-2">
                <Label>Key Achievements & Responsibilities</Label>
                {work.responsibilities.map((resp, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Textarea
                      placeholder="Accomplished X by implementing Y which led to Z..."
                      value={resp}
                      onChange={(e) => updateWorkResponsibility(work.id, idx, e.target.value)}
                      rows={2}
                      className="flex-1"
                    />
                    {work.responsibilities.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeWorkResponsibility(work.id, idx)}
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
                  onClick={() => addWorkResponsibility(work.id)}
                  className="gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Bullet Point
                </Button>
              </div>
            </div>
          ))}
          
          {/* Bottom Add Button */}
          {workExperience.length > 0 && (
            <Button onClick={addWork} variant="outline" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add Another Position
            </Button>
          )}
        </div>
      </TabsContent>

      <TabsContent value="leadership">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Add clubs, volunteer work, or leadership roles</p>
            <Button onClick={addLeadership} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          {leadership.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <p className="text-muted-foreground mb-2">No leadership experience added yet</p>
              <Button onClick={addLeadership} variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Leadership
              </Button>
            </div>
          )}

          {leadership.map((lead, index) => (
            <div key={lead.id} className="space-y-4 p-4 border border-border rounded-lg relative bg-card">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Role #{index + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removeLeadership(lead.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Title / Role</Label>
                <Input
                  placeholder="President, Team Lead, Volunteer Coordinator"
                  value={lead.title}
                  onChange={(e) => updateLeadership(lead.id, "title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Organization</Label>
                <Input
                  placeholder="Tech Club, Student Government, NGO Name"
                  value={lead.organization}
                  onChange={(e) => updateLeadership(lead.id, "organization", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    placeholder="Jan 2023"
                    value={lead.startDate}
                    onChange={(e) => updateLeadership(lead.id, "startDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    placeholder="Present"
                    value={lead.endDate}
                    disabled={lead.current}
                    onChange={(e) => updateLeadership(lead.id, "endDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`current-lead-${lead.id}`}
                  checked={lead.current}
                  onCheckedChange={(checked) => {
                    updateLeadership(lead.id, "current", checked);
                    if (checked) updateLeadership(lead.id, "endDate", "Present");
                  }}
                />
                <Label htmlFor={`current-lead-${lead.id}`} className="text-sm">Current position</Label>
              </div>

              <div className="space-y-2">
                <Label>Key Responsibilities</Label>
                {lead.responsibilities.map((resp, idx) => (
                  <Textarea
                    key={idx}
                    placeholder="Organized events for 100+ members..."
                    value={resp}
                    onChange={(e) => updateLeadershipResponsibility(lead.id, idx, e.target.value)}
                    rows={2}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addLeadershipResponsibility(lead.id)}
                  className="gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Bullet Point
                </Button>
              </div>
            </div>
          ))}
          
          {/* Bottom Add Button */}
          {leadership.length > 0 && (
            <Button onClick={addLeadership} variant="outline" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add Another Leadership Role
            </Button>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};
