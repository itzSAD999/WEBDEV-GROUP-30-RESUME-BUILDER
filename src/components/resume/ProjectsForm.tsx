import { useState, useEffect } from "react";
import { Project, Achievement, Certification, ResumeData } from "@/types/resume";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical } from "lucide-react";
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

interface ProjectsFormProps {
  data: ResumeData;
  onChange: (data: Partial<ResumeData>) => void;
}

const SortableProjectItem = ({
  proj,
  updateProject,
  updateProjectDescription,
  addProjectDescription,
  removeProjectDescription,
  removeProject,
}: {
  proj: Project;
  updateProject: (id: string, field: keyof Project, value: any) => void;
  updateProjectDescription: (id: string, index: number, value: string) => void;
  addProjectDescription: (id: string) => void;
  removeProjectDescription: (id: string, index: number) => void;
  removeProject: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: proj.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-4 p-4 border border-border rounded-lg relative">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={() => removeProject(proj.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-2">
        <Label>Project Title</Label>
        <Input
          placeholder="Amazing Project"
          value={proj.title}
          onChange={(e) => updateProject(proj.id, "title", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input
            placeholder="Jan 2024"
            value={proj.startDate}
            onChange={(e) => updateProject(proj.id, "startDate", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>End Date (Optional)</Label>
          <Input
            placeholder="Present or leave blank"
            value={proj.endDate || ""}
            onChange={(e) => updateProject(proj.id, "endDate", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Role (Optional)</Label>
        <Input
          placeholder="Lead Developer"
          value={proj.role}
          onChange={(e) => updateProject(proj.id, "role", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Technologies Used</Label>
        <Input
          placeholder="React, Node.js, PostgreSQL"
          value={proj.technologies || ""}
          onChange={(e) => updateProject(proj.id, "technologies", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        {proj.description.map((desc, index) => (
          <div key={index} className="flex gap-2">
            <Textarea
              placeholder="Describe the project..."
              value={desc}
              onChange={(e) => updateProjectDescription(proj.id, index, e.target.value)}
              rows={2}
              className="flex-1"
            />
            {proj.description.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeProjectDescription(proj.id, index)}
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
          onClick={() => addProjectDescription(proj.id)}
          className="gap-1"
        >
          <Plus className="w-3 h-3" />
          Add Bullet
        </Button>
      </div>
    </div>
  );
};

export const ProjectsForm = ({ data, onChange }: ProjectsFormProps) => {
  const [projects, setProjects] = useState<Project[]>(data.projects);
  const [achievements, setAchievements] = useState<Achievement[]>(data.achievements);
  const [certifications, setCertifications] = useState<Certification[]>(data.certifications);

  useEffect(() => {
    setProjects(data.projects);
    setAchievements(data.achievements);
    setCertifications(data.certifications);
  }, [data.projects, data.achievements, data.certifications]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Projects
  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: "",
      startDate: "",
      endDate: "",
      role: "",
      technologies: "",
      description: [""],
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    onChange({ projects: updated });
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    const updated = projects.map((proj) =>
      proj.id === id ? { ...proj, [field]: value } : proj
    );
    setProjects(updated);
    onChange({ projects: updated });
  };

  const updateProjectDescription = (id: string, index: number, value: string) => {
    const updated = projects.map((proj) => {
      if (proj.id === id) {
        const description = [...proj.description];
        description[index] = value;
        return { ...proj, description };
      }
      return proj;
    });
    setProjects(updated);
    onChange({ projects: updated });
  };

  const addProjectDescription = (id: string) => {
    const updated = projects.map((proj) =>
      proj.id === id ? { ...proj, description: [...proj.description, ""] } : proj
    );
    setProjects(updated);
    onChange({ projects: updated });
  };

  const removeProjectDescription = (id: string, index: number) => {
    const updated = projects.map((proj) => {
      if (proj.id === id && proj.description.length > 1) {
        const description = proj.description.filter((_, i) => i !== index);
        return { ...proj, description };
      }
      return proj;
    });
    setProjects(updated);
    onChange({ projects: updated });
  };

  const removeProject = (id: string) => {
    const updated = projects.filter((proj) => proj.id !== id);
    setProjects(updated);
    onChange({ projects: updated });
  };

  const handleProjectDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);
      const reordered = arrayMove(projects, oldIndex, newIndex);
      setProjects(reordered);
      onChange({ projects: reordered });
    }
  };

  // Achievements
  const addAchievement = () => {
    const newAchievement: Achievement = {
      id: Date.now().toString(),
      title: "",
      date: "",
      organization: "",
    };
    const updated = [...achievements, newAchievement];
    setAchievements(updated);
    onChange({ achievements: updated });
  };

  const updateAchievement = (id: string, field: keyof Achievement, value: string) => {
    const updated = achievements.map((ach) =>
      ach.id === id ? { ...ach, [field]: value } : ach
    );
    setAchievements(updated);
    onChange({ achievements: updated });
  };

  const removeAchievement = (id: string) => {
    const updated = achievements.filter((ach) => ach.id !== id);
    setAchievements(updated);
    onChange({ achievements: updated });
  };

  // Certifications
  const addCertification = () => {
    const newCert: Certification = {
      id: Date.now().toString(),
      name: "",
      date: "",
      issuer: "",
    };
    const updated = [...certifications, newCert];
    setCertifications(updated);
    onChange({ certifications: updated });
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    const updated = certifications.map((cert) =>
      cert.id === id ? { ...cert, [field]: value } : cert
    );
    setCertifications(updated);
    onChange({ certifications: updated });
  };

  const removeCertification = (id: string) => {
    const updated = certifications.filter((cert) => cert.id !== id);
    setCertifications(updated);
    onChange({ certifications: updated });
  };

  return (
    <Tabs defaultValue="projects" className="w-full">
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="projects">Projects & Research</TabsTrigger>
        <TabsTrigger value="achievements">Awards</TabsTrigger>
        <TabsTrigger value="certifications">Certifications</TabsTrigger>
      </TabsList>

      <TabsContent value="projects">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Projects & Research</CardTitle>
            <Button onClick={addProject} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Project
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {projects.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No projects added yet.</p>
            )}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleProjectDragEnd}>
              <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                {projects.map((proj) => (
                  <SortableProjectItem
                    key={proj.id}
                    proj={proj}
                    updateProject={updateProject}
                    updateProjectDescription={updateProjectDescription}
                    addProjectDescription={addProjectDescription}
                    removeProjectDescription={removeProjectDescription}
                    removeProject={removeProject}
                  />
                ))}
              </SortableContext>
            </DndContext>
            
            {/* Bottom Add Button */}
            {projects.length > 0 && (
              <Button onClick={addProject} variant="outline" className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Another Project
              </Button>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="achievements">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Achievements & Awards</CardTitle>
            <Button onClick={addAchievement} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Award
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {achievements.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No achievements added yet.</p>
            )}
            {achievements.map((ach) => (
              <div key={ach.id} className="space-y-4 p-4 border border-border rounded-lg relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => removeAchievement(ach.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="space-y-2">
                  <Label>Award Title</Label>
                  <Input
                    placeholder="Best Innovation Award"
                    value={ach.title}
                    onChange={(e) => updateAchievement(ach.id, "title", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      placeholder="December 2024"
                      value={ach.date}
                      onChange={(e) => updateAchievement(ach.id, "date", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Organization</Label>
                    <Input
                      placeholder="Awarding Organization"
                      value={ach.organization}
                      onChange={(e) => updateAchievement(ach.id, "organization", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Bottom Add Button */}
            {achievements.length > 0 && (
              <Button onClick={addAchievement} variant="outline" className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Another Award
              </Button>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="certifications">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Certifications</CardTitle>
            <Button onClick={addCertification} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Certification
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {certifications.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No certifications added yet.</p>
            )}
            {certifications.map((cert) => (
              <div key={cert.id} className="space-y-4 p-4 border border-border rounded-lg relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => removeCertification(cert.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="space-y-2">
                  <Label>Certification Name</Label>
                  <Input
                    placeholder="AWS Certified Solutions Architect"
                    value={cert.name}
                    onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      placeholder="May 2024"
                      value={cert.date}
                      onChange={(e) => updateCertification(cert.id, "date", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Issuer</Label>
                    <Input
                      placeholder="Amazon Web Services"
                      value={cert.issuer}
                      onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Bottom Add Button */}
            {certifications.length > 0 && (
              <Button onClick={addCertification} variant="outline" className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Another Certification
              </Button>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
