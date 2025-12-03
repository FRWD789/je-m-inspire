// src/features/events/components/EventForm.tsx
import { useState, useRef } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import { 
  ImageUp, 
  MapPinned, 
  Settings, 
  TextAlignStart, 
  Users, 
  Loader2,
  X,
  GripVertical,
  Plus
} from 'lucide-react'
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
import { useCompressedFiles } from '@/context/CompressedFilesContext'

// 🚀 OPTIMISATION : Créer des previews ultra-légers pour affichage uniquement
async function createLightPreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }
        
        // 🎯 200px max pour preview (au lieu de taille réelle)
        const MAX_PREVIEW_SIZE = 200
        
        let width = img.width
        let height = img.height
        
        if (width > height) {
          if (width > MAX_PREVIEW_SIZE) {
            height = (height * MAX_PREVIEW_SIZE) / width
            width = MAX_PREVIEW_SIZE
          }
        } else {
          if (height > MAX_PREVIEW_SIZE) {
            width = (width * MAX_PREVIEW_SIZE) / height
            height = MAX_PREVIEW_SIZE
          }
        }
        
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        
        // 60% qualité pour preview ultra-léger (10-30KB au lieu de 500KB+)
        const previewDataUrl = canvas.toDataURL('image/jpeg', 0.6)
        resolve(previewDataUrl)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

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
    <div className="max-w-4xl mx-auto">
      <Form
        schema={type === 'create' ? createEventSchema : editEventSchema}
        defaultValues={formattedDefaults}
        onSubmit={handleSubmit}
      >
        <GeneralInfoSection />
        <SectionDivider />
        <LocationSection type={type} defaultValues={formattedDefaults} />
        <SectionDivider />
        <DatesCapacitySection type={type} />
        <SectionDivider />
        <EventSettingsSection />
        <SectionDivider />
        <ImagesSection />
        
        <div className="mt-8 flex gap-4">
          <Button 
            type="submit" 
            className="flex-1"
          >
            {type === 'create' ? 'Créer l\'événement' : 'Modifier l\'événement'}
          </Button>
        </div>
      </Form>
    </div>
  )
}

// Divider amélioré
const SectionDivider = () => (
  <div className="my-8">
    <div className="h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
  </div>
)

// General Info Section - Style amélioré
const GeneralInfoSection = () => (
  <div className="space-y-6">
    <SectionHeader icon={<TextAlignStart />} title="Informations générales" />
    <div className="space-y-5">
      <FormFiled htmlFor='name' label="Nom de l'événement *">
        <Input 
          name="name" 
          placeholder="Ex: Retraite de méditation en montagne" 
          enhanced={true}
        />
      </FormFiled>
      <FormFiled htmlFor='description' label="Description *">
        <TextArea 
          name="description" 
          placeholder="Décrivez votre événement en détails..."
          enhanced={true}
        />
      </FormFiled>
    </div>
  </div>
)

const LocationSection = ({ type, defaultValues }: any) => (
  <div className="space-y-6">
    <SectionHeader icon={<MapPinned />} title="Localisation" />
    <APIProvider apiKey="AIzaSyCLD-sPCtHIZVGtpp8K-ok97RR26UStQqM" libraries={['places']}>
      <AutocompleteInputV2 name={'localisation_address'} value={defaultValues?.localisation_address} />
      {type === "edit" && (
        <Input type="hidden" name="localisation_id" value={defaultValues?.localisation?.id || ''} />
      )}
    </APIProvider>
  </div>
)

