import { useEvent } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import type { CreateEventData, UpdateEventData, Event } from '@/types/events';

interface UseEventFormProps {
  type: 'create' | 'edit';
  eventId?: number;
  onSuccess?: () => void;
}

export default function useEventForm({ type, eventId, onSuccess }: UseEventFormProps) {
  const { createEvent, updateEvent } = useEvent();
  const { user } = useAuth();

  const handleSubmit = async (values: any) => {
    try {
      const priority = user?.roles?.[0]?.role === 'professionnel' ? 1 : 2;
       console.log(values)
      const data = {
        ...values,
        base_price: Number(values.base_price),
        capacity: values.capacity ? Number(values.capacity) : undefined,
        max_places: Number(values.max_places),
        priority,
        localisation_lat: Number(values.localisation_lat || 48.8566),
        localisation_lng: Number(values.localisation_lng || 2.3522),
      };
     

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && !(value instanceof FileList)) {
          formData.append(key, String(value));
        }
      });
      
      ['thumbnail', 'banner', 'images'].forEach((key) => {
        const fileOrFiles = (values as any)[key]; // use original values from form

        if (!fileOrFiles) return; // nothing selected

        // For multiple images
        if (key === 'images' && fileOrFiles instanceof FileList) {
          Array.from(fileOrFiles).forEach((file: File) => formData.append('images[]', file));
        } 
        // For single file
        else if ((key === 'thumbnail' || key === 'banner') && fileOrFiles instanceof FileList && fileOrFiles.length > 0) {
          formData.append(key, fileOrFiles[0]);
        }
      });

      if (type === 'create') {
        await createEvent(formData as CreateEventData);
      } else if (type === 'edit' && eventId) {

        await updateEvent(eventId, formData as UpdateEventData);
      }

      onSuccess?.();
    } catch (err) {
      console.error('Error submitting event:', err);
    }
  };

  return { handleSubmit };
}