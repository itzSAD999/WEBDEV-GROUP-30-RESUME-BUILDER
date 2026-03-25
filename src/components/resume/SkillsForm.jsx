import { useState, useEffect } from "react";
import { X, Plus, Lightbulb, Wrench, Users, Heart } from "lucide-react";

// CSS styles injected via template literal
const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --danger: #f75f5f;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }
  .skills-container {
    display: flex; flex-direction: column; gap: 16px;
    font-family: var(--font); color: var(--text);
  }
  .tabs-list {
    display: grid; grid-template-columns: repeat(4, 1fr);
    background: var(--surface2); border-radius: var(--r);
    padding: 4px; margin-bottom: 16px;
  }
  .tab-trigger {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    background: transparent; border: none; padding: 8px;
    color: var(--text-muted); font-size: 13px; font-weight: 500;
    cursor: pointer; border-radius: calc(var(--r) - 4px);
    transition: all 0.2s;
  }
  .tab-icon { margin-top: 1px; }
  .tab-trigger.active {
    background: var(--surface); color: var(--text);
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  @media (max-width: 640px) {
    .tab-icon { display: none; }
    .tab-trigger { font-size: 11.5px; padding: 8px 4px; }
  }
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); padding: 16px;
    display: flex; flex-direction: column; gap: 16px;
  }
  .card-header { display: flex; flex-direction: column; gap: 4px; }
  .card-title { font-size: 16px; font-weight: 500; }
  .card-desc { font-size: 12.5px; color: var(--text-muted); }
  
  .input-group { display: flex; gap: 8px; }
  .form-input {
    flex: 1; min-height: 40px; padding: 8px 12px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--r-sm); color: var(--text);
    font-family: var(--font); font-size: 13.5px;
    outline: none; transition: border-color 0.15s;
  }
  .form-input:focus { border-color: var(--accent); }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--r-sm);
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: all 0.2s; border: none; background: var(--surface2); color: var(--text);
  }
  .btn-primary { background: var(--text); color: var(--bg); }
  .btn-primary:hover { opacity: 0.9; }
  .btn-ghost { padding: 4px; background: transparent; }
  .btn-ghost:hover { background: var(--surface2); color: var(--danger); }
  
  .badges-container { display: flex; flex-wrap: wrap; gap: 8px; }
  .badge {
    display: flex; align-items: center; gap: 4px;
    background: var(--surface2); border: 1px solid var(--border);
    padding: 4px 8px; border-radius: 16px;
    font-size: 13px; color: var(--text);
  }
  .badge-remove {
    background: transparent; border: none; color: var(--text-muted);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    border-radius: 50%; padding: 2px;
  }
  .badge-remove:hover { background: rgba(247, 95, 95, 0.2); color: var(--danger); }
  
  .tip-text { font-size: 12px; color: var(--text-muted); }
  .empty-text { font-size: 13.5px; color: var(--text-muted); text-align: center; padding: 16px 0; }
  
  .category-box {
    border: 1px solid var(--border); border-radius: var(--r); padding: 16px;
    display: flex; flex-direction: column; gap: 12px;
  }
  .category-header { display: flex; align-items: center; justify-content: space-between; }
  .category-title { font-size: 15px; font-weight: 600; }
  
  .tip-box {
    background: rgba(79, 142, 247, 0.05); border: 1px solid rgba(79, 142, 247, 0.2);
    border-radius: var(--r); padding: 12px; display: flex; align-items: flex-start; gap: 8px;
  }
  .tip-icon { color: var(--accent); flex-shrink: 0; margin-top: 2px; }
