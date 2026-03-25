import { useState, useEffect } from "react";
import { ResumeData } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface InterestsFormProps {
  data: ResumeData;
  onChange: (data: Partial<ResumeData>) => void;
}

export const InterestsForm = ({ data, onChange }: InterestsFormProps) => {
  const [interests, setInterests] = useState<string[]>(data.interests || []);
  const [input, setInput] = useState("");

  useEffect(() => {
    setInterests(data.interests || []);
  }, [data.interests]);

  const addInterest = () => {
    if (input.trim()) {
      const updated = [...interests, input.trim()];
      setInterests(updated);
      onChange({ interests: updated });
      setInput("");
    }
  };

  const removeInterest = (index: number) => {
    const updated = interests.filter((_, i) => i !== index);
    setInterests(updated);
    onChange({ interests: updated });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add hobbies, interests, or activities that showcase your personality
      </p>

      <div className="flex gap-2">
        <Input
          placeholder="Add an interest (e.g., Photography, Hiking, Chess)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addInterest();
            }
          }}
        />
        <Button onClick={addInterest} className="gap-1">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {interests.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">No interests added yet</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {interests.map((interest, index) => (
            <Badge key={index} variant="secondary" className="gap-1 py-1.5 px-3">
              {interest}
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => removeInterest(index)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
