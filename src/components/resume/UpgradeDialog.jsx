import { Check, Sparkles, Crown, Zap, Target, FileCheck, MessageSquare, Download } from "lucide-react";
import { useProTier, proFeatures } from "@/contexts/ProTierContext";
import { toast } from "@/hooks/use-toast";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --primary: #4f8ef7;
    --font: 'DM Sans', sans-serif; --r: 10px; --r-sm: 6px;
  }

  .dialog-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center;
    z-index: 50; padding: 16px; backdrop-filter: blur(4px); font-family: var(--font);
  }

  .dialog-content {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); width: 100%; max-width: 500px;
    display: flex; flex-direction: column; overflow: hidden; color: var(--text);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); padding: 24px;
  }

  .dialog-header { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
  .dialog-title { font-size: 20px; font-weight: 600; display: flex; align-items: center; gap: 12px; }
  .crown-icon { padding: 8px; border-radius: 8px; background: linear-gradient(135deg, #f59e0b, #ea580c); color: #fff; display: flex; align-items: center; justify-content: center; }
  .dialog-desc { font-size: 13.5px; color: var(--text-muted); line-height: 1.5; }

  .pricing-card {
    border-radius: 12px; border: 2px solid rgba(79, 142, 247, 0.2);
    background: linear-gradient(135deg, rgba(79, 142, 247, 0.05), rgba(79, 142, 247, 0.1));
    padding: 16px; margin-bottom: 20px;
  }
  .pricing-price { display: flex; items-baseline; gap: 8px; margin-bottom: 8px; }
  .price-amount { font-size: 28px; font-weight: 700; }
  .price-period { color: var(--text-muted); }
  .badge { background: var(--surface2); color: var(--text); padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-left: 8px; }
  .pricing-desc { font-size: 12.5px; color: var(--text-muted); }

  .features-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
  .features-title { font-size: 13.5px; font-weight: 500; margin-bottom: 4px; }
  .feature-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 8px; background: rgba(31, 36, 53, 0.5); }
  .feature-icon { padding: 6px; border-radius: 6px; background: rgba(79, 142, 247, 0.1); color: var(--primary); }
  .feature-text { font-size: 13.5px; }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 10px 16px; border-radius: var(--r-sm); width: 100%;
    font-size: 14px; font-weight: 500; cursor: pointer;
    transition: all 0.2s; border: none; font-family: var(--font);
  }
  .btn-premium { background: linear-gradient(to right, #f59e0b, #ea580c); color: white; }
  .btn-premium:hover { background: linear-gradient(to right, #d97706, #c2410c); }

  .demo-hint { font-size: 11px; text-align: center; color: var(--text-muted); margin-top: 12px; }
\`;

const featureIcons = {
  "AI-Powered Content Suggestions": <Sparkles size={16} />,
  "Keyword Optimization for ATS": <Target size={16} />,
  "Grammar & Spell Check": <FileCheck size={16} />,
  "Professional Formatting Assistance": <Zap size={16} />,
  "Resume Score & Feedback": <Crown size={16} />,
  "Job Description Tailoring": <Target size={16} />,
  "Priority Support": <MessageSquare size={16} />,
  "Unlimited Resume Exports": <Download size={16} />,
};

export const UpgradeDialog = () => {
  const { showUpgradeDialog, setShowUpgradeDialog, setIsPro } = useProTier();

  const handleUnlockDemo = () => {
    setIsPro(true);
    setShowUpgradeDialog(false);
    toast({
      title: "Pro Features Unlocked! 🎉",
      description: "You now have access to all Assisted Tier features.",
    });
  };

  if (!showUpgradeDialog) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="dialog-overlay" onClick={() => setShowUpgradeDialog(false)}>
        <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <h2 className="dialog-title">
              <div className="crown-icon">
                <Crown size={20} />
              </div>
              Upgrade to Assisted Tier
            </h2>
            <p className="dialog-desc">
              Unlock powerful AI-assisted features to create a standout resume
            </p>
          </div>

          <div className="pricing-card">
            <div className="pricing-price">
              <span className="price-amount">$9.99</span>
              <span className="price-period">/month</span>
              <span className="badge">Most Popular</span>
            </div>
            <p className="pricing-desc">Cancel anytime • 7-day free trial</p>
          </div>

          <div className="features-list">
            <p className="features-title">Everything included:</p>
            {proFeatures.map((feature) => (
              <div key={feature} className="feature-item">
                <div className="feature-icon">
                  {featureIcons[feature] || <Check size={16} />}
                </div>
                <span className="feature-text">{feature}</span>
              </div>
            ))}
          </div>

          <div>
            <button className="btn btn-premium" onClick={handleUnlockDemo}>
              <Sparkles size={16} /> Start Free Trial
            </button>
            <p className="demo-hint">💡 Demo Mode: Click to unlock features for testing</p>
          </div>
        </div>
      </div>
    </>
  );
};
