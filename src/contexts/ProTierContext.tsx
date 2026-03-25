import { createContext, useContext, ReactNode } from "react";

interface ProTierContextType {
  isPro: boolean;
  setIsPro: (value: boolean) => void;
  showUpgradeDialog: boolean;
  setShowUpgradeDialog: (value: boolean) => void;
  proFeatures: string[];
}

const ProTierContext = createContext<ProTierContextType | undefined>(undefined);

// All features are now free
export const proFeatures = [
  "AI-Powered Content Suggestions",
  "Keyword Optimization for ATS",
  "Grammar & Spell Check",
  "Professional Formatting Assistance",
  "Resume Score & Feedback",
  "Job Description Tailoring",
  "Priority Support",
  "Unlimited Resume Exports",
];

export const ProTierProvider = ({ children }: { children: ReactNode }) => {
  // Everyone is now Pro - all features are free!
  const isPro = true;
  
  // These are no-ops since everything is free
  const setIsPro = () => {};
  const showUpgradeDialog = false;
  const setShowUpgradeDialog = () => {};

  return (
    <ProTierContext.Provider
      value={{
        isPro,
        setIsPro,
        showUpgradeDialog,
        setShowUpgradeDialog,
        proFeatures,
      }}
    >
      {children}
    </ProTierContext.Provider>
  );
};

export const useProTier = () => {
  const context = useContext(ProTierContext);
  if (!context) {
    throw new Error("useProTier must be used within a ProTierProvider");
  }
  return context;
};
