import { ExternalLink } from "lucide-react";

const styles = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .footer-container {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 12px 0; font-size: 12px; color: #6b7599; font-family: 'DM Sans', sans-serif;
  }
  .footer-link {
    display: inline-flex; align-items: center; gap: 4px; font-weight: 500;
    color: #4f8ef7; text-decoration: none; transition: color 0.2s;
  }
  .footer-link:hover { text-decoration: underline; }
\`;

export const PoweredByFooter = () => {
  return (
    <>
      <style>{styles}</style>
      <div className="footer-container">
        <span>Powered by</span>
        <a 
          href="https://find-mistar-uni.lovable.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          MiStarStudio
          <ExternalLink size={12} />
        </a>
      </div>
    </>
  );
};
