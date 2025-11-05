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
import { ImageUp, MapPinned, Settings, TextAlignStart, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Types
interface FormEventsProps {
  type: 'create' | 'edit';
  eventId?: number;
  defaultValues?: any;
  onSuccess?: () => void;
}

interface EventFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  base_price: number;
  capacity: number;
  max_places: number;
  priority: number;
  level: string;
  localisation_address: string;
  localisation_lat: number;
  localisation_lng: number;
  categorie_event_id: number;
  thumbnail?: FileList;
  banner?: FileList;
  images?: FileList;
}

// Constants
const LEVEL_OPTIONS = [
  { description: "Débutant", value: "débutant" },
  { description: "Intermédiaire", value: "intermédiaire" },
  { description: "Avancé", value: "avancé" },
  { description: "Expert", value: "expert" },
];

const CATEGORY_OPTIONS = [
  { value: 1, description: "Méditation" },
  { value: 2, description: "Yoga" },
  { value: 3, description: "Santé Mentale" },
  { value: 4, description: "Retraite" },
];

const SCALAR_FIELDS = [
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

export default function FormEvents({ type, eventId, defaultValues, onSuccess }: FormEventsProps) {
  const { createEvent, updateEvent } = useEvent();
  const { user } = useAuth();

  // Format date for datetime-local input
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  // Prepare default values
  const formattedDefaults = defaultValues ? {
    ...defaultValues,
    start_date: formatDateForInput(defaultValues.start_date),
    end_date: formatDateForInput(defaultValues.end_date),
    localisation_id: defaultValues.localisation?.id,
    localisation_address: defaultValues.localisation?.address,
    categorie_event_id: defaultValues.categorie?.id,
    categorie_name: defaultValues.categorie?.name,
  } : undefined;

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();
      const priority = user?.roles?.[0]?.role === "professionnel" ? 1 : 2;

      // Prepare form data
      const data: EventFormData = {
        ...values,
        base_price: Number(values.base_price),
        capacity: Number(values.capacity),
        max_places: Number(values.max_places),
        priority,
        localisation_lat: values.localisation_lat ? Number(values.localisation_lat) : 48.8566,
        localisation_lng: values.localisation_lng ? Number(values.localisation_lng) : 2.3522,
      };

      // Append scalar fields
      SCALAR_FIELDS.forEach(key => {
        if (data[key as keyof EventFormData] !== undefined && data[key as keyof EventFormData] !== null) {
          formData.append(key, String(data[key as keyof EventFormData]));
        }
      });

      // Append files
      if (data.thumbnail?.[0]) formData.append("thumbnail", data.thumbnail[0]);
      if (data.banner?.[0]) formData.append("banner", data.banner[0]);
      if (data.images) {
        Array.from(data.images).forEach((file: File) => formData.append("images[]", file));
      }

      // Execute action based on type
      if (type === "create") {
        await createEvent(formData as any);
      } else if (type === "edit" && eventId) {
        await updateEvent(eventId, formData as any);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error submitting event:", error);
    }
  };

  // Form sections components
  const GeneralInfoSection = () => (
    <div className="mb-6">
      <SectionHeader icon={<TextAlignStart />} title="Informations générales" />
      <div className='grid gap-y-3'>
        <FormFiled label="Nom de l'événement *">
          <Input name="name" placeholder="Nom de l'événement" />
        </FormFiled>
        <FormFiled label="Description *">
          <TextArea name="description" />
        </FormFiled>
      </div>
    </div>
  );

  const LocationSection = () => (
    <div className="mb-6">
      <SectionHeader icon={<MapPinned />} title="Localisation" />
      {type === "create" ? (
        <FormFiled label="Adresse de localisation *">
          <APIProvider apiKey="AIzaSyCLD-sPCtHIZVGtpp8K-ok97RR26UStQqM" libraries={['places']}>
            <AutocompleteInputRHF name="localisation_address" />
          </APIProvider>
        </FormFiled>
      ) : (
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
  );

  const DatesCapacitySection = () => (
    <div className="mb-6">
      <SectionHeader icon={<Users />} title="Dates et capacité" />
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
  );

  const EventSettingsSection = () => (
    <div className="mb-6">
      <SectionHeader icon={<Settings />} title="Paramètres de l'événement" />
      <div className="grid grid-cols-2 gap-4">
        <FormFiled label="Niveau *">
          <Select options={LEVEL_OPTIONS} name="level" />
        </FormFiled>
        <FormFiled label="Catégorie">
          <Select options={CATEGORY_OPTIONS} name="categorie_event_id" />
        </FormFiled>
      </div>
    </div>
  );

  const ImagesSection = () => (
    <div className="mb-6">
      <SectionHeader icon={<ImageUp />} title="Images de l'événement" />
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
    </div>
  );

  const SubmitButton = () => (
    <div className="mt-6">
      <Button
        type="submit"
        className="px-4 py-2 bg-accent text-white rounded hover:bg-primary transition-colors"
      >
        {type === "create" ? "Créer l'événement" : "Modifier l'événement"}
      </Button>
    </div>
  );

  return (
    <Form
      schema={type === "create" ? createEventSchema : editEventSchema}
      defaultValues={formattedDefaults}
      onSubmit={handleSubmit}
    >
      <GeneralInfoSection />
      <hr className="my-6 border-gray-300" />
      
      <LocationSection />
      <hr className="my-6 border-gray-300" />
      
      <DatesCapacitySection />
      <hr className="my-6 border-gray-300" />
      
      <EventSettingsSection />
      <hr className="my-6 border-gray-300" />
      
      <ImagesSection />
      <SubmitButton />
    </Form>
  );
}

// Helper component for section headers
const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className='flex gap-x-2 items-center text-accent mb-4'>
    {icon}
    <h2 className="text-lg font-semibold text-accent">{title}</h2>
  </div>
);