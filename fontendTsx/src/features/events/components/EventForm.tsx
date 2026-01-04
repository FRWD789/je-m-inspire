// src/features/events/components/EventForm.tsx
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  Plus,
  Share2 // ✅ NOUVEAU
} from 'lucide-react'
import { createEventSchema, editEventSchema } from '@/schema/eventSchema'

import useEventForm, { useSocialSync } from '../hooks/useEventForm' // ✅ MODIFIÉ
import Button from '@/components/ui/button'
import FormFiled from '@/components/utils/form/formFiled'
import TextArea from '@/components/ui/textArea'
import Input from '@/components/ui/input'
import Select from '@/components/ui/select'
import Form from '@/components/form'
import AutocompleteInputV2 from '@/components/ui/autoCompleteInputV2'
import { compressImage } from '@/components/utils/image/imageCompression'
import { useCompressedFiles } from '@/context/CompressedFilesContext'
import SocialSyncToggle from './SocialSyncToggle' // ✅ NOUVEAU

// 🚀 OPTIMISATION : Créer des previews optimisés pour affichage uniquement
// 🚀 V2 : Utilise Blob URL au lieu de data URL (beaucoup plus léger en mémoire)
// 🎯 Paramètres configurables selon le type d'image
async function createLightPreview(
  file: File, 
  maxSize: number = 150, 
  quality: number = 0.6
): Promise<string> {
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
        
        let width = img.width
        let height = img.height
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // 🎨 Meilleur rendu
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'))
              return
            }
            
            const blobUrl = URL.createObjectURL(blob)
            
            console.log(`  🔍 Preview: ${width}x${height}, ${(blob.size / 1024).toFixed(2)}KB @ ${quality * 100}%`)
            
            resolve(blobUrl)
          },
          'image/jpeg',
          quality
        )
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



