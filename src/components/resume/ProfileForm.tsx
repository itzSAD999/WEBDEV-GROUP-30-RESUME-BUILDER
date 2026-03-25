import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";

interface ProfileFormProps {
  data: string;
  onChange: (data: string) => void;
}

export const ProfileForm = ({ data, onChange }: ProfileFormProps) => {
  const [charCount, setCharCount] = useState(data.length);
  const { register, watch, reset } = useForm<{ profile: string }>({
    defaultValues: { profile: data },
  });

  // Sync form when data changes externally (e.g., CV import)
  useEffect(() => {
    reset({ profile: data });
    setCharCount(data.length);
  }, [data, reset]);

  useEffect(() => {
    const subscription = watch((data) => {
      const value = data.profile || "";
      setCharCount(value.length);
      onChange(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  const getCharCountColor = () => {
    if (charCount === 0) return "text-muted-foreground";
    if (charCount < 50) return "text-amber-500";
    if (charCount > 500) return "text-amber-500";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div className="space-y-4" role="form" aria-label="Professional Summary">
      <div className="space-y-2">
        <Label htmlFor="profile" className="text-base font-medium">Professional Summary</Label>
        <p className="text-sm text-muted-foreground">
          A brief overview of your experience and career goals. This is the first thing recruiters read.
        </p>
      </div>

      <Textarea
        id="profile"
        placeholder="Results-driven Software Engineer with 5+ years of experience building scalable web applications. Skilled in React, Node.js, and cloud architecture. Passionate about clean code and mentoring junior developers."
        rows={6}
        {...register("profile")}
        aria-describedby="profile-hint profile-count"
        className="resize-none"
      />

      <div className="flex items-center justify-between">
        <p id="profile-count" className={`text-xs ${getCharCountColor()}`}>
          {charCount} / 500 characters {charCount < 50 && charCount > 0 ? "(too short)" : charCount > 500 ? "(consider shortening)" : ""}
        </p>
      </div>

      <div id="profile-hint" className="bg-primary/5 border border-primary/20 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Writing Tips:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Start with your title and years of experience</li>
              <li>Mention 2–3 key skills or technologies</li>
              <li>Include a measurable achievement if possible</li>
              <li>Keep it under 4 sentences</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