// Dates & Capacity Section - Style amélioré avec grid responsive
const DatesCapacitySection = ({ type }: any) => (
  <div className="space-y-6">
    <SectionHeader icon={<Users />} title="Dates et capacité" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <FormFiled htmlFor='start_date' label="Date de début *">
        <Input 
          type="datetime-local" 
          name="start_date" 
          enhanced={true}
        />
      </FormFiled>
      <FormFiled htmlFor='end_date' label="Date de fin *">
        <Input 
          type="datetime-local" 
          name="end_date"
          enhanced={true}
        />
      </FormFiled>
      <FormFiled htmlFor='base_price' label="Prix (CAD) *">
        <Input 
          type="number" 
          name="base_price" 
          placeholder="0.00"
          enhanced={true}
          step="0.01"
        />
      </FormFiled>
      <FormFiled htmlFor='capacity' label="Capacité totale *">
        <Input 
          type="number" 
          name="capacity" 
          placeholder="50"
          enhanced={true}
        />
      </FormFiled>
      <FormFiled htmlFor='max_places' label="Places disponibles *">
        <Input 
          type="number" 
          name="max_places" 
          placeholder="50"
          enhanced={true}
        />
      </FormFiled>
    </div>
  </div>
)

// Event Settings Section - Style amélioré
const EventSettingsSection = () => (
  <div className="space-y-6">
    <SectionHeader icon={<Settings />} title="Paramètres de l'événement" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <FormFiled htmlFor='level' label="Niveau requis *">
        <Select 
          options={LEVEL_OPTIONS} 
          name="level" 
          placeholder="Sélectionnez le niveau"
          enhanced={true}
        />
      </FormFiled>
      <FormFiled htmlFor="categorie_event_id" label="Catégorie *">
        <Select 
          options={CATEGORY_OPTIONS} 
          name="categorie_event_id" 
          placeholder="Sélectionnez une catégorie"
          enhanced={true}
        />
      </FormFiled>
    </div>
  </div>
)

