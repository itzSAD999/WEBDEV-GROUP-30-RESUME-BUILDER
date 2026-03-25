import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Type } from "lucide-react";

export type FontFamily = "sans" | "serif";

interface FontSelectorProps {
  value: FontFamily;
  onChange: (font: FontFamily) => void;
}

export const FontSelector = ({ value, onChange }: FontSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <Type className="w-4 h-4 text-muted-foreground" />
      <Label htmlFor="font-selector" className="text-sm font-medium whitespace-nowrap">
        Font
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as FontFamily)}>
        <SelectTrigger id="font-selector" className="w-[140px] h-8 text-sm">
          <SelectValue placeholder="Select font" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sans">
            <span className="font-resume-sans">Inter (Sans)</span>
          </SelectItem>
          <SelectItem value="serif">
            <span className="font-resume-serif">Times New Roman</span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
