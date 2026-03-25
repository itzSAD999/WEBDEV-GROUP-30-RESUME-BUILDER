import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical, GraduationCap, Lightbulb } from "lucide-react";
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

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --danger: #f75f5f;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }
  .edu-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-family: var(--font);
    color: var(--text);
  }
  .edu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .edu-desc {
    font-size: 13.5px;
    color: var(--text-muted);
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: var(--r-sm);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    background: transparent;
    color: var(--text);
  }
  .btn-primary {
    background: var(--accent);
    color: #fff;
  }
  .btn-primary:hover {
    opacity: 0.9;
  }
  .btn-outline {
    border: 1px solid var(--border);
    background: var(--surface2);
  }
  .btn-outline:hover {
    background: var(--border);
  }
  .btn-ghost {
    padding: 6px;
  }
  .btn-ghost:hover {
    background: var(--surface2);
  }
  .btn-danger {
    color: var(--danger);
  }
  .btn-danger:hover {
    color: #ff7b7b;
    background: rgba(247, 95, 95, 0.1);
  }
  .empty-state {
    text-align: center;
    padding: 32px 16px;
    border: 2px dashed var(--border);
    border-radius: var(--r);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .empty-icon {
    color: var(--text-muted);
    opacity: 0.5;
  }
  .tip-box {
    background: rgba(79, 142, 247, 0.05);
    border: 1px solid rgba(79, 142, 247, 0.2);
    border-radius: var(--r);
    padding: 12px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
  .tip-icon {
    color: var(--accent);
    flex-shrink: 0;
  }
  .tip-text {
    font-size: 11.5px;
    color: var(--text-muted);
    line-height: 1.5;
  }
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
  }
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .card-title-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .drag-handle {
    cursor: grab;
    color: var(--text-muted);
    padding: 4px;
    border-radius: 4px;
    transition: background 0.2s;
  }
  .drag-handle:hover {
    background: var(--surface2);
  }
  .drag-handle:active {
    cursor: grabbing;
  }
  .card-title {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .form-row-3 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  @media (min-width: 640px) {
    .form-row-2 { grid-template-columns: 1fr 1fr; }
    .form-row-3 { grid-template-columns: 1fr 1fr 1fr; }
  }
  .form-label {
    font-size: 13px;
    font-weight: 500;
  }
  .required {
    color: var(--danger);
  }
  .form-input {
    width: 100%;
    min-height: 40px;
    padding: 8px 12px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--r-sm);
    color: var(--text);
    font-family: var(--font);
    font-size: 13.5px;
    outline: none;
    transition: border-color 0.15s;
  }
  .form-input:focus { border-color: var(--accent); }
  .form-textarea {
    width: 100%;
    min-height: 60px;
    padding: 8px 12px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--r-sm);
    color: var(--text);
    font-family: var(--font);
    font-size: 13.5px;
    outline: none;
    resize: vertical;
    transition: border-color 0.15s;
  }
  .form-textarea:focus { border-color: var(--accent); }
  .bullet-row {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }
  .flex-1 { flex: 1; }
