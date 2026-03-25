import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical, Award, Shield } from "lucide-react";
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
  .proj-container {
    display: flex; flex-direction: column; gap: 16px;
    font-family: var(--font); color: var(--text);
  }
  .tabs-list {
    display: grid; grid-template-columns: repeat(3, 1fr);
    background: var(--surface2); border-radius: var(--r);
    padding: 4px; margin-bottom: 24px;
  }
  .tab-trigger {
    background: transparent; border: none; padding: 8px 16px;
    color: var(--text-muted); font-size: 14px; font-weight: 500;
    cursor: pointer; border-radius: calc(var(--r) - 4px);
    transition: all 0.2s; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;
  }
  .tab-trigger.active {
    background: var(--surface); color: var(--text);
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  
  .card-container {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); padding: 20px;
    display: flex; flex-direction: column; gap: 24px;
  }
  .card-header-main {
    display: flex; align-items: center; justify-content: space-between;
  }
  .card-title-main { font-size: 18px; font-weight: 600; }
  
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
    text-align: center; color: var(--text-muted); padding: 32px 0;
  }
  
  .item-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); padding: 16px; position: relative;
    display: flex; flex-direction: column; gap: 16px;
  }
  .item-card-header {
    display: flex; align-items: center; justify-content: space-between;
  }
  
  .drag-handle {
    cursor: grab; color: var(--text-muted); padding: 4px;
    border-radius: 4px; transition: background 0.2s;
  }
  .drag-handle:hover { background: var(--surface2); }
  .drag-handle:active { cursor: grabbing; }
  
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
  
  .form-textarea {
    width: 100%; min-height: 60px; padding: 8px 12px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--r-sm); color: var(--text);
    font-family: var(--font); font-size: 13.5px;
    outline: none; resize: vertical; transition: border-color 0.15s;
  }
  .form-textarea:focus { border-color: var(--accent); }
  
  .bullet-row { display: flex; gap: 8px; align-items: flex-start; }
  .flex-1 { flex: 1; }
