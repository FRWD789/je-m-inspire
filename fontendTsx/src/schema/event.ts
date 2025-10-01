import z from "zod";

// Helpers
const parseNumberFromString = (val: string) => {
  if (typeof val === "string") {
    const n = Number(val.replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  }
  if (typeof val === "number") return val;
  return NaN;
};

const parseDateFromString = (val: string | number | Date) => {
  if (val instanceof Date) return val;
  if (typeof val === "string" && val !== "") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
};

// Schema
export const eventSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  description: z.string().min(1, "La description est requise").max(2000),
  start_date: z.preprocess(parseDateFromString, z.instanceof(Date, { message: "Date de début invalide" })),
  end_date: z.preprocess(
    parseDateFromString, 
    z.instanceof(Date, { message: "Date de fin invalide" }).optional()
  ),
  base_price: z.preprocess(
    parseNumberFromString,
    z.number()
      .refine((n) => !Number.isNaN(n), { message: "Prix invalide" })
      .min(0, "Le prix doit être >= 0")
      .max(9999.99, "Le prix doit être <= 9999.99")
  ),
  capacity: z.preprocess(
    parseNumberFromString,
    z.number()
      .refine((n) => !Number.isNaN(n), { message: "Capacité invalide" })
      .int("Doit être un nombre entier")
      .min(1, "Min 1")
      .max(10000, "Max 10000")
  ),
  max_places: z.preprocess(
    parseNumberFromString,
    z.number()
      .refine((n) => !Number.isNaN(n), { message: "Places invalides" })
      .int("Doit être un nombre entier")
      .min(1, "Min 1")
      .max(10000, "Max 10000")
  ),
  priority: z.preprocess(
    parseNumberFromString,
    z.number()
      .refine((n) => !Number.isNaN(n), { message: "Priorité invalide" })
      .int("Doit être un nombre entier")
      .min(1, "Min 1")
      .max(10, "Max 10")
  ),
 
  localisation_id: z.preprocess(
    parseNumberFromString,
    z.number()
      .refine((n) => !Number.isNaN(n), { message: "Localisation invalide" })
      .int("Doit être un nombre entier")
      .positive("Doit être positif")
  ),
  categorie_event_id: z.preprocess(
    parseNumberFromString,
    z.number()
      .refine((n) => !Number.isNaN(n), { message: "Catégorie invalide" })
      .int("Doit être un nombre entier")
      .positive("Doit être positif")
  ),
  level: z.string().min(1, "Le niveau est requis").max(50),
}).refine((data) => {
  if (!data.end_date || !data.start_date) return false;
  return data.end_date > data.start_date;
}, {
  message: "La date de fin doit être après la date de début",
  path: ["end_date"],
});


