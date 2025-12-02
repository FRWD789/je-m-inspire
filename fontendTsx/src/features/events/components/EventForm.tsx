// src/features/events/components/EventForm.tsx
import { useState } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import { ImageUp, MapPinned, Settings, TextAlignStart, Users, Loader2 } from 'lucide-react'
import { createEventSchema, editEventSchema } from '@/schema/eventSchema'

import useEventForm from '../hooks/useEventForm'
import Button from '@/components/ui/button'
import FormFiled from '@/components/utils/form/formFiled'
import TextArea from '@/components/ui/textArea'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import Form from '@/components/form'
import AutocompleteInputV2 from '@/components/ui/autoCompleteInputV2'
import { compressImage } from '@/components/utils/image/imageCompression'
import { useCompressedFiles } from '@/context/CompressedFilesContext'  // ← AJOUTER

interface FormEventsProps {
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

export default function EventForm({ type, eventId, defaultValues, onSuccess }: FormEventsProps) {
  const { handleSubmit } = useEventForm({ type, eventId, onSuccess })

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

  return (
    <Form
      schema={type === 'create' ? createEventSchema : editEventSchema}
      defaultValues={formattedDefaults}
      onSubmit={handleSubmit}
    >
      <GeneralInfoSection />
      <hr className="my-6 border-gray-300" />
      <LocationSection type={type} defaultValues={formattedDefaults} />
      <hr className="my-6 border-gray-300" />
      <DatesCapacitySection type={type} />
      <hr className="my-6 border-gray-300" />
      <EventSettingsSection />
      <hr className="my-6 border-gray-300" />
      <ImagesSection />
      <div className="mt-6">
        <Button type="submit">{type === 'create' ? 'Créer l\'événement' : 'Modifier l\'événement'}</Button>
      </div>
    </Form>
  )
}

// General Info Section
const GeneralInfoSection = () => (
  <div className="mb-6">
    <SectionHeader icon={<TextAlignStart />} title="Informations générales" />
    <FormFiled  htmlFor='name' label="Nom de l'événement *">
      <Input name="name" placeholder="Entrez le nom de votre événement" />
    </FormFiled>
    <FormFiled  htmlFor='description' label="Description *">
      <TextArea name="description" placeholder="Décrivez votre événement..." />
    </FormFiled>
  </div>
)

const LocationSection = ({ type, defaultValues }: any) => (
  <div className="mb-6">
    <SectionHeader icon={<MapPinned />} title="Localisation" />
    <APIProvider apiKey="AIzaSyCLD-sPCtHIZVGtpp8K-ok97RR26UStQqM" libraries={['places']}>
      <AutocompleteInputV2 name={'localisation_address'} value={defaultValues?.localisation_address}  />
      {
        type==="edit"&&<Input type="hidden" name="localisation_id" value={defaultValues?.localisation?.id || ''} />
      }
    </APIProvider>
  </div>
)

// Dates & Capacity Section
const DatesCapacitySection = ({ type }: any) => (
  <div className="mb-6">
    <SectionHeader icon={<Users />} title="Dates et capacité" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <FormFiled htmlFor='start_date' label="Date de début *">
        <Input type="datetime-local" name="start_date" placeholder="Sélectionnez la date de début" />
      </FormFiled>
      <FormFiled htmlFor='end_date' label="Date de fin *">
        <Input type="datetime-local" name="end_date" placeholder="Sélectionnez la date de fin" />
      </FormFiled>
      <FormFiled htmlFor='base_price' label="Prix ($) *">
        <Input type="number" name="base_price" placeholder="Entrez le prix par participant" />
      </FormFiled>
      <FormFiled htmlFor='capacity' label="Capacité *">
        <Input type="number" name="capacity" placeholder="Nombre de participants maximum" />
      </FormFiled>
      <FormFiled htmlFor='max_places' label="Places max *">
        <Input type="number" name="max_places" placeholder="Nombre de places disponibles" />
      </FormFiled>
    </div>
  </div>
)

// Event Settings Section
const EventSettingsSection = () => (
  <div className="mb-6">
    <SectionHeader icon={<Settings />} title="Paramètres de l'événement" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormFiled htmlFor='level' label="Niveau *">
        <Select options={LEVEL_OPTIONS} name="level" placeholder="Sélectionnez le niveau" />
      </FormFiled>
      <FormFiled htmlFor="categorie_event_id" label="Catégorie">
        <Select options={CATEGORY_OPTIONS} name="categorie_event_id" placeholder="Sélectionnez une catégorie" />
      </FormFiled>
    </div>
  </div>
)

const ImagesSection = () => {
  // ✅ Récupérer le Context
  const { setThumbnailFile, setBannerFile, setImagesFiles } = useCompressedFiles()
  
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [imagesPreview, setImagesPreview] = useState<string[]>([])
  
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionStatus, setCompressionStatus] = useState<string>('')
  
