import { useState, useEffect } from "react";
import { Plus, Trash2, Lightbulb, GripVertical } from "lucide-react";
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
  .work-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-family: var(--font);
    color: var(--text);
  }
  .tabs-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: var(--surface2);
    border-radius: var(--r);
    padding: 4px;
    margin-bottom: 16px;
  }
  .tab-trigger {
    background: transparent;
    border: none;
    padding: 8px 16px;
    color: var(--text-muted);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border-radius: calc(var(--r) - 4px);
    transition: all 0.2s;
  }
  .tab-trigger.active {
    background: var(--surface);
    color: var(--text);
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .tabs-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .work-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .work-desc {
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
  .btn-outline { border: 1px solid var(--border); background: var(--surface2); }
  .btn-outline:hover { background: var(--border); }
  .btn-ghost { padding: 6px; }
  .btn-ghost:hover { background: var(--surface2); }
  .btn-danger { color: var(--danger); }
  .btn-danger:hover { color: #ff7b7b; background: rgba(247, 95, 95, 0.1); }
  
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
  .tip-box {
    background: rgba(79, 142, 247, 0.05);
    border: 1px solid rgba(79, 142, 247, 0.2);
    border-radius: var(--r);
    padding: 16px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .tip-icon { color: var(--accent); flex-shrink: 0; margin-top: 2px; }
  .tip-title { font-size: 14px; font-weight: 500; margin-bottom: 8px; color: var(--text); }
  .tip-list { font-size: 12.5px; color: var(--text-muted); list-style: none; display: flex; flex-direction: column; gap: 4px; }
  .tip-list li::before { content: "•"; color: var(--text-muted); margin-right: 6px; }
  
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
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
  
  .checkbox-group {
    display: flex; align-items: center; gap: 8px; margin-top: 4px;
  }
  .checkbox-custom {
    width: 16px; height: 16px; cursor: pointer;
  }
  .bullet-row {
    display: flex; gap: 8px; align-items: flex-start;
  }
  .flex-1 { flex: 1; }
\`;

const RESPONSIBILITY_TIPS = [
  "Accomplished X by implementing Y which led to Z",
  "Increased revenue by 20% through new feature implementation",
  "Led a team of 5 engineers to deliver project 2 weeks ahead of schedule",
  "Reduced page load time by 40% through performance optimization",
];

const SortableWorkItem = ({
  work,
  index,
  updateWork,
  updateWorkResponsibility,
  addWorkResponsibility,
  removeWorkResponsibility,
  removeWork,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: work.id,
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
          <span className="card-title">Position #{index + 1}</span>
        </div>
        <button className="btn btn-ghost btn-danger" onClick={() => removeWork(work.id)}>
          <Trash2 size={16} />
        </button>
      </div>

      <div className="form-group">
        <label className="form-label">Job Title</label>
        <input
          className="form-input"
          placeholder="Software Engineer"
          value={work.title}
          onChange={(e) => updateWork(work.id, "title", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Company</label>
        <input
          className="form-input"
          placeholder="Google, Microsoft, etc."
          value={work.company}
          onChange={(e) => updateWork(work.id, "company", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Location</label>
        <input
          className="form-input"
          placeholder="San Francisco, CA or Remote"
          value={work.location}
          onChange={(e) => updateWork(work.id, "location", e.target.value)}
        />
      </div>

      <div className="form-row-2">
        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input
            className="form-input"
            placeholder="Jan 2023"
            value={work.startDate}
            onChange={(e) => updateWork(work.id, "startDate", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">End Date</label>
          <input
            className="form-input"
            placeholder="Present"
            value={work.endDate}
            disabled={work.current}
            onChange={(e) => updateWork(work.id, "endDate", e.target.value)}
          />
        </div>
      </div>

      <div className="checkbox-group">
        <input
          type="checkbox"
          id={\`current-\${work.id}\`}
          className="checkbox-custom"
          checked={work.current}
          onChange={(e) => {
            const checked = e.target.checked;
            updateWork(work.id, "current", checked);
            if (checked) updateWork(work.id, "endDate", "Present");
          }}
        />
        <label htmlFor={\`current-\${work.id}\`} className="form-label cursor-pointer" style={{ cursor: 'pointer' }}>
          Currently working here
        </label>
      </div>

      <div className="form-group">
        <label className="form-label">Key Achievements & Responsibilities</label>
        {work.responsibilities.map((resp, idx) => (
          <div key={idx} className="bullet-row">
            <textarea
              className="form-textarea flex-1"
              placeholder="Accomplished X by implementing Y which led to Z..."
              value={resp}
              onChange={(e) => updateWorkResponsibility(work.id, idx, e.target.value)}
              rows={2}
            />
            {work.responsibilities.length > 1 && (
              <button
                className="btn btn-ghost btn-danger"
                onClick={() => removeWorkResponsibility(work.id, idx)}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
        <button
          className="btn btn-outline"
          onClick={() => addWorkResponsibility(work.id)}
          style={{ width: 'fit-content', marginTop: '4px' }}
        >
          <Plus size={14} /> Add Bullet Point
        </button>
      </div>
    </div>
  );
};

export const WorkExperienceForm = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState("work");
  const [workExperience, setWorkExperience] = useState(data.workExperience);
  const [leadership, setLeadership] = useState(data.leadership);

  useEffect(() => {
    setWorkExperience(data.workExperience);
    setLeadership(data.leadership);
  }, [data.workExperience, data.leadership]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addWork = () => {
    const newWork = {
      id: Date.now().toString(),
      title: "", company: "", location: "",
      startDate: "", endDate: "", current: false,
      responsibilities: [""],
    };
    const updated = [...workExperience, newWork];
    setWorkExperience(updated);
    onChange({ workExperience: updated });
  };

  const updateWork = (id, field, value) => {
    const updated = workExperience.map((work) =>
      work.id === id ? { ...work, [field]: value } : work
    );
    setWorkExperience(updated);
    onChange({ workExperience: updated });
  };

  const updateWorkResponsibility = (id, index, value) => {
    const updated = workExperience.map((work) => {
      if (work.id === id) {
        const resps = [...work.responsibilities];
        resps[index] = value;
        return { ...work, responsibilities: resps };
      }
      return work;
    });
    setWorkExperience(updated);
    onChange({ workExperience: updated });
  };

  const addWorkResponsibility = (id) => {
    const updated = workExperience.map((work) =>
      work.id === id ? { ...work, responsibilities: [...work.responsibilities, ""] } : work
    );
    setWorkExperience(updated);
    onChange({ workExperience: updated });
  };

  const removeWorkResponsibility = (id, index) => {
    const updated = workExperience.map((work) => {
      if (work.id === id && work.responsibilities.length > 1) {
        const resps = work.responsibilities.filter((_, i) => i !== index);
        return { ...work, responsibilities: resps };
      }
      return work;
    });
    setWorkExperience(updated);
    onChange({ workExperience: updated });
  };

  const removeWork = (id) => {
    const updated = workExperience.filter((work) => work.id !== id);
    setWorkExperience(updated);
    onChange({ workExperience: updated });
  };

  const handleDragEndWork = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = workExperience.findIndex((e) => e.id === active.id);
      const newIndex = workExperience.findIndex((e) => e.id === over.id);
      const reordered = arrayMove(workExperience, oldIndex, newIndex);
      setWorkExperience(reordered);
      onChange({ workExperience: reordered });
    }
  };

  // Leadership logic
  const addLeadership = () => {
    const newLeadership = {
      id: Date.now().toString(),
      title: "", organization: "", startDate: "", endDate: "", current: false,
      responsibilities: [""],
    };
    const updated = [...leadership, newLeadership];
    setLeadership(updated);
    onChange({ leadership: updated });
  };

  const updateLeadership = (id, field, value) => {
    const updated = leadership.map((lead) =>
      lead.id === id ? { ...lead, [field]: value } : lead
    );
    setLeadership(updated);
    onChange({ leadership: updated });
  };

  const updateLeadershipResponsibility = (id, index, value) => {
    const updated = leadership.map((lead) => {
      if (lead.id === id) {
        const resps = [...lead.responsibilities];
        resps[index] = value;
        return { ...lead, responsibilities: resps };
      }
      return lead;
    });
    setLeadership(updated);
    onChange({ leadership: updated });
  };

  const addLeadershipResponsibility = (id) => {
    const updated = leadership.map((lead) =>
      lead.id === id ? { ...lead, responsibilities: [...lead.responsibilities, ""] } : lead
    );
    setLeadership(updated);
    onChange({ leadership: updated });
  };

  const removeLeadership = (id) => {
    const updated = leadership.filter((lead) => lead.id !== id);
    setLeadership(updated);
    onChange({ leadership: updated });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="work-container" role="form" aria-label="Work Experience">
        <div className="tabs-list">
          <button
            className={\`tab-trigger \${activeTab === 'work' ? 'active' : ''}\`}
            onClick={() => setActiveTab('work')}
          >
            Work Experience
          </button>
          <button
            className={\`tab-trigger \${activeTab === 'leadership' ? 'active' : ''}\`}
            onClick={() => setActiveTab('leadership')}
          >
            Leadership
          </button>
        </div>

        {activeTab === 'work' && (
          <div className="tabs-content">
            <div className="tip-box">
              <Lightbulb size={20} className="tip-icon" />
              <div>
                <p className="tip-title">Writing Effective Bullet Points</p>
                <ul className="tip-list">
                  {RESPONSIBILITY_TIPS.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
            </div>

            <div className="work-header">
              <p className="work-desc">Start with your most recent position</p>
              <button className="btn btn-outline" onClick={addWork} style={{ padding: '6px 12px' }}>
                <Plus size={14} /> Add
              </button>
            </div>

            {workExperience.length === 0 && (
              <div className="empty-state">
                <p className="work-desc">No work experience added yet</p>
                <button className="btn btn-outline" onClick={addWork}>
                  <Plus size={14} /> Add Work Experience
                </button>
              </div>
            )}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndWork}>
              <SortableContext items={workExperience.map((w) => w.id)} strategy={verticalListSortingStrategy}>
                {workExperience.map((work, index) => (
                  <SortableWorkItem
                    key={work.id}
                    work={work}
                    index={index}
                    updateWork={updateWork}
                    updateWorkResponsibility={updateWorkResponsibility}
                    addWorkResponsibility={addWorkResponsibility}
                    removeWorkResponsibility={removeWorkResponsibility}
                    removeWork={removeWork}
                  />
                ))}
              </SortableContext>
            </DndContext>
            
            {workExperience.length > 0 && (
              <button className="btn btn-outline" onClick={addWork} style={{ width: '100%' }}>
                <Plus size={14} /> Add Another Position
              </button>
            )}
          </div>
        )}

        {activeTab === 'leadership' && (
          <div className="tabs-content">
            <div className="work-header">
              <p className="work-desc">Add clubs, volunteer work, or leadership roles</p>
              <button className="btn btn-outline" onClick={addLeadership} style={{ padding: '6px 12px' }}>
                <Plus size={14} /> Add
              </button>
            </div>

            {leadership.length === 0 && (
              <div className="empty-state">
                <p className="work-desc">No leadership experience added yet</p>
                <button className="btn btn-outline" onClick={addLeadership}>
                  <Plus size={14} /> Add Leadership
                </button>
              </div>
            )}

            {leadership.map((lead, index) => (
              <div key={lead.id} className="card">
                <div className="card-header">
                  <span className="card-title" style={{ color: 'var(--text)' }}>Role #{index + 1}</span>
                  <button className="btn btn-ghost btn-danger" onClick={() => removeLeadership(lead.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Title / Role</label>
                  <input
                    className="form-input"
                    placeholder="President, Team Lead, Volunteer Coordinator"
                    value={lead.title}
                    onChange={(e) => updateLeadership(lead.id, "title", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Organization</label>
                  <input
                    className="form-input"
                    placeholder="Tech Club, Student Government, NGO Name"
                    value={lead.organization}
                    onChange={(e) => updateLeadership(lead.id, "organization", e.target.value)}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      className="form-input"
                      placeholder="Jan 2023"
                      value={lead.startDate}
                      onChange={(e) => updateLeadership(lead.id, "startDate", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      className="form-input"
                      placeholder="Present"
                      value={lead.endDate}
                      disabled={lead.current}
                      onChange={(e) => updateLeadership(lead.id, "endDate", e.target.value)}
                    />
                  </div>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id={\`current-lead-\${lead.id}\`}
                    className="checkbox-custom"
                    checked={lead.current}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      updateLeadership(lead.id, "current", checked);
                      if (checked) updateLeadership(lead.id, "endDate", "Present");
                    }}
                  />
                  <label htmlFor={\`current-lead-\${lead.id}\`} className="form-label cursor-pointer" style={{ cursor: 'pointer' }}>
                    Current position
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Key Responsibilities</label>
                  {lead.responsibilities.map((resp, idx) => (
                    <textarea
                      key={idx}
                      className="form-textarea"
                      placeholder="Organized events for 100+ members..."
                      value={resp}
                      onChange={(e) => updateLeadershipResponsibility(lead.id, idx, e.target.value)}
                      rows={2}
                    />
                  ))}
                  <button
                    className="btn btn-outline"
                    onClick={() => addLeadershipResponsibility(lead.id)}
                    style={{ width: 'fit-content', marginTop: '4px' }}
                  >
                    <Plus size={14} /> Add Bullet Point
                  </button>
                </div>
              </div>
            ))}
            
            {leadership.length > 0 && (
              <button className="btn btn-outline" onClick={addLeadership} style={{ width: '100%' }}>
                <Plus size={14} /> Add Another Leadership Role
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};
