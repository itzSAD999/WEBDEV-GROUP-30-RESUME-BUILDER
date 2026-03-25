import { Lock, Sparkles } from "lucide-react";
import { useProTier } from "@/contexts/ProTierContext";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }
  
  .pro-lock-container { position: relative; font-family: var(--font); color: var(--text); }
  .pro-lock-blur { pointer-events: none; opacity: 0.4; filter: blur(1px); }
  .pro-lock-overlay {
    position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: rgba(15, 17, 23, 0.8); backdrop-filter: blur(4px);
    border-radius: var(--r); border: 2px dashed rgba(79, 142, 247, 0.3);
  }
  .pro-lock-content { display: flex; flex-direction: column; items-center: center; gap: 12px; padding: 16px; text-align: center; }
  
  .lock-icon-wrapper { padding: 12px; border-radius: 50%; background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 88, 12, 0.2)); display: flex; align-items: center; justify-content: center; margin: 0 auto; width: fit-content; }
  .lock-title { font-weight: 500; font-size: 13.5px; }
  .lock-subtitle { font-size: 11.5px; color: var(--text-muted); margin-bottom: 4px; }
  
  .btn-upgrade {
    display: inline-flex; align-items: center; justify-content: center; gap: 4px;
    padding: 6px 12px; border-radius: var(--r-sm); font-size: 12px; font-weight: 500;
    background: linear-gradient(to right, #f59e0b, #ea580c); color: white; border: none; cursor: pointer; transition: opacity 0.2s;
  }
  .btn-upgrade:hover { opacity: 0.9; }

  .pro-badge {
    display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600;
    border-radius: 12px; background: linear-gradient(to right, rgba(245, 158, 11, 0.2), rgba(234, 88, 12, 0.2));
    color: #eab308; border: none; cursor: pointer; transition: all 0.2s; font-family: var(--font);
  }
  .pro-badge:hover { background: linear-gradient(to right, rgba(245, 158, 11, 0.3), rgba(234, 88, 12, 0.3)); }
\`;

export const ProFeatureLock = ({ 
  children, 
  featureName = "This feature",
  showOverlay = true 
}) => {
  const { isPro, setShowUpgradeDialog } = useProTier();

  if (isPro) {
    return <>{children}</>;
  }

  if (!showOverlay) {
    return null;
  }

  return (
    <>
      <style>{styles}</style>
      <div className="pro-lock-container">
        <div className="pro-lock-blur">
          {children}
        </div>
        <div className="pro-lock-overlay">
          <div className="pro-lock-content">
            <div className="lock-icon-wrapper">
              <Lock size={24} style={{ color: "#d97706" }} />
            </div>
            <div>
              <p className="lock-title">{featureName}</p>
              <p className="lock-subtitle">Requires Assisted Tier</p>
            </div>
            <button
              onClick={() => setShowUpgradeDialog(true)}
              className="btn-upgrade"
            >
              <Sparkles size={12} />
              Upgrade to Unlock
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Simple badge to show Pro feature indicator
export const ProBadge = ({ onClick }) => {
  const { setShowUpgradeDialog } = useProTier();
  
  return (
    <>
      <style>{styles}</style>
      <button
        onClick={onClick || (() => setShowUpgradeDialog(true))}
        className="pro-badge"
      >
        <Sparkles size={12} />
        PRO
      </button>
    </>
  );
};
