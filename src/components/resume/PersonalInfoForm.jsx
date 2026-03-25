import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { User, Mail, Phone, Linkedin, Globe } from "lucide-react";

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0f1117; --surface: #181c26; --surface2: #1f2435; --border: #2a3048;
    --accent: #4f8ef7; --text: #e4e8f5; --text-muted: #6b7599; --danger: #f75f5f;
    --font: 'DM Sans', sans-serif; --r: 10px;
  }

  .form-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-family: var(--font);
    color: var(--text);
  }

  .form-desc {
    font-size: 13.5px;
    color: var(--text-muted);
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  @media (min-width: 640px) {
    .form-row {
      grid-template-columns: 1fr 1fr;
    }
  }

  .form-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
  }

  .label-icon {
    color: var(--text-muted);
  }

  .required {
    color: var(--danger);
  }

  .form-input {
    width: 100%;
    min-height: 40px;
    padding: 8px 12px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--r);
    color: var(--text);
    font-family: var(--font);
    font-size: 13.5px;
    outline: none;
    transition: border-color 0.15s;
  }

  .form-input::placeholder {
    color: var(--text-muted);
  }

  .form-input:focus {
    border-color: var(--accent);
  }

  .form-input.invalid {
    border-color: var(--danger);
  }

  .form-input.invalid:focus {
    box-shadow: 0 0 0 1px var(--danger);
  }

  .error-msg {
    font-size: 11.5px;
    color: var(--danger);
    margin-top: 4px;
  }

  .hint-msg {
    font-size: 11.5px;
    color: var(--text-muted);
  }
`;

const personalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100, "Name must be less than 100 characters"),
  jobTitle: z.string().max(100, "Job title must be less than 100 characters").optional(),
  email: z.string().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().regex(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/, "Please enter a valid phone number").optional().or(z.literal("")),
  linkedin: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal("")),
  portfolio: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export const PersonalInfoForm = ({ data, onChange }) => {
  const { register, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: data,
    mode: "onChange",
  });

  useEffect(() => {
    reset(data);
  }, [data, reset]);

  useEffect(() => {
    const subscription = watch((formData) => {
      onChange(formData);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  return (
    <>
      <style>{styles}</style>
      <div className="form-container" role="form" aria-label="Personal Information">
        <p className="form-desc">
          This information appears at the top of your resume. Use your professional name and a reliable email address.
        </p>

        <div className="form-group">
          <label htmlFor="fullName" className="form-label">
            <User size={14} className="label-icon" />
            Full Name <span className="required">*</span>
          </label>
          <input
            id="fullName"
            className={\`form-input \${errors.fullName ? "invalid" : ""}\`}
            placeholder="e.g. John Kwame Doe"
            {...register("fullName")}
            spellCheck
            autoComplete="name"
            aria-required="true"
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && <p className="error-msg" role="alert">{errors.fullName.message}</p>}
          <p className="hint-msg">As it appears on official documents</p>
        </div>

        <div className="form-group">
          <label htmlFor="jobTitle" className="form-label">
            <User size={14} className="label-icon" />
            Job Title / Professional Title
          </label>
          <input
            id="jobTitle"
            className="form-input"
            placeholder="e.g. Software Engineer, Data Analyst, Marketing Manager"
            {...register("jobTitle")}
            spellCheck
            autoComplete="organization-title"
          />
          <p className="hint-msg">Your current or target role — this helps tailor your resume</p>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail size={14} className="label-icon" />
              Email <span className="required">*</span>
            </label>
            <input
              id="email"
              type="email"
              className={\`form-input \${errors.email ? "invalid" : ""}\`}
              placeholder="john@example.com"
              {...register("email")}
              autoComplete="email"
              aria-required="true"
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="error-msg" role="alert">{errors.email.message}</p>}
            <p className="hint-msg">Use a professional address</p>
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              <Phone size={14} className="label-icon" />
              Phone
            </label>
            <input
              id="phone"
              className={\`form-input \${errors.phone ? "invalid" : ""}\`}
              placeholder="+233 24 123 4567"
              {...register("phone")}
              autoComplete="tel"
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <p className="error-msg" role="alert">{errors.phone.message}</p>}
            <p className="hint-msg">Include country code (e.g. +233)</p>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="linkedin" className="form-label">
              <Linkedin size={14} className="label-icon" />
              LinkedIn
            </label>
            <input
              id="linkedin"
              className={\`form-input \${errors.linkedin ? "invalid" : ""}\`}
              placeholder="https://linkedin.com/in/johndoe"
              {...register("linkedin")}
              autoComplete="url"
              aria-invalid={!!errors.linkedin}
            />
            {errors.linkedin && <p className="error-msg" role="alert">{errors.linkedin.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="portfolio" className="form-label">
              <Globe size={14} className="label-icon" />
              Portfolio / GitHub
            </label>
            <input
              id="portfolio"
              className={\`form-input \${errors.portfolio ? "invalid" : ""}\`}
              placeholder="https://github.com/johndoe"
              {...register("portfolio")}
              autoComplete="url"
              aria-invalid={!!errors.portfolio}
            />
            {errors.portfolio && <p className="error-msg" role="alert">{errors.portfolio.message}</p>}
          </div>
        </div>
      </div>
    </>
  );
};
