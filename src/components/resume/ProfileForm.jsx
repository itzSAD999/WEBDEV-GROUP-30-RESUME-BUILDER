import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";

// CSS styles injected via template literal
const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --danger: #f75f5f;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }

  .profile-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-family: var(--font);
    color: var(--text);
  }

  .profile-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .profile-title {
    font-size: 16px;
    font-weight: 500;
  }

  .profile-desc {
    font-size: 13.5px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .form-textarea {
    width: 100%;
    min-height: 140px; /* equivalent to rows={6} */
    padding: 12px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--r-sm);
    color: var(--text);
    font-family: var(--font);
    font-size: 14px;
    line-height: 1.5;
    outline: none;
    resize: none;
    transition: border-color 0.15s;
  }

  .form-textarea:focus {
    border-color: var(--accent);
  }

  .char-count-row {
    display: flex;
    align-items: center;
    justify-content: flex-end; /* usually characters are pushed to right or left, we'll keep it left per original flex-between */
    justify-content: space-between;
  }

  .char-count {
    font-size: 12px;
  }
  .count-normal { color: #4ade80; /* green-400 */ }
  .count-warn { color: #fbbf24; /* amber-500 */ }
  .count-empty { color: var(--text-muted); }

  .tip-box {
    background: rgba(79, 142, 247, 0.05); /* primary/5 equivalent */
    border: 1px solid rgba(79, 142, 247, 0.2);
    border-radius: var(--r);
    padding: 12px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-top: 8px;
  }

  .tip-icon {
    color: var(--accent);
    flex-shrink: 0;
    margin-top: 2px;
  }

  .tip-content {
    font-size: 12px;
    color: var(--text-muted);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .tip-title {
    font-weight: 500;
    color: var(--text);
  }

  .tip-list {
    list-style-type: disc;
    list-style-position: inside;
    margin-top: 4px;
  }
  .tip-list li {
    margin-bottom: 2px;
  }
\`;

export const ProfileForm = ({ data, onChange }) => {
  const [charCount, setCharCount] = useState(data ? data.length : 0);
  const { register, watch, reset } = useForm({
    defaultValues: { profile: data },
  });

  useEffect(() => {
    reset({ profile: data });
    setCharCount(data ? data.length : 0);
  }, [data, reset]);

  useEffect(() => {
    const subscription = watch((formData) => {
      const value = formData.profile || "";
      setCharCount(value.length);
      onChange(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  const getCharCountClass = () => {
    if (charCount === 0) return "count-empty";
    if (charCount < 50) return "count-warn";
    if (charCount > 500) return "count-warn";
    return "count-normal";
  };

  return (
    <>
      <style>{styles}</style>
      <div className="profile-container" role="form" aria-label="Professional Summary">
        <div className="profile-header">
          <label htmlFor="profile" className="profile-title">Professional Summary</label>
          <p className="profile-desc">
            A brief overview of your experience and career goals. This is the first thing recruiters read.
          </p>
        </div>

        <textarea
          id="profile"
          className="form-textarea"
          placeholder="Results-driven Software Engineer with 5+ years of experience building scalable web applications. Skilled in React, Node.js, and cloud architecture. Passionate about clean code and mentoring junior developers."
          {...register("profile")}
          aria-describedby="profile-hint profile-count"
        />

        <div className="char-count-row">
          <p id="profile-count" className={\`char-count \${getCharCountClass()}\`}>
            {charCount} / 500 characters {charCount < 50 && charCount > 0 ? "(too short)" : charCount > 500 ? "(consider shortening)" : ""}
          </p>
        </div>

        <div id="profile-hint" className="tip-box">
          <Lightbulb size={16} className="tip-icon" />
          <div className="tip-content">
            <p className="tip-title">Writing Tips:</p>
            <ul className="tip-list">
              <li>Start with your title and years of experience</li>
              <li>Mention 2–3 key skills or technologies</li>
              <li>Include a measurable achievement if possible</li>
              <li>Keep it under 4 sentences</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};
