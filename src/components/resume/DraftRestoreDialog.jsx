import { FileText, RefreshCw } from "lucide-react";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --primary: #4f8ef7;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }

  .alert-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center;
    z-index: 50; padding: 16px; backdrop-filter: blur(4px); font-family: var(--font);
  }

  .alert-content {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); width: 100%; max-width: 450px;
    display: flex; flex-direction: column; overflow: hidden; color: var(--text);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); padding: 24px;
  }

  .alert-header { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
  .alert-title { font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
  .alert-description { font-size: 13.5px; color: var(--text-muted); line-height: 1.5; }

  .alert-footer { display: flex; justify-content: flex-end; gap: 12px; }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 8px 16px; border-radius: var(--r-sm);
    font-size: 13.5px; font-weight: 500; cursor: pointer;
    transition: all 0.2s; border: none; font-family: var(--font);
  }
  .btn-primary { background: var(--text); color: var(--bg); }
  .btn-primary:hover { opacity: 0.9; }
  .btn-outline { border: 1px solid var(--border); background: transparent; color: var(--text); }
  .btn-outline:hover { background: var(--surface2); }
\`;

export const DraftRestoreDialog = ({
  open,
  onRestore,
  onStartFresh,
}) => {
  if (!open) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="alert-overlay">
        <div className="alert-content">
          <div className="alert-header">
            <div className="alert-title">
              <FileText size={20} className="text-primary" />
              Resume Draft Found
            </div>
            <div className="alert-description">
              A saved draft was found. Would you like to continue editing where you left off?
            </div>
          </div>
          <div className="alert-footer">
            <button className="btn btn-outline" onClick={onStartFresh}>
              <RefreshCw size={16} /> Start Fresh
            </button>
            <button className="btn btn-primary" onClick={onRestore}>
              <FileText size={16} /> Restore Draft
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