// 🚀 ULTRA-OPTIMISÉ : Gestionnaire d'images avec drag & drop ultra-fluide
const ImagesSection = () => {
  const { setThumbnailFile, setBannerFile, setImagesFiles } = useCompressedFiles()
  
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [imagesPreview, setImagesPreview] = useState<{ id: string; url: string }[]>([])
  
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionStatus, setCompressionStatus] = useState<string>('')
  
  // 🚀 ULTRA-OPTIMISATION : useRef pour éviter TOUT re-render pendant le drag
  const draggedIndexRef = useRef<number | null>(null)
  const dragOverIndexRef = useRef<number | null>(null)
  
  // État minimal uniquement pour le style de l'élément draggé (mis à jour 1 seule fois)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Compression unique (thumbnail/banner)
  const handleSingleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (v: string | null) => void,
    setFile: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsCompressing(true)
    setCompressionStatus('Compression en cours...')

    try {
      // 1. Comprimer le fichier pour l'upload (qualité optimale)
      const compressed = await compressImage(file)
      setFile(compressed)
      
      // 2. Créer un preview ultra-léger pour l'affichage (60% qualité, 200px max)
      const lightPreview = await createLightPreview(file)
      setPreview(lightPreview)
      
      console.log(`✅ [ImagesSection] ${file.name} compressé:`, {
        original: `${(file.size / 1024).toFixed(0)}KB`,
        compressed: `${(compressed.size / 1024).toFixed(0)}KB`,
        preview: `${(lightPreview.length / 1024).toFixed(0)}KB (data URL)`
      })
    } catch (error) {
      console.error('❌ [ImagesSection] Erreur compression:', error)
      setCompressionStatus('Erreur lors de la compression')
    } finally {
      setIsCompressing(false)
      setTimeout(() => setCompressionStatus(''), 2000)
    }
  }

  // Compression multiple avec gestion d'ordre
  const handleMultipleImagesChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsCompressing(true)
    const filesArray = Array.from(files)

    try {
      const compressedFiles: File[] = []
      const newPreviews: { id: string; url: string }[] = []

      for (let i = 0; i < filesArray.length; i++) {
        setCompressionStatus(`Compression ${i + 1}/${filesArray.length}...`)
        
        // 1. Comprimer pour l'upload
        const compressed = await compressImage(filesArray[i])
        compressedFiles.push(compressed)
        
        // 2. Créer preview ultra-léger pour affichage (60% qualité, 200px max)
        const lightPreview = await createLightPreview(filesArray[i])
        newPreviews.push({
          id: `${Date.now()}-${i}`,
          url: lightPreview, // Preview léger au lieu de l'original
        })
      }

      setImagesPreview(prev => [...prev, ...newPreviews])
      setImagesFiles(prev => [...(Array.isArray(prev) ? prev : []), ...compressedFiles])
      
      console.log(`✅ [ImagesSection] ${compressedFiles.length} images ajoutées (previews ultra-légers)`)
    } catch (error) {
      console.error('❌ [ImagesSection] Erreur compression:', error)
    } finally {
      setIsCompressing(false)
      setCompressionStatus('')
    }
  }

  // Supprimer une image de la galerie
  const removeImage = (index: number) => {
    setImagesPreview(prev => prev.filter((_, i) => i !== index))
    setImagesFiles((prev: File[]) => prev.filter((_, i) => i !== index))
  }

  // 🚀 ULTRA-OPTIMISÉ : Drag start - mise à jour UNE FOIS
  const handleDragStart = (index: number) => {
    draggedIndexRef.current = index
    setDraggedIndex(index) // Mise à jour 1x pour le style CSS
  }

  // 🚀 ULTRA-OPTIMISÉ : DragOver - ZERO setState, manipulation DOM directe
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    
    if (draggedIndexRef.current === null || draggedIndexRef.current === index) return
    
    // 🎯 ZERO setState ! Feedback visuel via DOM uniquement
    const target = e.currentTarget as HTMLElement
    
    // Si changement d'index, nettoyer l'ancien et appliquer le nouveau
    if (dragOverIndexRef.current !== index) {
      // Retirer le style de l'ancien élément survolé
      if (dragOverIndexRef.current !== null) {
        const oldElement = document.querySelector(`[data-image-index="${dragOverIndexRef.current}"]`)
        oldElement?.classList.remove('drag-over')
      }
      
      // Appliquer le style au nouvel élément survolé
      target.classList.add('drag-over')
      dragOverIndexRef.current = index
    }
  }

  // 🚀 ULTRA-OPTIMISÉ : Drop - réorganisation UNE SEULE FOIS
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    const draggedIdx = draggedIndexRef.current
    
    if (draggedIdx === null || draggedIdx === dropIndex) {
      // Reset sans réorganisation
      draggedIndexRef.current = null
      dragOverIndexRef.current = null
      setDraggedIndex(null)
      
      // Nettoyer les classes CSS
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
      return
    }

    // Réorganiser en une seule fois
    setImagesPreview(prev => {
      const newPreviews = [...prev]
      const draggedItem = newPreviews[draggedIdx]
      newPreviews.splice(draggedIdx, 1)
      newPreviews.splice(dropIndex, 0, draggedItem)
      return newPreviews
    })
    
    // Réorganiser les fichiers aussi
    setImagesFiles((prevFiles: File[]) => {
      const newFiles = [...prevFiles]
      const draggedFile = newFiles[draggedIdx]
      newFiles.splice(draggedIdx, 1)
      newFiles.splice(dropIndex, 0, draggedFile)
      return newFiles
    })

    // Reset
    draggedIndexRef.current = null
    dragOverIndexRef.current = null
    setDraggedIndex(null)
    
    // Nettoyer les classes CSS
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
  }

  const handleDragEnd = () => {
    draggedIndexRef.current = null
    dragOverIndexRef.current = null
    setDraggedIndex(null)
    
    // Nettoyer les classes CSS
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
  }

  return (
    <div className="space-y-6">
      <SectionHeader icon={<ImageUp />} title="Images de l'événement" />

      {/* Status de compression */}
      {isCompressing && (
        <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
          <span className="text-sm font-medium text-accent">{compressionStatus}</span>
        </div>
      )}

      {/* Thumbnail */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-primary">
          Image principale (Thumbnail) *
        </label>
        <div className="relative">
          <input
            type="file"
            name="thumbnail"
            accept="image/*"
            disabled={isCompressing}
            onChange={(e) => handleSingleImageChange(e, setThumbnailPreview, setThumbnailFile)}
            className="hidden"
            id="thumbnail-input"
          />
          <label
            htmlFor="thumbnail-input"
            className={`
              file-upload-zone
              flex flex-col items-center justify-center
              ${thumbnailPreview ? 'has-file' : ''}
              ${isCompressing ? 'disabled' : ''}
            `}
          >
            {thumbnailPreview ? (
              <div className="relative w-full max-w-xs">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setThumbnailPreview(null)
                    setThumbnailFile(null)
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <ImageUp className="w-12 h-12 mx-auto mb-3 text-secondary" />
                <p className="text-sm font-medium text-primary mb-1">
                  Cliquez pour ajouter une image
                </p>
                <p className="text-xs text-secondary">PNG, JPG jusqu'à 10MB</p>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Banner */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-primary">
          Bannière de l'événement *
        </label>
        <div className="relative">
          <input
            type="file"
            name="banner"
            accept="image/*"
            disabled={isCompressing}
            onChange={(e) => handleSingleImageChange(e, setBannerPreview, setBannerFile)}
            className="hidden"
            id="banner-input"
          />
          <label
            htmlFor="banner-input"
            className={`
              file-upload-zone
              flex flex-col items-center justify-center
              ${bannerPreview ? 'has-file' : ''}
              ${isCompressing ? 'disabled' : ''}
            `}
          >
            {bannerPreview ? (
              <div className="relative w-full">
                <img
                  src={bannerPreview}
                  alt="Banner"
                  className="w-full h-56 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setBannerPreview(null)
                    setBannerFile(null)
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <ImageUp className="w-12 h-12 mx-auto mb-3 text-secondary" />
                <p className="text-sm font-medium text-primary mb-1">
                  Cliquez pour ajouter une bannière
                </p>
                <p className="text-xs text-secondary">Format 16:9 recommandé</p>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Galerie d'images avec drag & drop */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-primary">
          Galerie d'images (max 5)
        </label>
        
        {/* Zone d'ajout */}
        <div className="relative">
          <input
            type="file"
            name="images"
            multiple
            accept="image/*"
            disabled={isCompressing || imagesPreview.length >= 5}
            onChange={handleMultipleImagesChange}
            className="hidden"
            id="images-input"
          />
          <label
            htmlFor="images-input"
            className={`
              file-upload-zone
              flex flex-col items-center justify-center
              ${imagesPreview.length >= 5 ? 'disabled' : ''}
            `}
          >
            <Plus className="w-8 h-8 mb-2 text-secondary" />
            <p className="text-sm font-medium text-primary">
              {imagesPreview.length >= 5 
                ? 'Limite de 5 images atteinte' 
                : 'Ajouter des images à la galerie'
              }
            </p>
            <p className="text-xs text-secondary mt-1">
              {imagesPreview.length}/5 images
            </p>
          </label>
        </div>

        {/* 🚀 ULTRA-OPTIMISÉ : Preview avec drag & drop ultra-fluide */}
        {imagesPreview.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
            {imagesPreview.map((img, index) => (
              <div
                key={img.id}
                data-image-index={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  image-preview-item
                  ${draggedIndex === index ? 'dragging' : ''}
                `}
              >
                <img
                  src={img.url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover"
                  loading="lazy"
                  decoding="async"
                />
                
                {/* Overlay avec contrôles */}
                <div className="image-preview-overlay">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="delete-image-btn"
                    title="Supprimer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="drag-handle">
                    <GripVertical className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Indicateur d'ordre */}
                <div className="order-badge">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Header de section amélioré
const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 bg-accent/10 rounded-lg text-accent">
      {icon}
    </div>
    <h2 className="text-xl font-semibold text-primary">{title}</h2>
  </div>
)