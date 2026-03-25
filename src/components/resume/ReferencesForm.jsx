import { useState } from "react";
import { Trash2, Plus, User, Lightbulb } from "lucide-react";

// CSS styles injected via template literal
const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --danger: #f75f5f;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }
  .ref-container {
    display: flex; flex-direction: column; gap: 16px;
    font-family: var(--font); color: var(--text);
  }
  .ref-header {
    display: flex; align-items: center; justify-content: space-between;
  }
  .ref-desc { font-size: 13.5px; color: var(--text-muted); }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--r-sm);
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: all 0.2s; border: none; background: transparent; color: var(--text);
  }
  .btn-outline { border: 1px solid var(--border); background: var(--surface2); }
  .btn-outline:hover { background: var(--border); }
  .btn-ghost { padding: 4px; }
  .btn-ghost:hover { background: var(--surface2); }
  .btn-danger { color: var(--danger); }
  .btn-danger:hover { color: #ff7b7b; background: rgba(247, 95, 95, 0.1); }
  
  .empty-state {
    text-align: center; padding: 32px 16px;
    border: 2px dashed var(--border); border-radius: var(--r);
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }
  .empty-icon { color: var(--text-muted); opacity: 0.5; margin-bottom: 8px; }

  .tip-box {
    background: rgba(79, 142, 247, 0.05); border: 1px solid rgba(79, 142, 247, 0.2);
    border-radius: var(--r); padding: 12px; display: flex; align-items: flex-start; gap: 8px;
  }
  .tip-icon { color: var(--accent); flex-shrink: 0; margin-top: 2px; }
  .tip-text { font-size: 12.5px; color: var(--text-muted); line-height: 1.5; }
  .code-block {
    background: var(--bg); border: 1px solid var(--border);
    border-radius: var(--r-sm); padding: 8px; font-family: monospace;
    font-size: 11.5px; margin-top: 6px; color: var(--text);
  }

  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); padding: 16px; position: relative;
    display: flex; flex-direction: column; gap: 16px;
  }
  .card-header {
    display: flex; align-items: center; justify-content: space-between;
  }
  .card-title {
    font-size: 15px; font-weight: 500; display: flex; align-items: center; gap: 8px;
  }

  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-row-2 { display: grid; grid-template-columns: 1fr; gap: 16px; }
  @media (min-width: 640px) { .form-row-2 { grid-template-columns: 1fr 1fr; } }
  
  .form-label { font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 4px; }
  .required { color: var(--danger); }
  .form-input {
    width: 100%; min-height: 40px; padding: 8px 12px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--r-sm); color: var(--text);
    font-family: var(--font); font-size: 13.5px;
    outline: none; transition: border-color 0.15s;
  }
  .form-input:focus { border-color: var(--accent); }
  .hint-text { font-size: 11.5px; color: var(--text-muted); }
\`;

export const ReferencesForm = ({ data, onChange }) => {
  const references = data.references || [];

  const addReference = () => {
    const newRef = {
      id: Date.now().toString(),
      name: "", title: "", organization: "", email: "", phone: "", relationship: "",
    };
    onChange({ references: [...references, newRef] });
  };

  const updateReference = (index, field, value) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ references: updated });
  };

  const removeReference = (index) => {
    const updated = references.filter((_, i) => i !== index);
    onChange({ references: updated });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ref-container" role="form" aria-label="References">
        <div className="ref-header">
          <p className="ref-desc">Add professional references who can vouch for your skills and experience.</p>
          <button className="btn btn-outline" onClick={addReference} style={{ padding: '6px 12px' }}>
            <Plus size={14} /> Add
          </button>
        </div>

        {references.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="empty-state">
              <User size={40} className="empty-icon" />
              <p className="ref-desc">No references added yet. Click "Add" to get started.</p>
              <button className="btn btn-outline" onClick={addReference}>
                <Plus size={14} /> Add Reference
              </button>
            </div>
            
            <div className="tip-box">
              <Lightbulb size={16} className="tip-icon" />
              <div className="tip-text">
                <p><strong>Tip:</strong> References will appear on your CV as:</p>
                <div className="code-block">
                  CEO, Harriet Adams<br />
                  Progressive Healthy Foods LTD,<br />
                  Phone: +233 244 781 112<br />
                  Email: harriet@gmail.com
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {references.map((ref, index) => (
              <div key={ref.id} className="card">
                <div className="card-header">
                  <div className="card-title">
                    <User size={16} />
                    {ref.title && ref.name ? \`\${ref.title}, \${ref.name}\` : ref.name || \`Reference \${index + 1}\`}
                  </div>
                  <button className="btn btn-ghost btn-danger" onClick={() => removeReference(index)}>
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="required">*</span></label>
                    <input
                      className="form-input"
                      placeholder="e.g. Harriet Adams"
                      value={ref.name}
                      onChange={(e) => updateReference(index, "name", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input
                      className="form-input"
                      placeholder="e.g. CEO, Teacher, Director"
                      value={ref.title}
                      onChange={(e) => updateReference(index, "title", e.target.value)}
                    />
                    <p className="hint-text">Appears before the name on your CV</p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Organization</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Progressive Healthy Foods LTD"
                    value={ref.organization}
                    onChange={(e) => updateReference(index, "organization", e.target.value)}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-input"
                      placeholder="e.g. +233 244 781 112"
                      value={ref.phone}
                      onChange={(e) => updateReference(index, "phone", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. harriet@gmail.com"
                      value={ref.email}
                      onChange={(e) => updateReference(index, "email", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button className="btn btn-outline" onClick={addReference} style={{ width: '100%' }}>
              <Plus size={14} /> Add Another Reference
            </button>
          </div>
        )}
      </div>
    </>
  );
};
