import { Type } from "lucide-react";

// CSS styles injected via template literal
const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }
  .font-selector-wrapper { display: flex; align-items: center; gap: 8px; font-family: var(--font); color: var(--text); }
  .font-selector-label { font-size: 13.5px; font-weight: 500; white-space: nowrap; }
  .font-selector-select {
    width: 140px; height: 32px; padding: 0 8px; font-size: 13.5px; cursor: pointer;
    background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-sm);
    color: var(--text); outline: none; transition: border-color 0.15s;
  }
  .font-selector-select:focus { border-color: var(--accent); }
\`;

export const FontSelector = ({ value, onChange }) => {
  return (
    <>
      <style>{styles}</style>
      <div className="font-selector-wrapper">
        <Type size={16} style={{ color: "var(--text-muted)" }} />
        <label htmlFor="font-selector" className="font-selector-label">
          Font
        </label>
        <select
          id="font-selector"
          className="font-selector-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="sans">Inter (Sans)</option>
          <option value="serif">Times New Roman</option>
        </select>
      </div>
    </>
  );
};