\`;

const SortableEducationItem = ({
  edu,
  index,
  updateEducation,
  updateBullet,
  addBullet,
  removeBullet,
  removeEducation,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: edu.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const summary = edu.degree || edu.institution || \`Education #\${index + 1}\`;

  return (
    <div ref={setNodeRef} style={style} className="card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="drag-handle" {...attributes} {...listeners}>
            <GripVertical size={16} />
          </div>
          <GraduationCap size={16} className="tip-icon" />
          <span className="card-title">{summary}</span>
        </div>
        <button
          className="btn btn-ghost btn-danger"
          onClick={() => removeEducation(edu.id)}
          title="Remove"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="form-row-2">
        <div className="form-group">
          <label className="form-label">Degree & Major <span className="required">*</span></label>
          <input
            className="form-input"
            placeholder="e.g. BSc Computer Science"
            value={edu.degree}
            onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Institution <span className="required">*</span></label>
          <input
            className="form-input"
            placeholder="e.g. University of Ghana"
            value={edu.institution}
            onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
          />
        </div>
      </div>

      <div className="form-row-3">
        <div className="form-group">
          <label className="form-label">Location</label>
          <input
            className="form-input"
            placeholder="e.g. Accra, Ghana"
            value={edu.location}
            onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input
            className="form-input"
            placeholder="e.g. Sep 2020"
            value={edu.startDate}
            onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">End Date</label>
          <input
            className="form-input"
            placeholder="e.g. Jun 2024"
            value={edu.endDate}
            onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
          />
        </div>
      </div>

      <div className="form-group" style={{ maxWidth: '200px' }}>
        <label className="form-label">GPA (Optional)</label>
        <input
          className="form-input"
          placeholder="e.g. 3.8/4.0"
          value={edu.gpa || ""}
          onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Achievements / Coursework</label>
        {edu.bullets.map((bullet, idx) => (
          <div key={idx} className="bullet-row">
            <textarea
              className="form-textarea flex-1"
              placeholder="e.g. Dean's List 2023..."
              value={bullet}
              onChange={(e) => updateBullet(edu.id, idx, e.target.value)}
              rows={2}
            />
            {edu.bullets.length > 1 && (
              <button
                className="btn btn-ghost btn-danger"
                onClick={() => removeBullet(edu.id, idx)}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
        <button
          className="btn btn-outline"
          onClick={() => addBullet(edu.id)}
          style={{ width: 'fit-content' }}
        >
          <Plus size={14} /> Add Bullet
        </button>
      </div>
    </div>
  );
};

export const EducationForm = ({ data, onChange }) => {
  const [education, setEducation] = useState(data);

  useEffect(() => { setEducation(data); }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addEducation = () => {
    const newEducation = {
      id: Date.now().toString(),
      degree: "", institution: "", location: "",
      startDate: "", endDate: "", gpa: "",
      coursework: "", bullets: [""],
    };
    const updated = [...education, newEducation];
    setEducation(updated);
    onChange(updated);
  };

  const updateEducation = (id, field, value) => {
    const updated = education.map((edu) =>
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    setEducation(updated);
    onChange(updated);
  };

  const updateBullet = (id, index, value) => {
    const updated = education.map((edu) => {
      if (edu.id === id) {
        const bullets = [...edu.bullets];
        bullets[index] = value;
        return { ...edu, bullets };
      }
      return edu;
    });
    setEducation(updated);
    onChange(updated);
  };

  const addBullet = (id) => {
    const updated = education.map((edu) =>
      edu.id === id ? { ...edu, bullets: [...edu.bullets, ""] } : edu
    );
    setEducation(updated);
    onChange(updated);
  };

  const removeBullet = (id, index) => {
    const updated = education.map((edu) => {
      if (edu.id === id && edu.bullets.length > 1) {
        const bullets = edu.bullets.filter((_, i) => i !== index);
        return { ...edu, bullets };
      }
      return edu;
    });
    setEducation(updated);
    onChange(updated);
  };

  const removeEducation = (id) => {
    const updated = education.filter((edu) => edu.id !== id);
    setEducation(updated);
    onChange(updated);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = education.findIndex((e) => e.id === active.id);
      const newIndex = education.findIndex((e) => e.id === over.id);
      const reordered = arrayMove(education, oldIndex, newIndex);
      setEducation(reordered);
      onChange(reordered);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="edu-container">
        <div className="edu-header">
          <p className="edu-desc">Add your education, starting with the most recent.</p>
          <button className="btn btn-primary" onClick={addEducation}>
            <Plus size={14} /> Add
          </button>
        </div>

        {education.length === 0 && (
          <div className="empty-state">
            <GraduationCap size={32} className="empty-icon" />
            <p className="edu-desc">No education added yet</p>
            <button className="btn btn-outline" onClick={addEducation}>
              <Plus size={14} /> Add Education
            </button>
          </div>
        )}

        {education.length > 0 && (
          <div className="tip-box">
            <Lightbulb size={16} className="tip-icon" />
            <p className="tip-text">
              <strong>Tip:</strong> Include GPA only if it's 3.0+ or First/Second Class. Add relevant coursework for entry-level roles.
            </p>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={education.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            {education.map((edu, index) => (
              <SortableEducationItem
                key={edu.id}
                edu={edu}
                index={index}
                updateEducation={updateEducation}
                updateBullet={updateBullet}
                addBullet={addBullet}
                removeBullet={removeBullet}
                removeEducation={removeEducation}
              />
            ))}
          </SortableContext>
        </DndContext>

        {education.length > 0 && (
          <button className="btn btn-outline" onClick={addEducation} style={{ width: '100%' }}>
            <Plus size={14} /> Add Another Education
          </button>
        )}
      </div>
    </>
  );
};
