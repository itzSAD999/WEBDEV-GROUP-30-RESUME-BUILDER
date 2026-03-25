import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const categories = [
  "All",
  "Gaming",
  "Music",
  "Technology",
  "Cooking",
  "Travel",
  "Fitness",
  "Education",
  "Entertainment",
  "Sports",
];

export const CategoryTabs = () => {
  return (
    <div className="border-b border-border bg-background">
      <ScrollArea className="w-full">
        <div className="flex gap-2 px-4 py-3">
          {categories.map((category, index) => (
            <Button
              key={category}
              variant={index === 0 ? "default" : "secondary"}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
