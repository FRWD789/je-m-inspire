import Form from '../form';
import FormFiled from '../utils/form/formFiled';
import Input from '../ui/input';
import Select from '../ui/select';
import { useEvent } from '../../context/EventContext';
import TextArea from '../ui/textArea';
import { createEventSchema, editEventSchema } from '@/schema/eventSchema';
import AutocompleteInputRHF from '../ui/autoCompleteInput';
import { APIProvider } from '@vis.gl/react-google-maps';
import Button from '../ui/button';
import { ImageUp, MapPinned, PinIcon, Settings, TextAlignStart, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type FormEventsProps = {
  type: 'create' | 'edit';
  eventId?: number;
  defaultValues?: any;
  onSuccess?: () => void
};

export default function FormEvents({ type, eventId, defaultValues,onSuccess }: FormEventsProps) {
  const { createEvent, updateEvent } = useEvent();
  const {user} = useAuth()
  function formatDateForInput(dateString: string) {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toISOString().slice(0, 16);
  }
  

  const formattedDefaults = defaultValues
    ? {
        ...defaultValues,
        start_date: formatDateForInput(defaultValues.start_date),
        end_date: formatDateForInput(defaultValues.end_date),
        localisation_id: defaultValues.localisation?.id,
        localisation_address: defaultValues.localisation?.address,
        categorie_event_id: defaultValues.categorie?.id,
        categorie_name: defaultValues.categorie?.name,
      }
    : undefined;

  const options = [
    { description: "Débutant", value: "débutant" },
    { description: "Intermédiaire", value: "intermédiaire" },
    { description: "Avancé", value: "avancé" },
    { description: "Expert", value: "expert" },
  ];

  const optionsCateg = [
    { value: 1, description: "Méditation" },
    { value: 2, description: "Yoga" },
    { value: 3, description: "Santé Mentale" },
    { value: 4, description: "Retraite" },
  ];

    async function handleSubmit(values: any) {
      try {
        const formData = new FormData();

        const data = {
          ...values,
          base_price: Number(values.base_price),
          capacity: Number(values.capacity),
          max_places: Number(values.max_places),
          priority: user?.role === "professionnel" ? 1 : 2,
          localisation_lat: values.localisation_lat ? Number(values.localisation_lat) : 48.8566,
          localisation_lng: values.localisation_lng ? Number(values.localisation_lng) : 2.3522,
        };

        // Append all scalar fields
        const scalarFields = [
          "name",
          "description",
          "start_date",
          "end_date",
          "base_price",
          "capacity",
          "max_places",
          "priority",
          "level",
          "localisation_address",
          "localisation_lat",
          "localisation_lng",
          "categorie_event_id",
        ];

        for (const key of scalarFields) {
          if (data[key] !== undefined && data[key] !== null) {
            formData.append(key, String(data[key]));
          }
        }

        // Append files
        if (data.thumbnail && data.thumbnail.length > 0) {
          formData.append("thumbnail", data.thumbnail[0]);
        }

        if (data.banner && data.banner.length > 0) {
          formData.append("banner", data.banner[0]);
        }

        if (data.images && data.images.length > 0) {
          Array.from(data.images).forEach((file: File) => formData.append("images[]", file));
        }

        if (type === "create") {
          await createEvent(formData as any);
        } else if (type === "edit" && eventId) {
          await updateEvent(eventId, formData as any);
        }

        if (onSuccess) onSuccess();
      } catch (error) {
        console.error("Error submitting event:", error);
      }
}
  return (
    <Form
      schema={type === "create" ? createEventSchema : editEventSchema}
      defaultValues={formattedDefaults}
      onSubmit={handleSubmit}
    >
      {/* ----- Section: General Info ----- */}
      <div className="mb-6">
        <div className='flex gap-x-2 items-center text-accent mb-4'>
          <TextAlignStart />
          <h2 className="text-lg font-semibold text-accent ">Informations générales</h2>
        </div>
       <div className='grid gap-y-3'>
          <FormFiled label="Nom de l'événement *">
            <Input name="name" placeholder="Nom de l'événement" />
          </FormFiled>
  
          <FormFiled label="Description *">
            <TextArea name="description" />
          </FormFiled>
       </div>
      </div>
       <hr className="my-6 border-gray-300" />

      {/* ----- Section: Location ----- */}
      <div className="mb-6">
        <div className='flex gap-x-2 items-center text-accent mb-4'>
          <MapPinned />
          <h2 className="text-lg font-semibold text-accent ">Localisation</h2>
        </div>
     
        {type === "create" && (
          <FormFiled label="Adresse de localisation *">
            <APIProvider apiKey="AIzaSyCLD-sPCtHIZVGtpp8K-ok97RR26UStQqM" libraries={['places']}>
              <AutocompleteInputRHF name="localisation_address" />
            </APIProvider>
          </FormFiled>
        )}
        {type === "edit" && (
          <FormFiled label="Adresse de localisation *">
            <Input
              name="localisation_address"
              placeholder="Adresse"
              value={formattedDefaults?.localisation_address}
              disabled
            />
          </FormFiled>
        )}
      </div>

      <hr className="my-6 border-gray-300" />

      {/* ----- Section: Dates & Capacity ----- */}
      <div className="mb-6">
        <div className='flex gap-x-2 items-center text-accent mb-4'>
          <Users />
          <h2 className="text-lg font-semibold text-accent ">Dates et capacité</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormFiled label="Date de début *">
            <Input type="datetime-local" name="start_date" />
          </FormFiled>
          <FormFiled label="Date de fin *">
            <Input type="datetime-local" name="end_date" />
          </FormFiled>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <FormFiled label="Prix (€) *">
            <Input type="number" name="base_price" step="0.01" min="0" />
          </FormFiled>
          {type === "create" && (
            <FormFiled label="Capacité *">
              <Input type="number" name="capacity" min="1" />
            </FormFiled>
          )}
          <FormFiled label="Places max *">
            <Input type="number" name="max_places" min="1" />
          </FormFiled>
        </div>
      </div>

      <hr className="my-6 border-gray-300" />

      {/* ----- Section: Event Settings ----- */}
      <div className="mb-6">
        <div className='flex gap-x-2 items-center text-accent mb-4'>
            <Settings />
          <h2 className="text-lg font-semibold text-accent ">Paramètres de l'événement</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormFiled label="Niveau *">
            <Select options={options} name="level" />
          </FormFiled>

          <FormFiled label="Catégorie">
            <Select options={optionsCateg} name="categorie_event_id" />
          </FormFiled>

        </div>
      </div>
      {/* ----- Section: Images ----- */}
      <hr className="my-6 border-gray-300" />
      <div className="flex gap-x-2 items-center text-accent mb-4">
        <ImageUp />
        <h2 className="text-lg font-semibold text-accent mb-4">Images de l'événement</h2>
        </div>

        <div className="grid gap-4">
          <FormFiled label="Image miniature (thumbnail)">
            <Input type="file" name="thumbnail" accept="image/*" />
          </FormFiled>

          <FormFiled label="Image de bannière">
            <Input type="file" name="banner" accept="image/*" />
          </FormFiled>

          <FormFiled label="Autres images (jusqu'à 5)">
            <Input type="file" name="images" accept="image/*" multiple />
          </FormFiled>
        </div>
      
      {/* ----- Submit Button ----- */}
      <div className="mt-6">
        <Button
          type="submit"
          className="px-4 py-2 bg-accent text-white rounded hover:bg-primary transition-colors"
        >
          {type === "create" ? "Créer l'événement" : "Modifier l'événement"}
        </Button>
      </div>
    </Form>
  );
}
