import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PersonalInfo } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { User, Mail, Phone, Linkedin, Globe } from "lucide-react";

const personalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100, "Name must be less than 100 characters"),
  jobTitle: z.string().max(100, "Job title must be less than 100 characters").optional(),
  email: z.string().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().regex(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/, "Please enter a valid phone number").optional().or(z.literal("")),
  linkedin: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal("")),
  portfolio: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export const PersonalInfoForm = ({ data, onChange }: PersonalInfoFormProps) => {
  const { register, watch, reset, formState: { errors } } = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: data,
    mode: "onChange",
  });

  // Sync form when data changes externally (e.g., CV import)
  useEffect(() => {
    reset(data);
  }, [data, reset]);

  useEffect(() => {
    const subscription = watch((data) => {
      onChange(data as PersonalInfo);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  return (
    <div className="space-y-5" role="form" aria-label="Personal Information">
      <p className="text-sm text-muted-foreground mb-4">
        This information appears at the top of your resume. Use your professional name and a reliable email address.
      </p>

      <div className="space-y-2">
        <Label htmlFor="fullName" className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-muted-foreground" />
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="fullName"
          placeholder="e.g. John Kwame Doe"
          {...register("fullName")}
          className={errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}
          spellCheck
          autoComplete="name"
          aria-required="true"
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? "fullName-error" : "fullName-hint"}
        />
        {errors.fullName && (
          <p id="fullName-error" className="text-xs text-destructive" role="alert">{errors.fullName.message}</p>
        )}
        <p id="fullName-hint" className="text-xs text-muted-foreground">
          As it appears on official documents
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobTitle" className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-muted-foreground" />
          Job Title / Professional Title
        </Label>
        <Input
          id="jobTitle"
          placeholder="e.g. Software Engineer, Data Analyst, Marketing Manager"
          {...register("jobTitle")}
          spellCheck
          autoComplete="organization-title"
          aria-describedby="jobTitle-hint"
        />
        <p id="jobTitle-hint" className="text-xs text-muted-foreground">
          Your current or target role — this helps tailor your resume
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...register("email")}
            className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
            autoComplete="email"
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : "email-hint"}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-destructive" role="alert">{errors.email.message}</p>
          )}
          <p id="email-hint" className="text-xs text-muted-foreground">
            Use a professional address
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
            Phone
          </Label>
          <Input
            id="phone"
            placeholder="+233 24 123 4567"
            {...register("phone")}
            className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
          />
          {errors.phone && (
            <p id="phone-error" className="text-xs text-destructive" role="alert">{errors.phone.message}</p>
          )}
          <p id="phone-hint" className="text-xs text-muted-foreground">
            Include country code (e.g. +233)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="linkedin" className="flex items-center gap-1.5">
            <Linkedin className="w-3.5 h-3.5 text-muted-foreground" />
            LinkedIn
          </Label>
          <Input
            id="linkedin"
            placeholder="https://linkedin.com/in/johndoe"
            {...register("linkedin")}
            className={errors.linkedin ? "border-destructive focus-visible:ring-destructive" : ""}
            autoComplete="url"
            aria-invalid={!!errors.linkedin}
          />
          {errors.linkedin && (
            <p className="text-xs text-destructive" role="alert">{errors.linkedin.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="portfolio" className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            Portfolio / GitHub
          </Label>
          <Input
            id="portfolio"
            placeholder="https://github.com/johndoe"
            {...register("portfolio")}
            className={errors.portfolio ? "border-destructive focus-visible:ring-destructive" : ""}
            autoComplete="url"
            aria-invalid={!!errors.portfolio}
          />
          {errors.portfolio && (
            <p className="text-xs text-destructive" role="alert">{errors.portfolio.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};
