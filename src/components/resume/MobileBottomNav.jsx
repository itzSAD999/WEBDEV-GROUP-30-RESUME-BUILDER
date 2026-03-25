import { ArrowLeft, ArrowRight, Save, Check } from "lucide-react";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5;
    --font: 'DM Sans', sans-serif; --r-sm: 6px;
  }
  .mobile-nav-container {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
    background: var(--surface); border-top: 1px solid var(--border);
    padding: 12px; font-family: var(--font); color: var(--text);
  }
  @media (min-width: 1024px) {
    .mobile-nav-container { display: none; }
  }
  .mobile-nav-wrapper { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px 12px; border-radius: var(--r-sm); font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.2s; border: 1px solid transparent; text-decoration: none;
  }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-outline { background: transparent; border-color: var(--border); color: var(--text); }
  .btn-outline:not(:disabled):hover { background: rgba(255,255,255,0.05); }
  .btn-ghost { background: transparent; color: var(--text); }
  .btn-ghost:not(:disabled):hover { background: rgba(255,255,255,0.05); }
  .btn-primary { background: var(--text); color: var(--bg); }
  .btn-primary:not(:disabled):hover { opacity: 0.9; }
\`;

export const MobileBottomNav = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSave,
  onFinish,
  isLastStep,
}) => {
  return (
    <>
      <style>{styles}</style>
      <div className="mobile-nav-container">
        <div className="mobile-nav-wrapper">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onPrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button type="button" className="btn btn-ghost" onClick={onSave}>
            <Save size={16} />
            Save
          </button>

          {isLastStep ? (
            <button type="button" className="btn btn-primary" onClick={onFinish}>
              <Check size={16} />
              Finish
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={onNext}>
              Next
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </>
  );
};
