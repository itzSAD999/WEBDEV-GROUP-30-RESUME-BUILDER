import { useState, useEffect } from "react";
import { CustomSection, ResumeData } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface CustomSectionsFormProps {
  data: ResumeData;
  onChange: (data: Partial<ResumeData>) => void;
}

export const CustomSectionsForm = ({ data, onChange }: CustomSectionsFormProps) => {
  const [sections, setSections] = useState<CustomSection[]>(data.customSections || []);

  useEffect(() => { setSections(data.customSections || []); }, [data.customSections]);

  const addSection = () => {
    const newSection: CustomSection = {
      id: Date.now().toString(),
      title: "",
      bullets: [""],
    };
    const updated = [...sections, newSection];
    setSections(updated);
    onChange({ customSections: updated });
  };

  const updateSection = (id: string, field: keyof CustomSection, value: any) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, [field]: value } : sec
    );
    setSections(updated);
    onChange({ customSections: updated });
  };

  const updateBullet = (id: string, index: number, value: string) => {
    const updated = sections.map((sec) => {
      if (sec.id === id) {
        const bullets = [...sec.bullets];
        bullets[index] = value;
        return { ...sec, bullets };
      }
      return sec;
    });
    setSections(updated);
    onChange({ customSections: updated });
  };

  const addBullet = (id: string) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, bullets: [...sec.bullets, ""] } : sec
    );
    setSections(updated);
    onChange({ customSections: updated });
  };

  const removeBullet = (id: string, index: number) => {
    const updated = sections.map((sec) => {
      if (sec.id === id && sec.bullets.length > 1) {
        const bullets = sec.bullets.filter((_, i) => i !== index);
        return { ...sec, bullets };
      }
      return sec;
    });
    setSections(updated);
    onChange({ customSections: updated });
  };

  const removeSection = (id: string) => {
    const updated = sections.filter((sec) => sec.id !== id);
    setSections(updated);
    onChange({ customSections: updated });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Add custom sections for any additional information
        </p>
        <Button onClick={addSection} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Section
        </Button>
      </div>

      {sections.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground mb-2">No custom sections added yet</p>
          <Button onClick={addSection} variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Custom Section
          </Button>
        </div>
      )}

      {sections.map((section, index) => (
        <div
          key={section.id}
          className="space-y-4 p-4 border border-border rounded-lg relative bg-card"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Custom Section #{index + 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => removeSection(section.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Section Title</Label>
            <Input
              placeholder="e.g., Publications, Languages, Volunteer Work"
              value={section.title}
              onChange={(e) => updateSection(section.id, "title", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            {section.bullets.map((bullet, idx) => (
              <div key={idx} className="flex gap-2">
                <Textarea
                  placeholder="Add content..."
                  value={bullet}
                  onChange={(e) => updateBullet(section.id, idx, e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                {section.bullets.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeBullet(section.id, idx)}
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
              onClick={() => addBullet(section.id)}
              className="gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Bullet
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
