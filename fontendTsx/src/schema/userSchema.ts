import { z } from "zod"

export const userProfileSchema = z.object({
  name: z.string().max(255).optional(),
  last_name: z.string().max(255).optional(),
  email: z.string().email(),
  city: z.string().max(255).nullable().optional(),
  date_of_birth: z.string().optional(),
  profile_picture: z
    .instanceof(File)
    .optional()
    .nullable()
    .or(z.string().nullable()),
})
export const userPasswordSchema = z
  .object({
    current_password: z.string().min(1, "Le mot de passe actuel est requis"),
    new_password: z.string().min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
    new_password_confirmation: z.string().min(1, "Veuillez confirmer le mot de passe"),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["new_password_confirmation"],
  })




export const userAvtarProfileSchema = z.object({
  profile_picture: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Veuillez choisir une image"),
})
export type UserProfileFormType = z.infer<typeof userProfileSchema>

export type UserAvtarProfileFormType = z.infer<typeof userAvtarProfileSchema>

export type UserPasswordFormType = z.infer<typeof userPasswordSchema>