  /**
   * 🔥 CORRECTION : Stocker les fichiers compressés dans le Context
   */
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (v: any) => void,
    setFile: (file: File | null | File[]) => void,  // ← AJOUTER paramètre
    multiple = false
  ) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsCompressing(true)
    setCompressionStatus(multiple ? 'Compression des images...' : 'Compression...')

    try {
      if (multiple) {
        // 🔥 Compression multiple
        const filesArray = Array.from(files)
        console.log(`📸 [ImagesSection] Compression de ${filesArray.length} images...`)
        
        const compressedFiles: File[] = []
        const previewUrls: string[] = []

        for (let i = 0; i < filesArray.length; i++) {
          const file = filesArray[i]
          setCompressionStatus(`Compression ${i + 1}/${filesArray.length}...`)
          
          const compressed = await compressImage(file)
          compressedFiles.push(compressed)
          previewUrls.push(URL.createObjectURL(compressed))
        }

        // ✅ Stocker dans le Context
        setFile(compressedFiles)
        setPreview(previewUrls)
        console.log(`✅ [ImagesSection] ${compressedFiles.length} images compressées et stockées dans Context`)
        
      } else {
        // 🔥 Compression unique
        const file = files[0]
        console.log(`📸 [ImagesSection] Compression de ${file.name}...`)
        
        const compressed = await compressImage(file)
        
        // ✅ Stocker dans le Context
        setFile(compressed)
        setPreview(URL.createObjectURL(compressed))
        console.log(`✅ [ImagesSection] ${file.name} compressé et stocké dans Context`)
      }
    } catch (error) {
      console.error('❌ [ImagesSection] Erreur compression:', error)
      setCompressionStatus('Erreur lors de la compression')
    } finally {
      setIsCompressing(false)
      setTimeout(() => setCompressionStatus(''), 2000)
    }
  }

  return (
    <div className="mb-6">
      <SectionHeader icon={<ImageUp />} title="Images de l'événement" />

      {/* Indicateur de compression */}
      {isCompressing && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-700">{compressionStatus}</span>
        </div>
      )}

      {/* Thumbnail */}
      <FormFiled htmlFor='thumbnail' label="Thumbnail">
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">
          <Input
            name="thumbnail"
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            accept="image/*"
            disabled={isCompressing}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                console.log('🖼️  [ImagesSection] Thumbnail sélectionné:', file.name)
                handleFileChange(e, setThumbnailPreview, setThumbnailFile)  // ← MODIFIER
              }
            }}
          />
          {thumbnailPreview ? (
            <img
              src={thumbnailPreview}
              alt="Thumbnail Preview"
              className="w-32 h-32 object-cover rounded pointer-events-none"
            />
          ) : (
            <p className="text-gray-400 text-sm text-center pointer-events-none">
              Cliquez ou glissez pour ajouter une image
            </p>
          )}
        </div>
      </FormFiled>

      {/* Banner */}
      <FormFiled htmlFor='banner' label="Banner">
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">
          <Input
            type="file"
            name="banner"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            accept="image/*"
            disabled={isCompressing}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                console.log('🎨 [ImagesSection] Banner sélectionné:', file.name)
                handleFileChange(e, setBannerPreview, setBannerFile)  // ← MODIFIER
              }
            }}
          />
          {bannerPreview ? (
            <img
              src={bannerPreview}
              alt="Banner Preview"
              className="w-full max-h-40 object-cover rounded pointer-events-none"
            />
          ) : (
            <p className="text-gray-400 text-sm text-center pointer-events-none">
              Cliquez ou glissez pour ajouter une image
            </p>
          )}
        </div>
      </FormFiled>

      {/* Multiple Images */}
      <FormFiled htmlFor='images' label="Images">
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">
          <Input
            type="file"
            name="images"
            multiple
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            disabled={isCompressing}
            onChange={(e) => {
              console.log('📸 [ImagesSection] Images multiples sélectionnées:', e.target.files?.length || 0)
              handleFileChange(e, setImagesPreview, setImagesFiles, true)  // ← MODIFIER
            }}
          />
          {imagesPreview.length > 0 ? (
            <div className="flex gap-2 flex-wrap mt-2 pointer-events-none">
              {imagesPreview.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Preview ${i}`}
                  className="w-24 h-24 object-cover rounded border"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center pointer-events-none">
              Cliquez ou glissez pour ajouter des images (max 5)
            </p>
          )}
        </div>
      </FormFiled>
    </div>
  )
}

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex gap-x-2 items-center text-accent mb-4">
    {icon}
    <h2 className="text-lg font-semibold">{title}</h2>
  </div>
)