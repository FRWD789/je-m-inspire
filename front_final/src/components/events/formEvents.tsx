import React from 'react'
import Form from '../From'
import z from 'zod';
import FormFiled from '../utils/form/formFiled';
import Input from '../ui/input';
import Select from '../ui/select';
import { useEvent } from '../../context/EventContext';
import TextArea from '../ui/textArea';
import usePrivateApi from '../../hooks/usePrivateApi';
import { da } from 'zod/locales';

type FormEventsProps = {
  type: 'create' | 'edit';
};

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
  priority: z
    .string()
    .refine(val => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 5, {
      message: 'La priorité doit être entre 1 et 5',
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
  capacity: z
    .union([z.string(), z.number()])
    .refine(val => Number(val) > 0, { message: 'La capacité doit être supérieure à 0' }),
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

export default function FormEvents({type}:FormEventsProps) {
    const options= [
    {
                description: "Débutant",
                    value: "débutant"
        },
        {
                description: "intermédiaire",
                    value: "intermédiaire"
        },
        {
                description: "Avancé",
                    value: "avancé"
        },
            {
                description: "Expert",
                    value: "expert"
        },
    ]

    // const {createEvent} = useEvent()

    const api = usePrivateApi()
    const createEvent = async (data:any)=>{
        try {
            const res = await api.post("/events",data)
            console.log(res.data)
        } catch (error) {
            console.log(error)
        }
    }


  return (
    <Form schema={type=="create"? createEventSchema:editEventSchema} onSubmit={createEvent} >
                <FormFiled label="Nom de l'événement *">
        <Input name="name" placeholder="Nom de l'événement" />
      </FormFiled>

      <FormFiled label="Description *">

        <TextArea name='description' />
      </FormFiled>

      <div className="grid grid-cols-2 gap-4">
        <FormFiled label="Date de début *">
          <Input type="datetime-local" name="start_date" />
        </FormFiled>

        <FormFiled label="Date de fin *">
          <Input type="datetime-local" name="end_date" />
        </FormFiled>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormFiled label="Prix (€) *">
          <Input type="number" name="base_price" step="0.01" min="0" />
        </FormFiled>

        <FormFiled label="Capacité *">
          <Input type="number" name="capacity" min="1" />
        </FormFiled>

        <FormFiled label="Places max *">
          <Input type="number" name="max_places" min="1" />
        </FormFiled>
      </div>

      <FormFiled label="Niveau *">
        <Select options={options} name="level"/>

      </FormFiled>

      <FormFiled label="Priorité (1 à 5)">
        <Input type="number" name="priority" min="1" max="5" />
      </FormFiled>

      {type.toLowerCase() === 'create' && (
        <FormFiled label="Adresse de localisation *">
          <Input name="localisation_address" placeholder="Ex: 123 Rue de la Paix, Paris" />
        </FormFiled>
      )}

      {type.toLowerCase() === 'edit' && (
        <>
          <FormFiled label="ID de localisation">
            <Input name="localisation_id" />
          </FormFiled>
        </>
      )}

      <FormFiled label="Catégorie *">
        <Input name="categorie_event_id" />
      </FormFiled>

      <button type='submit' className='px-[4px] py-[6px]'>Cree l'evenment</button>

    </Form>
  )
}
