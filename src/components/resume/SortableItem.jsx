import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export const SortableItem = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <button
        type="button"
        style={{
          marginTop: "8px",
          padding: "4px",
          borderRadius: "4px",
          background: "transparent",
          border: "none",
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
          color: "var(--text-muted, #6b7599)",
          opacity: 0.5,
          transition: "opacity 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
};
