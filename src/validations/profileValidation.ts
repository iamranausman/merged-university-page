import { z } from "zod";

export const prfileSchema = z.object({
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

  nationality: z.number().min(1, "Please select a Country"),
  state: z.number().min(1, "Please select a State"),
  city: z.number().min(1, "Please select a City"),
  program_type: z.string().min(1, "Please select a program type"),

  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),

 
})
