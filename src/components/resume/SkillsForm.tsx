import { useState, useEffect, KeyboardEvent } from "react";
import { ResumeData, SkillCategory } from "@/types/resume";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Lightbulb, Wrench, Users, Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SkillsFormProps {
  data: ResumeData;
  onChange: (data: Partial<ResumeData>) => void;
}

export const SkillsForm = ({ data, onChange }: SkillsFormProps) => {
  const [technicalSkills, setTechnicalSkills] = useState<string[]>(data.technicalSkills);
  const [softSkills, setSoftSkills] = useState<string[]>(data.softSkills);
  const [interests, setInterests] = useState<string[]>(data.interests);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>(data.skillCategories || []);
  
  const [techInput, setTechInput] = useState("");
  const [softInput, setSoftInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryInputs, setCategoryInputs] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    setTechnicalSkills(data.technicalSkills);
    setSoftSkills(data.softSkills);
    setInterests(data.interests);
    setSkillCategories(data.skillCategories || []);
  }, [data.technicalSkills, data.softSkills, data.interests, data.skillCategories]);

  // Shared add skill function that handles comma-separated input
  const addSkills = (
    input: string,
    currentSkills: string[],
    setSkills: (s: string[]) => void,
    setInput: (s: string) => void,
    fieldKey: string
  ) => {
    const newSkills = input
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !currentSkills.includes(s));
    
    if (newSkills.length > 0) {
      const updated = [...currentSkills, ...newSkills];
      setSkills(updated);
      onChange({ [fieldKey]: updated });
    }
    setInput("");
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    input: string,
    currentSkills: string[],
    setSkills: (s: string[]) => void,
    setInput: (s: string) => void,
    fieldKey: string
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkills(input, currentSkills, setSkills, setInput, fieldKey);
    }
  };

  const removeSkill = (
    index: number,
    currentSkills: string[],
    setSkills: (s: string[]) => void,
    fieldKey: string
  ) => {
    const updated = currentSkills.filter((_, i) => i !== index);
    setSkills(updated);
    onChange({ [fieldKey]: updated });
  };

  const addSkillCategory = () => {
    if (newCategoryName.trim()) {
      const updated = [...skillCategories, { name: newCategoryName.trim(), skills: [] }];
      setSkillCategories(updated);
      onChange({ skillCategories: updated });
      setNewCategoryName("");
    }
  };

  const removeSkillCategory = (index: number) => {
    const updated = skillCategories.filter((_, i) => i !== index);
    setSkillCategories(updated);
    onChange({ skillCategories: updated });
  };

  const addSkillToCategory = (categoryIndex: number) => {
    const input = categoryInputs[categoryIndex];
    if (input?.trim()) {
      const newSkills = input.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const updated = [...skillCategories];
      updated[categoryIndex].skills.push(...newSkills);
      setSkillCategories(updated);
      onChange({ skillCategories: updated });
      setCategoryInputs({ ...categoryInputs, [categoryIndex]: "" });
    }
  };

  const removeSkillFromCategory = (categoryIndex: number, skillIndex: number) => {
    const updated = [...skillCategories];
    updated[categoryIndex].skills = updated[categoryIndex].skills.filter((_, i) => i !== skillIndex);
    setSkillCategories(updated);
    onChange({ skillCategories: updated });
  };

  return (
    <div className="space-y-4" role="form" aria-label="Skills & Interests">
      <Tabs defaultValue="technical" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="technical" className="gap-1 text-xs sm:text-sm">
            <Wrench className="w-3 h-3 hidden sm:block" />
            Technical
          </TabsTrigger>
          <TabsTrigger value="soft" className="gap-1 text-xs sm:text-sm">
            <Users className="w-3 h-3 hidden sm:block" />
            Soft Skills
          </TabsTrigger>
          <TabsTrigger value="interests" className="gap-1 text-xs sm:text-sm">
            <Heart className="w-3 h-3 hidden sm:block" />
            Interests
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-xs sm:text-sm">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="technical">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Technical Skills</CardTitle>
              <p className="text-xs text-muted-foreground">
                Add programming languages, frameworks, tools, and technologies you're proficient in.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a skill and press Enter (or use commas for multiple)"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, techInput, technicalSkills, setTechnicalSkills, setTechInput, "technicalSkills")}
                  aria-label="Add technical skill"
                />
                <Button onClick={() => addSkills(techInput, technicalSkills, setTechnicalSkills, setTechInput, "technicalSkills")}>Add</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Tip: Type multiple skills separated by commas (e.g., "Python, React, AWS")
              </p>
              {technicalSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {technicalSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="gap-1 pr-1 text-sm">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(index, technicalSkills, setTechnicalSkills, "technicalSkills")}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        aria-label={`Remove ${skill}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              {technicalSkills.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No technical skills added yet. Start typing above.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="soft">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Soft Skills</CardTitle>
              <p className="text-xs text-muted-foreground">
                Communication, leadership, teamwork, problem-solving, etc.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Leadership, Communication, Critical Thinking"
                  value={softInput}
                  onChange={(e) => setSoftInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, softInput, softSkills, setSoftSkills, setSoftInput, "softSkills")}
                  aria-label="Add soft skill"
                />
                <Button onClick={() => addSkills(softInput, softSkills, setSoftSkills, setSoftInput, "softSkills")}>Add</Button>
              </div>
              {softSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {softSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="gap-1 pr-1 text-sm">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(index, softSkills, setSoftSkills, "softSkills")}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        aria-label={`Remove ${skill}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interests">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Interests & Hobbies</CardTitle>
              <p className="text-xs text-muted-foreground">
                Personal interests that show personality. Great for building rapport in interviews.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Photography, Hiking, Open Source"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, interestInput, interests, setInterests, setInterestInput, "interests")}
                  aria-label="Add interest"
                />
                <Button onClick={() => addSkills(interestInput, interests, setInterests, setInterestInput, "interests")}>Add</Button>
              </div>
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="gap-1 pr-1 text-sm">
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeSkill(index, interests, setInterests, "interests")}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        aria-label={`Remove ${interest}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Custom Skill Categories</CardTitle>
              <p className="text-xs text-muted-foreground">
                Create custom sections like "Databases", "Cloud Services", "Design Tools", etc.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Add New Skill Section</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Databases, Cloud Services"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSkillCategory()}
                  />
                  <Button onClick={addSkillCategory}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              </div>

              {skillCategories.map((category, catIndex) => (
                <div key={catIndex} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">{category.name}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkillCategory(catIndex)}
                      className="text-destructive hover:text-destructive"
                      aria-label={`Remove ${category.name} category`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Add skill to ${category.name}`}
                      value={categoryInputs[catIndex] || ""}
                      onChange={(e) => setCategoryInputs({ ...categoryInputs, [catIndex]: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && addSkillToCategory(catIndex)}
                    />
                    <Button onClick={() => addSkillToCategory(catIndex)}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="gap-1 pr-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkillFromCategory(catIndex, skillIndex)}
                          className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                          aria-label={`Remove ${skill} from ${category.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}

              {skillCategories.length === 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Custom categories help organize specialized skills (e.g., "Design Tools: Figma, Sketch, Adobe XD").
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
