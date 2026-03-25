import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// CSS styles injected via template literal
const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --danger: #f75f5f;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }
  .vol-container {
    display: flex; flex-direction: column; gap: 16px;
    font-family: var(--font); color: var(--text);
  }
  .vol-header {
    display: flex; align-items: center; justify-content: space-between;
  }
  .vol-desc { font-size: 13.5px; color: var(--text-muted); }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--r-sm);
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: all 0.2s; border: none; background: transparent; color: var(--text);
  }
  .btn-outline { border: 1px solid var(--border); background: var(--surface2); }
  .btn-outline:hover { background: var(--border); }
  .btn-ghost { padding: 6px; }
  .btn-ghost:hover { background: var(--surface2); }
  .btn-danger { color: var(--danger); }
  .btn-danger:hover { color: #ff7b7b; background: rgba(247, 95, 95, 0.1); }
  
  .empty-state {
    text-align: center; padding: 32px 16px;
    border: 2px dashed var(--border); border-radius: var(--r);
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }

  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); padding: 16px;
    display: flex; flex-direction: column; gap: 16px; position: relative;
  }
  .card-header {
    display: flex; align-items: center; justify-content: space-between;
  }
  .card-title-group {
    display: flex; align-items: center; gap: 8px;
  }
  .drag-handle {
    cursor: grab; color: var(--text-muted); padding: 4px;
    border-radius: 4px; transition: background 0.2s;
  }
  .drag-handle:hover { background: var(--surface2); }
  .card-title { font-size: 13.5px; font-weight: 500; color: var(--text-muted); }
  
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-row-2 { display: grid; grid-template-columns: 1fr; gap: 16px; }
  @media (min-width: 640px) { .form-row-2 { grid-template-columns: 1fr 1fr; } }
  
  .form-label { font-size: 13px; font-weight: 500; }
  .form-input {
    width: 100%; min-height: 40px; padding: 8px 12px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--r-sm); color: var(--text);
    font-family: var(--font); font-size: 13.5px;
    outline: none; transition: border-color 0.15s;
  }
  .form-input:focus { border-color: var(--accent); }
  .form-input:disabled { opacity: 0.5; cursor: not-allowed; }
  
  .form-textarea {
    width: 100%; min-height: 60px; padding: 8px 12px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--r-sm); color: var(--text);
    font-family: var(--font); font-size: 13.5px;
    outline: none; resize: vertical; transition: border-color 0.15s;
  }
  .form-textarea:focus { border-color: var(--accent); }
  
  .checkbox-group { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
  .checkbox-custom { width: 16px; height: 16px; cursor: pointer; }
  .bullet-row { display: flex; gap: 8px; align-items: flex-start; }
  .flex-1 { flex: 1; }
\`;

const SortableVolunteerItem = ({
  vol,
  index,
  updateVolunteer,
  updateResponsibility,
  addResponsibility,
  removeResponsibility,
  removeVolunteer,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: vol.id,
  });

  const blockStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={blockStyle} className="card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="drag-handle" {...attributes} {...listeners}>
            <GripVertical size={16} />
          </div>
          <span className="card-title">Activity #{index + 1}</span>
        </div>
        <button className="btn btn-ghost btn-danger" onClick={() => removeVolunteer(vol.id)}>
          <Trash2 size={16} />
        </button>
      </div>

      <div className="form-group">
        <label className="form-label">Role / Title</label>
        <input
          className="form-input"
          placeholder="Volunteer Coordinator, Event Organizer..."
          value={vol.title}
          onChange={(e) => updateVolunteer(vol.id, "title", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Organization</label>
        <input
          className="form-input"
          placeholder="Red Cross, Local Community Center..."
          value={vol.organization}
          onChange={(e) => updateVolunteer(vol.id, "organization", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Location (Optional)</label>
        <input
          className="form-input"
          placeholder="City, State"
          value={vol.location || ""}
          onChange={(e) => updateVolunteer(vol.id, "location", e.target.value)}
        />
      </div>

      <div className="form-row-2">
        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input
            className="form-input"
            placeholder="Jan 2023"
            value={vol.startDate}
            onChange={(e) => updateVolunteer(vol.id, "startDate", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">End Date</label>
          <input
            className="form-input"
            placeholder="Present"
            value={vol.endDate}
            disabled={vol.current}
            onChange={(e) => updateVolunteer(vol.id, "endDate", e.target.value)}
          />
        </div>
      </div>

      <div className="checkbox-group">
        <input
          type="checkbox"
          id={\`current-vol-\${vol.id}\`}
          className="checkbox-custom"
          checked={vol.current}
          onChange={(e) => {
            const checked = e.target.checked;
            updateVolunteer(vol.id, "current", checked);
            if (checked) updateVolunteer(vol.id, "endDate", "Present");
          }}
        />
        <label htmlFor={\`current-vol-\${vol.id}\`} className="form-label cursor-pointer" style={{cursor: 'pointer'}}>
          Currently active
        </label>
      </div>

      <div className="form-group">
        <label className="form-label">Key Responsibilities & Achievements</label>
        {vol.responsibilities.map((resp, idx) => (
          <div key={idx} className="bullet-row">
            <textarea
              className="form-textarea flex-1"
              placeholder="Organized events for 50+ participants..."
              value={resp}
              onChange={(e) => updateResponsibility(vol.id, idx, e.target.value)}
              rows={2}
            />
            {vol.responsibilities.length > 1 && (
              <button
                className="btn btn-ghost btn-danger"
                onClick={() => removeResponsibility(vol.id, idx)}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
        <button
          className="btn btn-outline"
          onClick={() => addResponsibility(vol.id)}
          style={{ width: 'fit-content', marginTop: '4px' }}
        >
          <Plus size={14} /> Add Bullet Point
        </button>
      </div>
    </div>
  );
};

export const VolunteeringForm = ({ data, onChange }) => {
  const [volunteering, setVolunteering] = useState(data.volunteering || []);

  useEffect(() => { setVolunteering(data.volunteering || []); }, [data.volunteering]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addVolunteer = () => {
    const newVol = {
      id: Date.now().toString(),
      title: "", organization: "", location: "",
      startDate: "", endDate: "", current: false,
      responsibilities: [""],
    };
    const updated = [...volunteering, newVol];
    setVolunteering(updated);
    onChange({ volunteering: updated });
  };

  const updateVolunteer = (id, field, value) => {
    const updated = volunteering.map((vol) => vol.id === id ? { ...vol, [field]: value } : vol);
    setVolunteering(updated);
    onChange({ volunteering: updated });
  };

  const updateResponsibility = (id, index, value) => {
    const updated = volunteering.map((vol) => {
      if (vol.id === id) {
        const responsibilities = [...vol.responsibilities];
        responsibilities[index] = value;
        return { ...vol, responsibilities };
      }
      return vol;
    });
    setVolunteering(updated);
    onChange({ volunteering: updated });
  };

  const addResponsibility = (id) => {
    const updated = volunteering.map((vol) =>
      vol.id === id ? { ...vol, responsibilities: [...vol.responsibilities, ""] } : vol
    );
    setVolunteering(updated);
    onChange({ volunteering: updated });
  };

  const removeResponsibility = (id, index) => {
    const updated = volunteering.map((vol) => {
      if (vol.id === id && vol.responsibilities.length > 1) {
        const responsibilities = vol.responsibilities.filter((_, i) => i !== index);
        return { ...vol, responsibilities };
      }
      return vol;
    });
    setVolunteering(updated);
    onChange({ volunteering: updated });
  };

  const removeVolunteer = (id) => {
    const updated = volunteering.filter((vol) => vol.id !== id);
    setVolunteering(updated);
    onChange({ volunteering: updated });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = volunteering.findIndex((v) => v.id === active.id);
      const newIndex = volunteering.findIndex((v) => v.id === over.id);
      const reordered = arrayMove(volunteering, oldIndex, newIndex);
      setVolunteering(reordered);
      onChange({ volunteering: reordered });
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="vol-container" role="form" aria-label="Volunteer Experience">
        <div className="vol-header">
          <p className="vol-desc">Add volunteer work, extracurricular activities, or community involvement</p>
          <button className="btn btn-outline" onClick={addVolunteer}>
            <Plus size={14} /> Add
          </button>
        </div>

        {volunteering.length === 0 && (
          <div className="empty-state">
            <p className="vol-desc" style={{ marginBottom: '8px' }}>No volunteering or activities added yet</p>
            <button className="btn btn-outline" onClick={addVolunteer}>
              <Plus size={14} /> Add Activity
            </button>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={volunteering.map((v) => v.id)} strategy={verticalListSortingStrategy}>
            {volunteering.map((vol, index) => (
              <SortableVolunteerItem
                key={vol.id}
                vol={vol}
                index={index}
                updateVolunteer={updateVolunteer}
                updateResponsibility={updateResponsibility}
                addResponsibility={addResponsibility}
                removeResponsibility={removeResponsibility}
                removeVolunteer={removeVolunteer}
              />
            ))}
          </SortableContext>
        </DndContext>

        {volunteering.length > 0 && (
          <button className="btn btn-outline" onClick={addVolunteer} style={{ width: '100%' }}>
            <Plus size={14} /> Add Another Activity
          </button>
        )}
      </div>
    </>
  );
};