export default function EventForm({ type, eventId, defaultValues, onSuccess }: FormEventsProps) {
  const { t } = useTranslation()
  const { handleSubmit } = useEventForm({ type, eventId, onSuccess })

  // ✅ NOUVEAU : États pour synchronisation sociale
  const { 
    syncToSocial, 
    setSyncToSocial, 
    socialPlatforms, 
    setSocialPlatforms 
  } = useSocialSync()

  // ← DÉPLACER les constantes ici pour accéder à t()
  const LEVEL_OPTIONS = [
    { description: t('eventForm.levelBeginner'), value: 'débutant' },
    { description: t('eventForm.levelIntermediate'), value: 'intermédiaire' },
    { description: t('eventForm.levelAdvanced'), value: 'avancé' },
    { description: t('eventForm.levelExpert'), value: 'expert' },
  ]

  const CATEGORY_OPTIONS = [
    { value: 1, description: t('eventForm.categoryMeditation') },
    { value: 2, description: t('eventForm.categoryYoga') },
    { value: 3, description: t('eventForm.categorySanté') },
    { value: 4, description: t('eventForm.categoryRetraite') },
  ]

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

  // ✅ NOUVEAU : Wrapper pour passer les params sociaux
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
          <Button 
            type="submit" 
            className="flex-1"
          >
            {type === 'create' ? t('eventForm.createEvent') : t('eventForm.editEvent')}
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
const GeneralInfoSection = ({ t }: { t: any }) => (
  <div className="space-y-6">
    <SectionHeader icon={<TextAlignStart />} title={t('eventForm.generalInfo')} />
    <div className="space-y-5">
      <FormFiled htmlFor='name' label={t('eventForm.eventName')}>
        <Input 
          name="name" 
          placeholder={t('eventForm.eventNamePlaceholder')}
          enhanced={true}
        />
      </FormFiled>
      <FormFiled htmlFor='description' label={t('eventForm.description')}>
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
      <APIProvider apiKey="AIzaSyCLD-sPCtHIZVGtpp8K-ok97RR26UStQqM" libraries={['places']}>
        <AutocompleteInputV2 name={'localisation_address'} value={defaultValues?.localisation_address} />
        {type === "edit" && (
          <Input type="hidden" name="localisation_id" value={defaultValues?.localisation?.id || ''} />
        )}
      </APIProvider>
    </div>
  </div>
)

// Dates & Capacity Section - Style amélioré avec grid responsive
const DatesCapacitySection = ({ type, t }: any) => (
  <div className="space-y-6">
    <SectionHeader icon={<Users />} title={t('eventForm.datesCapacity')} />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <FormFiled htmlFor='start_date' label={t('eventForm.startDate')}>
        <Input 
          type="datetime-local" 
          name="start_date" 
          enhanced={true}
        />
      </FormFiled>
      <FormFiled htmlFor='end_date' label={t('eventForm.endDate')}>
        <Input 
          type="datetime-local" 
          name="end_date"
          enhanced={true}
        />
      </FormFiled>
      <FormFiled htmlFor='base_price' label={t('eventForm.price')}>
        <Input 
          type="number" 
          name="base_price" 
          placeholder="0.00"
          enhanced={true}
          step="0.01"
        />
      </FormFiled>
      <FormFiled htmlFor='capacity' label={t('eventForm.totalCapacity')}>
        <Input 
          type="number" 
          name="capacity" 
          placeholder="50"
          enhanced={true}
        />
      </FormFiled>
      <FormFiled htmlFor='max_places' label={t('eventForm.availablePlaces')}>
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
const EventSettingsSection = ({ levelOptions, categoryOptions, t }: any) => (
  <div className="space-y-6">
    <SectionHeader icon={<Settings />} title={t('eventForm.eventSettings')} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <FormFiled htmlFor='level' label={t('eventForm.requiredLevel')}>
        <Select 
          options={levelOptions} 
          name="level" 
          placeholder={t('eventForm.selectLevel')}
          enhanced={true}
        />
      </FormFiled>
      <FormFiled htmlFor="categorie_event_id" label={t('eventForm.category')}>
        <Select 
          options={categoryOptions} 
          name="categorie_event_id" 
          placeholder={t('eventForm.selectCategory')}
          enhanced={true}
        />
      </FormFiled>
    </div>
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

// 🚀 ULTRA-OPTIMISÉ : Gestionnaire d'images avec drag & drop ultra-fluide
const ImagesSection = ({ type, defaultValues, t }: { type?: 'create' | 'edit'; defaultValues?: any; t: any }) => {
  // ✅ Utiliser les setters du contexte (avec deleteThumbnail et deleteBanner)
  const { 
    setThumbnailFile, 
    setBannerFile, 
    setImagesFiles, 
    setDeletedImageIds,
    setImagesOrder,
    setDeleteThumbnail,    // ✅ Flag suppression thumbnail
    setDeleteBanner,       // ✅ Flag suppression banner
    clearFiles 
  } = useCompressedFiles()
  
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [imagesPreview, setImagesPreview] = useState<{ id: string; url: string; isExisting?: boolean }[]>([])
  
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionStatus, setCompressionStatus] = useState<string>('')
  const [isLoadingExisting, setIsLoadingExisting] = useState(false)
  
  // 🚀 ULTRA-OPTIMISATION : useRef pour éviter TOUT re-render pendant le drag
  const draggedIndexRef = useRef<number | null>(null)
  const dragOverIndexRef = useRef<number | null>(null)
  
  // État minimal uniquement pour le style de l'élément draggé (mis à jour 1 seule fois)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  
  // 🧹 CLEANUP : Révoquer les Blob URLs pour éviter fuites mémoire
  useEffect(() => {
    return () => {
      // Nettoyer thumbnail (seulement si c'est un Blob URL)
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreview)
      }
      
      // Nettoyer banner (seulement si c'est un Blob URL)
      if (bannerPreview && bannerPreview.startsWith('blob:')) {
        URL.revokeObjectURL(bannerPreview)
      }
      
      // Nettoyer galerie (seulement si ce sont des Blob URLs)
      imagesPreview.forEach(img => {
        if (img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url)
        }
      })
      
      console.log('🧹 [ImagesSection] Blob URLs nettoyés')
    }
  }, [])

  // 🆕 CHARGEMENT DES IMAGES EXISTANTES EN MODE EDIT
  useEffect(() => {
    if (type === 'edit' && defaultValues) {
      // 🧹 IMPORTANT : Nettoyer le contexte AVANT de charger les images existantes
      clearFiles()
      loadExistingImages()
    }
  }, [type, defaultValues])

  // ✅ CORRIGÉ : Utiliser directement les URLs backend au lieu de Blob URLs
  const loadExistingImages = async () => {
    setIsLoadingExisting(true)
    setCompressionStatus(t('eventForm.loadingExistingImages'))
    
    try {
      // 1. Charger thumbnail - Utiliser directement l'URL du backend
      if (defaultValues.thumbnail) {
        console.log('📸 [ImagesSection] === CHARGEMENT THUMBNAIL ===')
        console.log('  URL backend:', defaultValues.thumbnail)
        
        // ✅ Utiliser directement l'URL du backend (déjà optimisée)
        // Si des variantes existent, utiliser _md pour le preview, sinon l'original
        const thumbnailUrl = defaultValues.thumbnail_variants?.md 
          || defaultValues.thumbnail_variants?.md_webp
          || defaultValues.thumbnail
        
        setThumbnailPreview(thumbnailUrl)
        console.log('  ✅ URL preview:', thumbnailUrl)
        // ❌ NE PAS charger le fichier dans le contexte
        // Le contexte reste vide si l'utilisateur ne modifie pas l'image
      }
      
      // 2. Charger banner - Utiliser directement l'URL du backend
      if (defaultValues.banner) {
        console.log('🎨 [ImagesSection] === CHARGEMENT BANNER ===')
        console.log('  URL backend:', defaultValues.banner)
        
        // ✅ Utiliser directement l'URL du backend (déjà optimisée)
        const bannerUrl = defaultValues.banner_variants?.md
          || defaultValues.banner_variants?.md_webp
          || defaultValues.banner
        
        setBannerPreview(bannerUrl)
        console.log('  ✅ URL preview:', bannerUrl)
        // ❌ NE PAS charger le fichier dans le contexte
      }
      
      // 3. Charger galerie d'images - Utiliser directement les URLs du backend
      if (defaultValues.images && Array.isArray(defaultValues.images) && defaultValues.images.length > 0) {
        console.log('🖼️ [ImagesSection] === CHARGEMENT GALERIE ===')
        console.log(`  Total: ${defaultValues.images.length} images`)
        
        const loadedPreviews: { id: string; url: string; isExisting: boolean }[] = []
        
        for (let i = 0; i < defaultValues.images.length; i++) {
          const image = defaultValues.images[i]
          try {
            // ✅ Utiliser directement les variantes du backend
            const imageUrl = image.variants?.md
              || image.variants?.md_webp
              || image.url 
              || image.path 
              || image
            
            const imageId = image.id
            
            console.log(`  📥 Image ${i + 1}/${defaultValues.images.length}: ${imageId}`)
            console.log(`    ✅ URL preview:`, imageUrl)
            
            loadedPreviews.push({
              id: `existing-${imageId || Date.now()}`,
              url: imageUrl,
              isExisting: true
            })
          } catch (error) {
            console.error(`    ❌ Erreur chargement image ${i + 1}:`, error)
          }
        }
        
        setImagesPreview(loadedPreviews)
        
        // ✅ Initialiser l'ordre des images
        const initialOrder = loadedPreviews.map(img => parseInt(img.id.replace('existing-', '')))
        setImagesOrder(initialOrder)
        console.log('🔢 [ImagesSection] Ordre initial:', initialOrder)
        
        console.log(`\n📊 [ImagesSection] RÉSUMÉ:`)
        console.log(`  Total images: ${loadedPreviews.length}`)
        console.log(`  Type: URLs backend directes (pas de Blob URL)`)
        console.log(`  ✅ Images existantes chargées!`)
        // ❌ NE PAS charger les fichiers dans le contexte
      }
      
      setCompressionStatus(t('eventForm.existingImagesLoaded'))
      setTimeout(() => setCompressionStatus(''), 2000)
    } catch (error) {
      console.error('❌ [ImagesSection] Erreur chargement images existantes:', error)
      setCompressionStatus(t('eventForm.loadingError'))
    } finally {
      setIsLoadingExisting(false)
    }
  }

  // ✅ Compression unique (thumbnail/banner) avec TYPE SPÉCIFIQUE
  const handleSingleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (v: string | null) => void,
    setFile: (file: File | null) => void,
    imageType: 'thumbnail' | 'banner'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsCompressing(true)
    setCompressionStatus(t('eventForm.compressing'))

    try {
      // ✅ Compression avec dimensions spécifiques selon le type
      const compressed = await compressImage(file, imageType)
      setFile(compressed)
      
      // 🎯 Preview de meilleure qualité selon le type
      const previewSize = imageType === 'thumbnail' ? 200 : 300
      const previewQuality = 0.7
      const lightPreview = await createLightPreview(file, previewSize, previewQuality)
      setPreview(lightPreview)
      
      console.log(`✅ [ImagesSection] ${imageType} compressé et prêt`)
    } catch (error) {
      console.error('❌ [ImagesSection] Erreur compression:', error)
      setCompressionStatus(t('eventForm.compressionError'))
    } finally {
      setIsCompressing(false)
      setTimeout(() => setCompressionStatus(''), 2000)
    }
  }

  // ✅ Compression multiple avec TYPE GALLERY
  const handleMultipleImagesChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsCompressing(true)
    const filesArray = Array.from(files)

    try {
      const compressedFiles: File[] = []
      const newPreviews: { id: string; url: string; isExisting?: boolean }[] = []

      for (let i = 0; i < filesArray.length; i++) {
        setCompressionStatus(t('eventForm.compressingProgress', { current: i + 1, total: filesArray.length }))
        
        // ✅ Compression galerie (1200px, 85%)
        const compressed = await compressImage(filesArray[i], 'gallery')
        compressedFiles.push(compressed)
        
        // 🎯 Preview légèrement meilleure qualité pour galerie (150px @ 60%)
        const lightPreview = await createLightPreview(filesArray[i], 150, 0.6)
        newPreviews.push({
          id: `new-${Date.now()}-${i}`,
          url: lightPreview,
          isExisting: false
        })
      }

      // 🎯 AJOUTER aux images existantes (ne pas écraser)
      setImagesPreview(prev => [...prev, ...newPreviews])
      setImagesFiles(prev => [...(Array.isArray(prev) ? prev : []), ...compressedFiles])
      
      console.log(`✅ [ImagesSection] ${compressedFiles.length} images galerie ajoutées`)
    } catch (error) {
      console.error('❌ [ImagesSection] Erreur compression:', error)
    } finally {
      setIsCompressing(false)
      setCompressionStatus(t('eventForm.compressionError'))
    }
  }

  // ✅ CORRIGÉ : Supprimer une image de la galerie et tracker les suppressions
  const removeImage = (index: number) => {
    const imageToRemove = imagesPreview[index]
    
    // 🧹 Nettoyer le Blob URL pour éviter fuite mémoire (seulement si c'est un Blob URL)
    if (imageToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url)
      console.log(`🧹 [ImagesSection] Blob URL révoqué pour image ${index}`)
    }
    
    // ✅ Si c'est une image existante, l'ajouter à la liste des suppressions
    if (imageToRemove.isExisting && imageToRemove.id.startsWith('existing-')) {
      const imageId = parseInt(imageToRemove.id.replace('existing-', ''))
      setDeletedImageIds(prev => [...prev, imageId])
      console.log(`🗑️ [ImagesSection] Image ${imageId} marquée pour suppression`)
    }
    
    // 🔥 CORRECTION : Calculer TOUT ce qu'on a besoin AVANT de modifier les états
    // pour éviter les bugs de closure avec des valeurs stales
    const isExisting = imageToRemove.isExisting
    let fileIndexToRemove = -1
    
    if (!isExisting) {
      // Calculer l'index réel dans les fichiers (en soustrayant les images existantes avant cet index)
      const existingBeforeThisIndex = imagesPreview.slice(0, index).filter(img => img.isExisting).length
      fileIndexToRemove = index - existingBeforeThisIndex
      console.log(`📍 [ImagesSection] Suppression nouvelle image - Preview index: ${index}, File index: ${fileIndexToRemove}`)
    }
    
    // Maintenant on peut modifier les états en toute sécurité
    setImagesPreview(prev => prev.filter((_, i) => i !== index))
    
    // Ne retirer des fichiers QUE si c'est une nouvelle image
    if (!isExisting && fileIndexToRemove >= 0) {
      setImagesFiles((prev: File[]) => {
        console.log(`  📤 Avant suppression : ${prev.length} fichiers`)
        const newFiles = prev.filter((_, i) => i !== fileIndexToRemove)
        console.log(`  📥 Après suppression : ${newFiles.length} fichiers`)
        return newFiles
      })
    }
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

    // ✅ Réorganiser et mettre à jour imagesOrder
    setImagesPreview(prev => {
      const newPreviews = [...prev]
      const draggedItem = newPreviews[draggedIdx]
      newPreviews.splice(draggedIdx, 1)
      newPreviews.splice(dropIndex, 0, draggedItem)
      
      // ✅ Mettre à jour l'ordre dans le contexte
      const existingImages = newPreviews.filter(img => img.isExisting)
      const imageIds = existingImages.map(img => parseInt(img.id.replace('existing-', '')))
      setImagesOrder(imageIds)
      console.log('🔢 [ImagesSection] Ordre mis à jour:', imageIds)
      
      return newPreviews
    })
    
    // Réorganiser les fichiers aussi (seulement les nouveaux fichiers)
    setImagesFiles((prevFiles: File[]) => {
      // Calculer les indices réels dans prevFiles
      const existingBeforeDragged = imagesPreview.slice(0, draggedIdx).filter(img => img.isExisting).length
      const existingBeforeDrop = imagesPreview.slice(0, dropIndex).filter(img => img.isExisting).length
      
      const draggedFileIdx = draggedIdx - existingBeforeDragged
      const dropFileIdx = dropIndex - existingBeforeDrop
      
      const newFiles = [...prevFiles]
      const draggedFile = newFiles[draggedFileIdx]
      newFiles.splice(draggedFileIdx, 1)
      newFiles.splice(dropFileIdx, 0, draggedFile)
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
      <SectionHeader icon={<ImageUp />} title={t('eventForm.eventImages')} />

      {/* Status de compression */}
      {(isCompressing || isLoadingExisting) && (
        <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
          <span className="text-sm font-medium text-accent">{compressionStatus}</span>
        </div>
      )}

      {/* Thumbnail */}
      <div className="space-y-2">
      <label className="block text-sm font-medium text-primary">
        {t('eventForm.thumbnailLabel')}
      </label>
        <div className="relative">
          <input
            type="file"
            name="thumbnail"
            accept="image/*"
            disabled={isCompressing}
            onChange={(e) => handleSingleImageChange(e, setThumbnailPreview, setThumbnailFile, 'thumbnail')}
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
                    e.stopPropagation()
                    setThumbnailPreview(null)
                    setThumbnailFile(null)
                    setDeleteThumbnail(true)  // ✅ MODIFICATION 1 : Flag pour supprimer
                    console.log('🗑️ [ImagesSection] Thumbnail marqué pour suppression')
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
                  {t('eventForm.clickToAddImage')}
                </p>
                <p className="text-xs text-secondary">{t('eventForm.imageFormat')}</p>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Banner */}
      <div className="space-y-2">
      <label className="block text-sm font-medium text-primary">
        {t('eventForm.bannerLabel')}
      </label>
        <div className="relative">
          <input
            type="file"
            name="banner"
            accept="image/*"
            disabled={isCompressing}
            onChange={(e) => handleSingleImageChange(e, setBannerPreview, setBannerFile, 'banner')}
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
                    e.stopPropagation()
                    setBannerPreview(null)
                    setBannerFile(null)
                    setDeleteBanner(true)  // ✅ MODIFICATION 2 : Flag pour supprimer
                    console.log('🗑️ [ImagesSection] Banner marqué pour suppression')
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
                  {t('eventForm.clickToAddBanner')}
                </p>
                <p className="text-xs text-secondary">{t('eventForm.bannerFormat')}</p>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Galerie d'images avec drag & drop */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-primary">
          {t('eventForm.galleryLabel')}
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
                ? t('eventForm.galleryLimitReached')
                : t('eventForm.addImagesToGallery')
              }
            </p>
            <p className="text-xs text-secondary mt-1">
              {t('eventForm.imagesCount', { count: imagesPreview.length })}
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
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(index)
                    }}
                    className="delete-image-btn"
                    title={t('eventForm.deleteImage')}
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