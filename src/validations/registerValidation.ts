import { z } from "zod";

export const registrationSchema = z.object({
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters long")
    .max(50, "First name cannot exceed 50 characters"),

  last_name: z
    .string()
    .min(2, "Last name must be at least 2 characters long")
    .max(50, "Last name cannot exceed 50 characters"),

  phone: z
    .string()
    .min(2, "Phone Number is Required")
    .regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number (7–15 digits)"),

  email: z
    .string()
    .min(2, "Email is Required")
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password cannot exceed 64 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character"),

  confirm_password: z.string(),

  nationality: z.string().min(1, "Please select a Country"),
  state: z.string().min(1, "Please select a State"),
  city: z.string().min(1, "Please select a City"),
  program_type: z.string().min(1, "Please select a program type"),

  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),

  agree: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms and Conditions",
  }),
}).refine((data) => data.password === data.confirm_password, {
  path: ["confirm_password"],
  message: "Passwords do not match",
});
