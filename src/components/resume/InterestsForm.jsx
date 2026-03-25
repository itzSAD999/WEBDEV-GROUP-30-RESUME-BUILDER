import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

// CSS styles injected via template literal
const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --danger: #f75f5f;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }
  .interests-container { display: flex; flex-direction: column; gap: 16px; font-family: var(--font); color: var(--text); }
  .desc { font-size: 13.5px; color: var(--text-muted); }
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
    transition: all 0.2s; border: none; background: var(--text); color: var(--bg);
  }
  .btn:hover { opacity: 0.9; }
  .empty-state {
    text-align: center; padding: 32px 16px;
    border: 2px dashed var(--border); border-radius: var(--r);
    color: var(--text-muted); font-size: 13.5px;
  }
  .badges-container { display: flex; flex-wrap: wrap; gap: 8px; }
  .badge {
    display: flex; align-items: center; gap: 4px;
    background: var(--surface2); border: 1px solid var(--border);
    padding: 6px 12px; border-radius: 16px;
    font-size: 13px; color: var(--text);
  }
  .badge-remove {
    background: transparent; border: none; color: var(--text-muted);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    border-radius: 50%; padding: 2px;
  }
  .badge-remove:hover { color: var(--danger); background: rgba(247, 95, 95, 0.1); }
\`;

export const InterestsForm = ({ data, onChange }) => {
  const [interests, setInterests] = useState(data.interests || []);
  const [input, setInput] = useState("");

  useEffect(() => {
    setInterests(data.interests || []);
  }, [data.interests]);

  const addInterest = () => {
    if (input.trim()) {
      const updated = [...interests, input.trim()];
      setInterests(updated);
      onChange({ interests: updated });
      setInput("");
    }
  };

  const removeInterest = (index) => {
    const updated = interests.filter((_, i) => i !== index);
    setInterests(updated);
    onChange({ interests: updated });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="interests-container" role="form" aria-label="Interests">
        <p className="desc">
          Add hobbies, interests, or activities that showcase your personality
        </p>

        <div className="input-group">
          <input
            className="form-input"
            placeholder="Add an interest (e.g., Photography, Hiking, Chess)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addInterest();
              }
            }}
          />
          <button onClick={addInterest} className="btn">
            <Plus size={16} />
            Add
          </button>
        </div>

        {interests.length === 0 ? (
          <div className="empty-state">
            <p>No interests added yet</p>
          </div>
        ) : (
          <div className="badges-container">
            {interests.map((interest, index) => (
              <div key={index} className="badge">
                {interest}
                <button
                  className="badge-remove"
                  onClick={() => removeInterest(index)}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
