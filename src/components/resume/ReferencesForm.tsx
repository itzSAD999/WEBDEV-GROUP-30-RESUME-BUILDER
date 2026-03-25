import { useState } from "react";
import { ResumeData, Reference } from "@/types/resume";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, User, Lightbulb } from "lucide-react";

interface ReferencesFormProps {
  data: ResumeData;
  onChange: (data: Partial<ResumeData>) => void;
}

export const ReferencesForm = ({ data, onChange }: ReferencesFormProps) => {
  const references = data.references || [];

  const addReference = () => {
    const newRef: Reference = {
      id: Date.now().toString(),
      name: "",
      title: "",
      organization: "",
      email: "",
      phone: "",
      relationship: "",
    };
    onChange({ references: [...references, newRef] });
  };

  const updateReference = (index: number, field: keyof Reference, value: string) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ references: updated });
  };

  const removeReference = (index: number) => {
    const updated = references.filter((_, i) => i !== index);
    onChange({ references: updated });
  };

  return (
    <div className="space-y-4" role="form" aria-label="References">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Add professional references who can vouch for your skills and experience.
        </p>
        <Button onClick={addReference} size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {references.length === 0 ? (
        <div className="space-y-4">
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <User className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mb-3">
                No references added yet. Click "Add" to get started.
              </p>
              <Button onClick={addReference} variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Reference
              </Button>
            </CardContent>
          </Card>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Tip:</strong> References will appear on your CV as:</p>
                <div className="bg-background rounded p-2 font-mono text-[11px] mt-1">
                  <p>CEO, Harriet Adams</p>
                  <p>Progressive Healthy Foods LTD,</p>
                  <p>Phone: +233 244 781 112</p>
                  <p>Email: harriet@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {references.map((ref, index) => (
            <Card key={ref.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {ref.title && ref.name ? `${ref.title}, ${ref.name}` : ref.name || `Reference ${index + 1}`}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeReference(index)}
                    className="text-destructive hover:text-destructive"
                    aria-label={`Remove reference ${ref.name || index + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Full Name <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="e.g. Harriet Adams"
                      value={ref.name}
                      onChange={(e) => updateReference(index, "name", e.target.value)}
                      aria-required="true"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Job Title</Label>
                    <Input
                      placeholder="e.g. CEO, Teacher, Director"
                      value={ref.title}
                      onChange={(e) => updateReference(index, "title", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Appears before the name on your CV</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Organization</Label>
                  <Input
                    placeholder="e.g. Progressive Healthy Foods LTD"
                    value={ref.organization}
                    onChange={(e) => updateReference(index, "organization", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input
                      placeholder="e.g. +233 244 781 112"
                      value={ref.phone}
                      onChange={(e) => updateReference(index, "phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="e.g. harriet@gmail.com"
                      value={ref.email}
                      onChange={(e) => updateReference(index, "email", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button onClick={addReference} variant="outline" className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Add Another Reference
          </Button>
        </div>
      )}
    </div>
  );
};
