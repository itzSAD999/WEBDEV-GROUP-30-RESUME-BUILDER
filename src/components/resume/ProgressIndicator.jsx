import { Check } from "lucide-react";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599;
    --font: 'DM Sans', sans-serif;
  }
  .progress-container { width: 100%; overflow-x: auto; padding-bottom: 8px; font-family: var(--font); }
  .progress-wrapper { display: flex; align-items: center; justify-content: space-between; min-width: max-content; padding: 0 16px; }
  .step-item { display: flex; align-items: center; }
  .step-btn {
    display: flex; flex-direction: column; align-items: center;
    background: transparent; border: none; cursor: pointer; text-decoration: none;
  }
  .step-btn:disabled { cursor: default; }
  .step-circle {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 500; transition: all 0.2s;
  }
  .step-circle.completed { background: var(--accent); color: white; }
  .step-circle.active { background: var(--accent); color: white; box-shadow: 0 0 0 4px rgba(79, 142, 247, 0.2); }
  .step-circle.pending { background: var(--surface); color: var(--text-muted); border: 1px solid var(--border); }
  .step-btn:not(:disabled):hover .step-circle { transform: scale(1.1); }
  
  .step-label { margin-top: 8px; font-size: 12px; font-weight: 500; white-space: nowrap; }
  .step-label.active { color: var(--accent); }
  .step-label.completed { color: var(--text); }
  .step-label.pending { color: var(--text-muted); }
  
  .step-line {
    width: 48px; height: 2px; margin: 0 8px; transition: background-color 0.2s;
  }
  @media (min-width: 768px) { .step-line { width: 80px; } }
  .step-line.completed { background: var(--accent); }
  .step-line.pending { background: var(--border); }
\`;

export const ProgressIndicator = ({ steps, currentStep, onStepClick }) => {
  return (
    <>
      <style>{styles}</style>
      <div className="progress-container">
        <div className="progress-wrapper">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            
            return (
              <div key={step} className="step-item">
                <button
                  onClick={() => onStepClick?.(index)}
                  disabled={!onStepClick}
                  className="step-btn group"
                  type="button"
                >
                  <div className={\`step-circle \${isCompleted ? 'completed' : isActive ? 'active' : 'pending'}\`}>
                    {isCompleted ? <Check size={16} /> : index + 1}
                  </div>
                  <span className={\`step-label \${isActive ? 'active' : isCompleted ? 'completed' : 'pending'}\`}>
                    {step}
                  </span>
                </button>
                
                {index < steps.length - 1 && (
                  <div className={\`step-line \${isCompleted ? 'completed' : 'pending'}\`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
