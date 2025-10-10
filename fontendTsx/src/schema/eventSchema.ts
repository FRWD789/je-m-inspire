import z from "zod";

export const createEventSchema = z.object({
  name: z.string().min(1, 'Le nom de l’événement est requis'),
  description: z.string().min(1, 'La description est requise'),
  start_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'La date de début est invalide',
  }),
  end_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'La date de fin est invalide',
  }),
  base_price: z
    .union([z.string(), z.number()])
    .refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Le prix de base doit être un nombre positif',
    }),
  capacity: z
    .union([z.string(), z.number()])
    .refine(val => Number(val) > 0, { message: 'La capacité doit être supérieure à 0' }),
  max_places: z
    .union([z.string(), z.number()])
    .refine(val => Number(val) > 0, { message: 'Le nombre maximum de places doit être supérieur à 0' }),
  level: z.enum(['débutant', 'intermédiaire', 'avancé', 'expert'] as const, {
    message: 'Veuillez sélectionner un niveau valide',
  }),
  localisation_address: z.string().min(1, "L'adresse est requise"),
  localisation_lat: z
    .union([z.string(), z.number()])
    .optional()
    .nullable(),
  localisation_lng: z
    .union([z.string(), z.number()])
    .optional()
    .nullable(),
  categorie_event_id: z
    .union([z.string(), z.number()])
    .refine(val => !isNaN(Number(val)), { message: 'L’identifiant de catégorie est invalide' }),
});
export const editEventSchema = z.object({
  name: z.string().min(1, "Le nom de l'événement est requis"),
  description: z.string().min(1, "La description est requise"),
  start_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'La date de début est invalide',
  }),
  end_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'La date de fin est invalide',
  }),
  base_price: z
    .union([z.string(), z.number()])
    .refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Le prix doit être un nombre positif',
    }),
 
  max_places: z
    .union([z.string(), z.number()])
    .refine(val => Number(val) > 0, { message: 'Le nombre de places doit être supérieur à 0' }),
  level: z.enum(['débutant', 'intermédiaire', 'avancé', 'expert'] as const, {
    message: 'Veuillez sélectionner un niveau valide',
  }),
  priority: z
    .union([z.string(), z.number()])
    .refine(val => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 5, {
      message: 'La priorité doit être comprise entre 1 et 5',
    }),
  localisation_id: z
    .union([z.string(), z.number()])
    .refine(val => !isNaN(Number(val)), { message: 'L’identifiant de localisation est invalide' }),
  categorie_event_id: z
    .union([z.string(), z.number()])
    .refine(val => !isNaN(Number(val)), { message: 'L’identifiant de catégorie est invalide' }),
});