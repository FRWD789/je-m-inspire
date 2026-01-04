// fontendTsx/src/features/events/components/EventForm.tsx
import { useState } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import { ImageUp, MapPinned, Settings, TextAlignStart, Users, Share2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import Form from '@/components/form'
import FormFiled from '@/components/utils/form/formFiled'
import Input from '@/components/ui/input'
import TextArea from '@/components/ui/textArea'
import Select from '@/components/ui/select'
import Button from '@/components/ui/button'
import AutocompleteInputRHF from '@/components/ui/autoCompleteInput'
import SectionHeader from '@/components/utils/form/SectionHeader'
import ImagesUploadSection from './ImagesUploadSection'

import useEventForm, { useSocialSync } from '@/features/events/hooks/useEventForm'
import SocialSyncToggle from './SocialSyncToggle'
import { createEventSchema, editEventSchema } from '@/schema/eventSchema'

// Types
interface EventFormProps {
  type: 'create' | 'edit'
  eventId?: number
  defaultValues?: any
  onSuccess?: () => void
}

// Constants
const LEVEL_OPTIONS = [
  { description: 'Débutant', value: 'débutant' },
  { description: 'Intermédiaire', value: 'intermédiaire' },
  { description: 'Avancé', value: 'avancé' },
  { description: 'Expert', value: 'expert' },
]

const CATEGORY_OPTIONS = [
  { value: 1, description: 'Méditation' },
  { value: 2, description: 'Yoga' },
  { value: 3, description: 'Santé Mentale' },
  { value: 4, description: 'Retraite' },
]

export default function EventForm({ type, eventId, defaultValues, onSuccess }: EventFormProps) {
  const { t } = useTranslation()
  const { handleSubmit } = useEventForm({ type, eventId, onSuccess })
  
  // ✅ NOUVEAU : États pour synchronisation sociale
  const { 
    syncToSocial, 
    setSyncToSocial, 
    socialPlatforms, 
    setSocialPlatforms 
  } = useSocialSync()

  // Format dates for datetime-local input
  const formattedDefaults = defaultValues
    ? {
        ...defaultValues,
        start_date: defaultValues.start_date
          ? new Date(defaultValues.start_date).toISOString().slice(0, 16)
          : '',
        end_date: defaultValues.end_date
          ? new Date(defaultValues.end_date).toISOString().slice(0, 16)
          : '',
        localisation_address: defaultValues.localisation?.address,
        categorie_event_id: defaultValues.categorie?.id,
      }
    : undefined

  // ✅ MODIFIÉ : Wrapper handleSubmit pour passer les params sociaux
  const onFormSubmit = async (values: any) => {
    await handleSubmit(values, syncToSocial, socialPlatforms)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Form
        schema={type === 'create' ? createEventSchema : editEventSchema}
        defaultValues={formattedDefaults}
        onSubmit={onFormSubmit}
      >
        <GeneralInfoSection t={t} />
        <SectionDivider />
        <LocationSection type={type} defaultValues={formattedDefaults} t={t} />
        <SectionDivider />
        <DatesCapacitySection type={type} t={t} />
        <SectionDivider />
        <EventSettingsSection levelOptions={LEVEL_OPTIONS} categoryOptions={CATEGORY_OPTIONS} t={t} />
        <SectionDivider />
        <ImagesSection type={type} defaultValues={defaultValues} t={t} />
        
        {/* ✅ NOUVEAU : Section synchronisation sociale (uniquement création) */}
        {type === 'create' && (
          <>
            <SectionDivider />
            <SocialSyncSection 
              syncToSocial={syncToSocial}
              setSyncToSocial={setSyncToSocial}
              socialPlatforms={socialPlatforms}
              setSocialPlatforms={setSocialPlatforms}
              t={t}
            />
          </>
        )}
        
        <div className="mt-8 flex gap-4">
          <Button type="submit" className="flex-1">
            {type === 'create' ? t('eventForm.createEvent') : t('eventForm.editEvent')}
          </Button>
        </div>
      </Form>
    </div>
  )
}

// ========================================
// SECTION COMPONENTS
// ========================================

const SectionDivider = () => (
  <div className="my-8">
    <div className="h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
  </div>
)

const GeneralInfoSection = ({ t }: { t: any }) => (
  <div className="space-y-6">
    <SectionHeader icon={<TextAlignStart />} title={t('eventForm.generalInfo')} />
    <div className="space-y-5">
      <FormFiled htmlFor="name" label={t('eventForm.eventName')}>
        <Input
          name="name"
          placeholder={t('eventForm.eventNamePlaceholder')}
          enhanced={true}
        />
      </FormFiled>
      <FormFiled htmlFor="description" label={t('eventForm.description')}>
        <TextArea
          name="description"
          placeholder={t('eventForm.descriptionPlaceholder')}
          enhanced={true}
        />
      </FormFiled>
    </div>
  </div>
)

const LocationSection = ({ type, defaultValues, t }: any) => (
  <div className="space-y-6">
    <SectionHeader icon={<MapPinned />} title={t('eventForm.location')} />
    <div className="space-y-2">
      <label className="block text-sm font-medium text-primary">
        {t('eventForm.eventAddress')}
      </label>
      {type === 'create' ? (
        <APIProvider apiKey="AIzaSyCLD-sPCtHIZVGtpp8K-ok97RR26UStQqM" libraries={['places']}>
          <AutocompleteInputRHF name="localisation_address" />
        </APIProvider>
      ) : (
        <Input
          name="localisation_address"
          placeholder={t('eventForm.addressPlaceholder')}
          value={defaultValues?.localisation_address}
          disabled
        />
      )}
    </div>
  </div>
)

const DatesCapacitySection = ({ type, t }: any) => (
  <div className="space-y-6">
    <SectionHeader icon={<Users />} title={t('eventForm.datesCapacity')} />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormFiled htmlFor="start_date" label={t('eventForm.startDate')}>
        <Input type="datetime-local" name="start_date" enhanced={true} />
      </FormFiled>
      <FormFiled htmlFor="end_date" label={t('eventForm.endDate')}>
        <Input type="datetime-local" name="end_date" enhanced={true} />
      </FormFiled>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <FormFiled htmlFor="base_price" label={t('eventForm.price')}>
        <Input type="number" name="base_price" step="0.01" min="0" enhanced={true} />
      </FormFiled>
      {type === 'create' && (
        <FormFiled htmlFor="capacity" label={t('eventForm.capacity')}>
          <Input type="number" name="capacity" min="1" enhanced={true} />
        </FormFiled>
      )}
      <FormFiled htmlFor="max_places" label={t('eventForm.maxPlaces')}>
        <Input type="number" name="max_places" min="1" enhanced={true} />
      </FormFiled>
    </div>
  </div>
)

const EventSettingsSection = ({ levelOptions, categoryOptions, t }: any) => (
  <div className="space-y-6">
    <SectionHeader icon={<Settings />} title={t('eventForm.eventSettings')} />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormFiled htmlFor="level" label={t('eventForm.level')}>
        <Select options={levelOptions} name="level" enhanced={true} />
      </FormFiled>
      <FormFiled htmlFor="categorie_event_id" label={t('eventForm.category')}>
        <Select options={categoryOptions} name="categorie_event_id" enhanced={true} />
      </FormFiled>
    </div>
  </div>
)

const ImagesSection = ({ type, defaultValues, t }: any) => (
  <div className="space-y-6">
    <SectionHeader icon={<ImageUp />} title={t('eventForm.eventImages')} />
    <ImagesUploadSection type={type} defaultValues={defaultValues} />
  </div>
)

// ✅ NOUVEAU : Section de synchronisation sociale
const SocialSyncSection = ({ 
  syncToSocial, 
  setSyncToSocial, 
  socialPlatforms, 
  setSocialPlatforms,
  t 
}: any) => (
  <div className="space-y-6">
    <SectionHeader icon={<Share2 />} title={t('eventForm.socialSync.title')} />
    <SocialSyncToggle
      enabled={syncToSocial}
      onToggle={setSyncToSocial}
      platforms={socialPlatforms}
      onPlatformsChange={setSocialPlatforms}
    />
  </div>
)