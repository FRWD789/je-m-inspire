import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventSchema } from '@/schema/event';
import { useEventsContext } from '@/context/EventsContext';
import Input from './Input';
import FormField from './FormField';
import Textarea from './TextArea';
import type { z } from 'zod';

type EventFormData = z.infer<typeof eventSchema>;
type EventFormInput = {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  base_price: string;
  capacity: string;
  max_places: string;
  priority: string;
  localisation_id: string;
  categorie_event_id: string;
  level: string;
};

interface EventFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<EventFormInput>;
}

export default function EventForm({ 
  onSuccess, 
  onCancel, 
  initialData 
}: EventFormProps) {
  const { addEvent } = useEventsContext();

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    reset,
    setError 
  } = useForm<EventFormInput>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: initialData || {
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      base_price: '',
      capacity: '',
      max_places: '',
      priority: '5',
      localisation_id: '1',
      categorie_event_id: '',
      level: '',
    }
  });

  const onSubmit = async (formData: EventFormInput) => {
    try {
      const validatedData = eventSchema.parse(formData);
      await addEvent(validatedData);
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating event:', error);
      if (error instanceof Error) {
        setError('root', {
          type: 'manual',
          message: error.message || 'Une erreur est survenue lors de la création de l\'événement'
        });
      }
    }
  };

  return (
    <div className="py-8 px-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {initialData ? 'Modifier l\'événement' : 'Créer un événement'}
        </h1>
        <p className="text-gray-600">
          Remplissez le formulaire ci-dessous pour {initialData ? 'modifier' : 'créer'} un événement
        </p>
      </div>

      {errors.root && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{errors.root.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Informations de base
          </h2>

          <FormField label="Nom de l'événement" error={errors.name} >
            <Input 
              name="name" 
              errors={errors} 
              register={register} 
              placeholder="Ex: Concert de Jazz, Atelier de peinture..."
            />
          </FormField>

          <FormField label="Description" error={errors.description} >
            <Textarea 
              name="description" 
              errors={errors} 
              register={register} 
              placeholder="Décrivez votre événement..."
              rows={4}
            />
          </FormField>

          <FormField label="Niveau" error={errors.level} >
            <select
              {...register('level')}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionnez un niveau</option>
              <option value="Débutant">Débutant</option>
              <option value="Intermédiaire">Intermédiaire</option>
              <option value="Avancé">Avancé</option>
              <option value="Tous niveaux">Tous niveaux</option>
            </select>
            {errors.level && (
              <p className="text-red-500 text-sm mt-1">{errors.level.message}</p>
            )}
          </FormField>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Date et heure
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Date de début" error={errors.start_date} >
              <Input
                name="start_date"
                type="datetime-local"
                errors={errors}
                register={register}
              />
            </FormField>

            <FormField label="Date de fin" error={errors.end_date} >
              <Input
                name="end_date"
                type="datetime-local"
                errors={errors}
                register={register}
              />
            </FormField>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Tarification et capacité
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Prix de base ($)" error={errors.base_price} >
              <Input 
                name="base_price" 
                type="number" 
                step="0.01"
                errors={errors} 
                register={register} 
                placeholder="0.00"
              />
            </FormField>

            <FormField label="Capacité" error={errors.capacity} >
              <Input 
                name="capacity" 
                type="number" 
                errors={errors} 
                register={register} 
                placeholder="100"
              />
            </FormField>

            <FormField label="Places maximales" error={errors.max_places} >
              <Input 
                name="max_places" 
                type="number" 
                errors={errors} 
                register={register} 
                placeholder="100"
              />
            </FormField>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Détails supplémentaires
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Localisation ID" error={errors.localisation_id} >
              <Input 
                name="localisation_id" 
                type="number"
                errors={errors} 
                register={register} 
                placeholder="1"
              />
            </FormField>

            <FormField label="Catégorie ID" error={errors.categorie_event_id} >
              <Input 
                name="categorie_event_id" 
                type="number"
                errors={errors} 
                register={register} 
                placeholder="1"
              />
            </FormField>
          </div>

          <FormField label="Priorité" error={errors.priority}>
            <Input 
              name="priority" 
              type="number" 
              min="1"
              max="10"
              errors={errors} 
              register={register} 
              placeholder="5"
            />
          </FormField>
        </div>

        <div className="flex items-center gap-4 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                    fill="none"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Envoi en cours...
              </span>
            ) : (
              initialData ? 'Modifier l\'événement' : 'Créer l\'événement'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}