\`;

const SortableProjectItem = ({
  proj,
  updateProject,
  updateProjectDescription,
  addProjectDescription,
  removeProjectDescription,
  removeProject,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: proj.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="item-card">
      <div className="item-card-header">
        <div className="drag-handle" {...attributes} {...listeners}>
          <GripVertical size={16} />
        </div>
        <button className="btn btn-ghost btn-danger" onClick={() => removeProject(proj.id)}>
          <Trash2 size={16} />
        </button>
      </div>
      
      <div className="form-group">
        <label className="form-label">Project Title</label>
        <input
          className="form-input"
          placeholder="Amazing Project"
          value={proj.title}
          onChange={(e) => updateProject(proj.id, "title", e.target.value)}
        />
      </div>
      
      <div className="form-row-2">
        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input
            className="form-input"
            placeholder="Jan 2024"
            value={proj.startDate}
            onChange={(e) => updateProject(proj.id, "startDate", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">End Date (Optional)</label>
          <input
            className="form-input"
            placeholder="Present or leave blank"
            value={proj.endDate || ""}
            onChange={(e) => updateProject(proj.id, "endDate", e.target.value)}
          />
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">Role (Optional)</label>
        <input
          className="form-input"
          placeholder="Lead Developer"
          value={proj.role}
          onChange={(e) => updateProject(proj.id, "role", e.target.value)}
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Technologies Used</label>
        <input
          className="form-input"
          placeholder="React, Node.js, PostgreSQL"
          value={proj.technologies || ""}
          onChange={(e) => updateProject(proj.id, "technologies", e.target.value)}
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Description</label>
        {proj.description.map((desc, index) => (
          <div key={index} className="bullet-row">
            <textarea
              className="form-textarea flex-1"
              placeholder="Describe the project..."
              value={desc}
              onChange={(e) => updateProjectDescription(proj.id, index, e.target.value)}
              rows={2}
            />
            {proj.description.length > 1 && (
              <button
                className="btn btn-ghost btn-danger"
                onClick={() => removeProjectDescription(proj.id, index)}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
        <button
          className="btn btn-outline"
          onClick={() => addProjectDescription(proj.id)}
          style={{ width: 'fit-content' }}
        >
          <Plus size={14} /> Add Bullet
        </button>
      </div>
    </div>
  );
};

export const ProjectsForm = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState("projects");
  const [projects, setProjects] = useState(data.projects || []);
  const [achievements, setAchievements] = useState(data.achievements || []);
  const [certifications, setCertifications] = useState(data.certifications || []);

  useEffect(() => {
    setProjects(data.projects || []);
    setAchievements(data.achievements || []);
    setCertifications(data.certifications || []);
  }, [data.projects, data.achievements, data.certifications]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Projects
  const addProject = () => {
    const newProject = {
      id: Date.now().toString(),
      title: "", startDate: "", endDate: "", role: "", technologies: "", description: [""],
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    onChange({ projects: updated });
  };

  const updateProject = (id, field, value) => {
    const updated = projects.map((proj) => proj.id === id ? { ...proj, [field]: value } : proj);
    setProjects(updated);
    onChange({ projects: updated });
  };

  const updateProjectDescription = (id, index, value) => {
    const updated = projects.map((proj) => {
      if (proj.id === id) {
        const description = [...proj.description];
        description[index] = value;
        return { ...proj, description };
      }
      return proj;
    });
    setProjects(updated);
    onChange({ projects: updated });
  };

  const addProjectDescription = (id) => {
    const updated = projects.map((proj) =>
      proj.id === id ? { ...proj, description: [...proj.description, ""] } : proj
    );
    setProjects(updated);
    onChange({ projects: updated });
  };

  const removeProjectDescription = (id, index) => {
    const updated = projects.map((proj) => {
      if (proj.id === id && proj.description.length > 1) {
        const description = proj.description.filter((_, i) => i !== index);
        return { ...proj, description };
      }
      return proj;
    });
    setProjects(updated);
    onChange({ projects: updated });
  };

  const removeProject = (id) => {
    const updated = projects.filter((proj) => proj.id !== id);
    setProjects(updated);
    onChange({ projects: updated });
  };

  const handleProjectDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);
      const reordered = arrayMove(projects, oldIndex, newIndex);
      setProjects(reordered);
      onChange({ projects: reordered });
    }
  };

  // Achievements
  const addAchievement = () => {
    const newAchievement = { id: Date.now().toString(), title: "", date: "", organization: "" };
    const updated = [...achievements, newAchievement];
    setAchievements(updated);
    onChange({ achievements: updated });
  };

  const updateAchievement = (id, field, value) => {
    const updated = achievements.map((ach) => ach.id === id ? { ...ach, [field]: value } : ach);
    setAchievements(updated);
    onChange({ achievements: updated });
  };

  const removeAchievement = (id) => {
    const updated = achievements.filter((ach) => ach.id !== id);
    setAchievements(updated);
    onChange({ achievements: updated });
  };

  // Certifications
  const addCertification = () => {
    const newCert = { id: Date.now().toString(), name: "", date: "", issuer: "" };
    const updated = [...certifications, newCert];
    setCertifications(updated);
    onChange({ certifications: updated });
  };

  const updateCertification = (id, field, value) => {
    const updated = certifications.map((cert) => cert.id === id ? { ...cert, [field]: value } : cert);
    setCertifications(updated);
    onChange({ certifications: updated });
  };

  const removeCertification = (id) => {
    const updated = certifications.filter((cert) => cert.id !== id);
    setCertifications(updated);
    onChange({ certifications: updated });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="proj-container" role="form" aria-label="Projects and Honors">
        <div className="tabs-list">
          <button className={\`tab-trigger \${activeTab === 'projects' ? 'active' : ''}\`} onClick={() => setActiveTab('projects')}>
            Projects & Research
          </button>
          <button className={\`tab-trigger \${activeTab === 'achievements' ? 'active' : ''}\`} onClick={() => setActiveTab('achievements')}>
            Awards
          </button>
          <button className={\`tab-trigger \${activeTab === 'certifications' ? 'active' : ''}\`} onClick={() => setActiveTab('certifications')}>
            Certifications
          </button>
        </div>

        {activeTab === 'projects' && (
          <div className="card-container">
            <div className="card-header-main">
              <span className="card-title-main">Projects & Research</span>
              <button className="btn btn-outline" onClick={addProject}>
                <Plus size={14} /> Add Project
              </button>
            </div>
            
            {projects.length === 0 && (
              <p className="empty-state">No projects added yet.</p>
            )}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleProjectDragEnd}>
              <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                {projects.map((proj) => (
                  <SortableProjectItem
                    key={proj.id}
                    proj={proj}
                    updateProject={updateProject}
                    updateProjectDescription={updateProjectDescription}
                    addProjectDescription={addProjectDescription}
                    removeProjectDescription={removeProjectDescription}
                    removeProject={removeProject}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {projects.length > 0 && (
              <button className="btn btn-outline" onClick={addProject} style={{ width: '100%' }}>
                <Plus size={14} /> Add Another Project
              </button>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="card-container">
            <div className="card-header-main">
              <span className="card-title-main">Achievements & Awards</span>
              <button className="btn btn-outline" onClick={addAchievement}>
                <Plus size={14} /> Add Award
              </button>
            </div>
            
            {achievements.length === 0 && (
              <p className="empty-state">No achievements added yet.</p>
            )}

            {achievements.map((ach) => (
              <div key={ach.id} className="item-card">
                <button
                  className="btn btn-ghost btn-danger"
                  style={{ position: 'absolute', top: '12px', right: '12px' }}
                  onClick={() => removeAchievement(ach.id)}
                >
                  <Trash2 size={16} />
                </button>
                
                <div className="form-group" style={{ paddingRight: '40px' }}>
                  <label className="form-label">Award Title</label>
                  <input
                    className="form-input"
                    placeholder="Best Innovation Award"
                    value={ach.title}
                    onChange={(e) => updateAchievement(ach.id, "title", e.target.value)}
                  />
                </div>
                
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      className="form-input"
                      placeholder="December 2024"
                      value={ach.date}
                      onChange={(e) => updateAchievement(ach.id, "date", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Organization</label>
                    <input
                      className="form-input"
                      placeholder="Awarding Organization"
                      value={ach.organization}
                      onChange={(e) => updateAchievement(ach.id, "organization", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            {achievements.length > 0 && (
              <button className="btn btn-outline" onClick={addAchievement} style={{ width: '100%' }}>
                <Plus size={14} /> Add Another Award
              </button>
            )}
          </div>
        )}

        {activeTab === 'certifications' && (
          <div className="card-container">
            <div className="card-header-main">
              <span className="card-title-main">Certifications</span>
              <button className="btn btn-outline" onClick={addCertification}>
                <Plus size={14} /> Add Certification
              </button>
            </div>
            
            {certifications.length === 0 && (
              <p className="empty-state">No certifications added yet.</p>
            )}

            {certifications.map((cert) => (
              <div key={cert.id} className="item-card">
                <button
                  className="btn btn-ghost btn-danger"
                  style={{ position: 'absolute', top: '12px', right: '12px' }}
                  onClick={() => removeCertification(cert.id)}
                >
                  <Trash2 size={16} />
                </button>
                
                <div className="form-group" style={{ paddingRight: '40px' }}>
                  <label className="form-label">Certification Name</label>
                  <input
                    className="form-input"
                    placeholder="AWS Certified Solutions Architect"
                    value={cert.name}
                    onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                  />
                </div>
                
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      className="form-input"
                      placeholder="May 2024"
                      value={cert.date}
                      onChange={(e) => updateCertification(cert.id, "date", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Issuer</label>
                    <input
                      className="form-input"
                      placeholder="Amazon Web Services"
                      value={cert.issuer}
                      onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            {certifications.length > 0 && (
              <button className="btn btn-outline" onClick={addCertification} style={{ width: '100%' }}>
                <Plus size={14} /> Add Another Certification
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};
