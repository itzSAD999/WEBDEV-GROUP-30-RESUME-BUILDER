import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

// CSS styles injected via template literal
const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --danger: #f75f5f;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }
  .custom-container {
    display: flex; flex-direction: column; gap: 16px;
    font-family: var(--font); color: var(--text);
  }
  .custom-header {
    display: flex; align-items: center; justify-content: space-between;
  }
  .custom-desc { font-size: 13.5px; color: var(--text-muted); }

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
  .card-title { font-size: 13.5px; font-weight: 500; color: var(--text-muted); }
  
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  
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

export const CustomSectionsForm = ({ data, onChange }) => {
  const [sections, setSections] = useState(data.customSections || []);

  useEffect(() => { setSections(data.customSections || []); }, [data.customSections]);

  const addSection = () => {
    const newSection = {
      id: Date.now().toString(),
      title: "",
      bullets: [""],
    };
    const updated = [...sections, newSection];
    setSections(updated);
    onChange({ customSections: updated });
  };

  const updateSection = (id, field, value) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, [field]: value } : sec
    );
    setSections(updated);
    onChange({ customSections: updated });
  };

  const updateBullet = (id, index, value) => {
    const updated = sections.map((sec) => {
      if (sec.id === id) {
        const bullets = [...sec.bullets];
        bullets[index] = value;
        return { ...sec, bullets };
      }
      return sec;
    });
    setSections(updated);
    onChange({ customSections: updated });
  };

  const addBullet = (id) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, bullets: [...sec.bullets, ""] } : sec
    );
    setSections(updated);
    onChange({ customSections: updated });
  };

  const removeBullet = (id, index) => {
    const updated = sections.map((sec) => {
      if (sec.id === id && sec.bullets.length > 1) {
        const bullets = sec.bullets.filter((_, i) => i !== index);
        return { ...sec, bullets };
      }
      return sec;
    });
    setSections(updated);
    onChange({ customSections: updated });
  };

  const removeSection = (id) => {
    const updated = sections.filter((sec) => sec.id !== id);
    setSections(updated);
    onChange({ customSections: updated });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="custom-container" role="form" aria-label="Custom Sections">
        <div className="custom-header">
          <p className="custom-desc">Add custom sections for any additional information</p>
          <button className="btn btn-outline" onClick={addSection} style={{ padding: '6px 12px' }}>
            <Plus size={14} /> Add Section
          </button>
        </div>

        {sections.length === 0 && (
          <div className="empty-state">
            <p className="custom-desc" style={{ marginBottom: '8px' }}>No custom sections added yet</p>
            <button className="btn btn-outline" onClick={addSection}>
              <Plus size={14} /> Add Custom Section
            </button>
          </div>
        )}

        {sections.map((section, index) => (
          <div key={section.id} className="card">
            <div className="card-header">
              <span className="card-title">Custom Section #{index + 1}</span>
              <button
                className="btn btn-ghost btn-danger"
                onClick={() => removeSection(section.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Section Title</label>
              <input
                className="form-input"
                placeholder="e.g., Publications, Languages, Volunteer Work"
                value={section.title}
                onChange={(e) => updateSection(section.id, "title", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Content</label>
              {section.bullets.map((bullet, idx) => (
                <div key={idx} className="bullet-row">
                  <textarea
                    className="form-textarea flex-1"
                    placeholder="Add content..."
                    value={bullet}
                    onChange={(e) => updateBullet(section.id, idx, e.target.value)}
                    rows={2}
                  />
                  {section.bullets.length > 1 && (
                    <button
                      className="btn btn-ghost btn-danger"
                      onClick={() => removeBullet(section.id, idx)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                className="btn btn-outline"
                onClick={() => addBullet(section.id)}
                style={{ width: 'fit-content' }}
              >
                <Plus size={14} /> Add Bullet
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
