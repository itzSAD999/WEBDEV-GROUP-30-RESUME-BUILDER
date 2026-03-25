import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// CSS styles injected via template literal
const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --danger: #f75f5f;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }
  
  .collapsible-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    display: flex;
    flex-direction: column;
    transition: all 0.2s;
    font-family: var(--font);
    color: var(--text);
    overflow: hidden;
  }
  
  .collapsible-card.collapsed {
    background: rgba(31, 36, 53, 0.3); /* muted/30 equivalent */
  }

  .collapsible-header {
    padding: 16px;
    display: flex;
    flex-direction: column;
  }
  
  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .icon-wrapper {
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .title-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .title-text {
    font-weight: 600;
    font-size: 14px;
    margin: 0;
  }

  .badge {
    background: var(--surface2);
    color: var(--text);
    font-size: 11.5px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 12px;
  }

  .toggle-btn {
    background: transparent;
    border: none;
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: background 0.2s;
  }
  .toggle-btn:hover {
    background: var(--surface2);
  }

  .summary-text {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 8px;
    margin-left: 36px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .empty-text {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 8px;
    margin-left: 36px;
    font-style: italic;
  }

  .collapsible-content {
    padding: 0 16px 16px 16px;
  }
\`;

export const CollapsibleFormCard = ({
  title,
  icon,
  children,
  summary,
  itemCount,
  isEmpty = false,
  defaultExpanded = true,
  onToggle,
  className = "",
  dragHandle
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Auto-collapse if empty, expand if has content
  useEffect(() => {
    if (isEmpty && !defaultExpanded) {
      setIsExpanded(false);
    }
  }, [isEmpty, defaultExpanded]);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (onToggle) onToggle(newState);
  };

  return (
    <>
      <style>{styles}</style>
      <div className={\`collapsible-card \${!isExpanded ? 'collapsed' : ''} \${className}\`}>
        <div className="collapsible-header">
          <div className="header-top">
            <div className="header-content">
              {dragHandle}
              {icon && <span className="icon-wrapper">{icon}</span>}
              <div className="title-group">
                <h3 className="title-text">{title}</h3>
                {itemCount !== undefined && itemCount > 0 && (
                  <span className="badge">{itemCount}</span>
                )}
              </div>
            </div>
            <button
              className="toggle-btn"
              onClick={handleToggle}
              aria-expanded={isExpanded}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          
          {/* Summary when collapsed */}
          {!isExpanded && summary && (
            <p className="summary-text">{summary}</p>
          )}
          
          {!isExpanded && isEmpty && (
            <p className="empty-text">Click to expand and add content</p>
          )}
        </div>
        
        {isExpanded && (
          <div className="collapsible-content">
            {children}
          </div>
        )}
      </div>
    </>
  );
};

// Helper to generate summary text
export const generateSummary = {
  education: (data) => {
    if (!data || data.length === 0) return "";
    const first = data[0];
    return \`\${first.institution || ""}\${first.degree ? \` — \${first.degree}\` : ""}\${first.endDate ? \` (\${first.endDate})\` : ""}\`;
  },
  
  experience: (data) => {
    if (!data || data.length === 0) return "";
    const first = data[0];
    return \`\${first.title || ""}\${first.company ? \` at \${first.company}\` : ""}\`;
  },
  
  skills: (technical, soft) => {
    const all = [...(technical || []), ...(soft || [])];
    if (all.length === 0) return "";
    const preview = all.slice(0, 4).join(", ");
    return all.length > 4 ? \`\${preview} +\${all.length - 4} more\` : preview;
  },
  
  projects: (data) => {
    if (!data || data.length === 0) return "";
    return data.map(p => p.title).filter(Boolean).slice(0, 2).join(", ");
  },
  
  personalInfo: (data) => {
    if (!data) return "";
    const parts = [data.fullName, data.email].filter(Boolean);
    return parts.join(" • ");
  }
};