\`;

export const SkillsForm = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState("technical");
  const [technicalSkills, setTechnicalSkills] = useState(data.technicalSkills || []);
  const [softSkills, setSoftSkills] = useState(data.softSkills || []);
  const [interests, setInterests] = useState(data.interests || []);
  const [skillCategories, setSkillCategories] = useState(data.skillCategories || []);
  
  const [techInput, setTechInput] = useState("");
  const [softInput, setSoftInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryInputs, setCategoryInputs] = useState({});

  useEffect(() => {
    setTechnicalSkills(data.technicalSkills || []);
    setSoftSkills(data.softSkills || []);
    setInterests(data.interests || []);
    setSkillCategories(data.skillCategories || []);
  }, [data.technicalSkills, data.softSkills, data.interests, data.skillCategories]);

  const addSkills = (input, currentSkills, setSkills, setInput, fieldKey) => {
    const newSkills = input
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !currentSkills.includes(s));
    
    if (newSkills.length > 0) {
      const updated = [...currentSkills, ...newSkills];
      setSkills(updated);
      onChange({ [fieldKey]: updated });
    }
    setInput("");
  };

  const handleKeyDown = (e, input, currentSkills, setSkills, setInput, fieldKey) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkills(input, currentSkills, setSkills, setInput, fieldKey);
    }
  };

  const removeSkill = (index, currentSkills, setSkills, fieldKey) => {
    const updated = currentSkills.filter((_, i) => i !== index);
    setSkills(updated);
    onChange({ [fieldKey]: updated });
  };

  const addSkillCategory = () => {
    if (newCategoryName.trim()) {
      const updated = [...skillCategories, { name: newCategoryName.trim(), skills: [] }];
      setSkillCategories(updated);
      onChange({ skillCategories: updated });
      setNewCategoryName("");
    }
  };

  const removeSkillCategory = (index) => {
    const updated = skillCategories.filter((_, i) => i !== index);
    setSkillCategories(updated);
    onChange({ skillCategories: updated });
  };

  const addSkillToCategory = (categoryIndex) => {
    const input = categoryInputs[categoryIndex];
    if (input?.trim()) {
      const newSkills = input.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const updated = [...skillCategories];
      const category = { ...updated[categoryIndex], skills: [...updated[categoryIndex].skills, ...newSkills] };
      updated[categoryIndex] = category;
      setSkillCategories(updated);
      onChange({ skillCategories: updated });
      setCategoryInputs({ ...categoryInputs, [categoryIndex]: "" });
    }
  };

  const removeSkillFromCategory = (categoryIndex, skillIndex) => {
    const updated = [...skillCategories];
    const category = { ...updated[categoryIndex] };
    category.skills = category.skills.filter((_, i) => i !== skillIndex);
    updated[categoryIndex] = category;
    setSkillCategories(updated);
    onChange({ skillCategories: updated });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="skills-container" role="form" aria-label="Skills & Interests">
        <div className="tabs-list">
          <button className={\`tab-trigger \${activeTab === 'technical' ? 'active' : ''}\`} onClick={() => setActiveTab('technical')}>
            <Wrench size={14} className="tab-icon" /> Technical
          </button>
          <button className={\`tab-trigger \${activeTab === 'soft' ? 'active' : ''}\`} onClick={() => setActiveTab('soft')}>
            <Users size={14} className="tab-icon" /> Soft Skills
          </button>
          <button className={\`tab-trigger \${activeTab === 'interests' ? 'active' : ''}\`} onClick={() => setActiveTab('interests')}>
            <Heart size={14} className="tab-icon" /> Interests
          </button>
          <button className={\`tab-trigger \${activeTab === 'custom' ? 'active' : ''}\`} onClick={() => setActiveTab('custom')}>
            Custom
          </button>
        </div>

        {activeTab === 'technical' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Technical Skills</h3>
              <p className="card-desc">Add programming languages, frameworks, tools, and technologies you're proficient in.</p>
            </div>
            
            <div className="input-group">
              <input
                className="form-input"
                placeholder="Type a skill and press Enter (or use commas for multiple)"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, techInput, technicalSkills, setTechnicalSkills, setTechInput, "technicalSkills")}
              />
              <button className="btn btn-primary" onClick={() => addSkills(techInput, technicalSkills, setTechnicalSkills, setTechInput, "technicalSkills")}>
                Add
              </button>
            </div>
            <p className="tip-text">💡 Tip: Type multiple skills separated by commas (e.g., "Python, React, AWS")</p>
            
            {technicalSkills.length > 0 ? (
              <div className="badges-container">
                {technicalSkills.map((skill, index) => (
                  <div key={index} className="badge">
                    {skill}
                    <button className="badge-remove" onClick={() => removeSkill(index, technicalSkills, setTechnicalSkills, "technicalSkills")}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">No technical skills added yet. Start typing above.</p>
            )}
          </div>
        )}

        {activeTab === 'soft' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Soft Skills</h3>
              <p className="card-desc">Communication, leadership, teamwork, problem-solving, etc.</p>
            </div>
            
            <div className="input-group">
              <input
                className="form-input"
                placeholder="e.g. Leadership, Communication, Critical Thinking"
                value={softInput}
                onChange={(e) => setSoftInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, softInput, softSkills, setSoftSkills, setSoftInput, "softSkills")}
              />
              <button className="btn btn-primary" onClick={() => addSkills(softInput, softSkills, setSoftSkills, setSoftInput, "softSkills")}>
                Add
              </button>
            </div>
            
            {softSkills.length > 0 && (
              <div className="badges-container">
                {softSkills.map((skill, index) => (
                  <div key={index} className="badge">
                    {skill}
                    <button className="badge-remove" onClick={() => removeSkill(index, softSkills, setSoftSkills, "softSkills")}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'interests' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Interests & Hobbies</h3>
              <p className="card-desc">Personal interests that show personality. Great for building rapport in interviews.</p>
            </div>
            
            <div className="input-group">
              <input
                className="form-input"
                placeholder="e.g. Photography, Hiking, Open Source"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, interestInput, interests, setInterests, setInterestInput, "interests")}
              />
              <button className="btn btn-primary" onClick={() => addSkills(interestInput, interests, setInterests, setInterestInput, "interests")}>
                Add
              </button>
            </div>
            
            {interests.length > 0 && (
              <div className="badges-container">
                {interests.map((interest, index) => (
                  <div key={index} className="badge">
                    {interest}
                    <button className="badge-remove" onClick={() => removeSkill(index, interests, setInterests, "interests")}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Custom Skill Categories</h3>
              <p className="card-desc">Create custom sections like "Databases", "Cloud Services", "Design Tools", etc.</p>
            </div>
            
            <div className="input-group">
              <input
                className="form-input"
                placeholder="e.g. Databases, Cloud Services"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkillCategory()}
              />
              <button className="btn btn-primary" onClick={addSkillCategory}>
                <Plus size={14} style={{marginRight: '4px'}} /> Add
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
              {skillCategories.map((category, catIndex) => (
                <div key={catIndex} className="category-box">
                  <div className="category-header">
                    <span className="category-title">{category.name}</span>
                    <button className="btn btn-ghost btn-danger" onClick={() => removeSkillCategory(catIndex)}>
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="input-group">
                    <input
                      className="form-input"
                      placeholder={\`Add skill to \${category.name}\`}
                      value={categoryInputs[catIndex] || ""}
                      onChange={(e) => setCategoryInputs({ ...categoryInputs, [catIndex]: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && addSkillToCategory(catIndex)}
                    />
                    <button className="btn btn-primary" onClick={() => addSkillToCategory(catIndex)}>Add</button>
                  </div>
                  
                  <div className="badges-container">
                    {category.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="badge">
                        {skill}
                        <button className="badge-remove" onClick={() => removeSkillFromCategory(catIndex, skillIndex)}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {skillCategories.length === 0 && (
              <div className="tip-box">
                <Lightbulb size={20} className="tip-icon" />
                <p className="tip-text">
                  Custom categories help organize specialized skills (e.g., "Design Tools: Figma, Sketch, Adobe XD").
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
