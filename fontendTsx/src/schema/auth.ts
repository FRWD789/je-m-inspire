import {z} from "zod"


export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères" }).max(255),
  last_name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }).max(255),
  email: z.email({ message: "Adresse email invalide" }).max(255),
  date_of_birth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return birthDate < today;
  }, { message: "La date de naissance doit être antérieure à aujourd'hui" }),
  city: z.string().max(255).optional().nullable(),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  password_confirmation: z.string().min(6),
  role: z.string().min(1, { message: "Le rôle est requis" }),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["password_confirmation"],
});



export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;