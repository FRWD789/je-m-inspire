// fontendTsx/src/features/events/hooks/useEventForm.ts
// MODIFICATION : Ajouter les lignes marquées ✅ NOUVEAU

import { useState } from 'react'; // ✅ NOUVEAU
import { useEvent } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { useCompressedFiles } from '@/context/CompressedFilesContext';
import type { CreateEventData, UpdateEventData } from '@/types/events';

interface UseEventFormProps {
  type: 'create' | 'edit';
  eventId?: number;
  onSuccess?: () => void;
}

// ✅ NOUVEAU : Export des états de synchronisation sociale
export function useSocialSync() {
  const [syncToSocial, setSyncToSocial] = useState(false);
  const [socialPlatforms, setSocialPlatforms] = useState<string[]>([]);

  return {
    syncToSocial,
    setSyncToSocial,
    socialPlatforms,
    setSocialPlatforms
  };
}

export default function useEventForm({ type, eventId, onSuccess }: UseEventFormProps) {
  const { createEvent, updateEvent } = useEvent();
  const { user } = useAuth();
  const { 
    thumbnailFile, 
    bannerFile, 
    imagesFiles, 
    deletedImageIds, 
    imagesOrder,
    deleteThumbnail,
    deleteBanner,
    clearFiles 
  } = useCompressedFiles();

  // ✅ NOUVEAU : Modifier cette fonction pour accepter syncToSocial et socialPlatforms
  const handleSubmit = async (
    values: any, 
    syncToSocial?: boolean,  // ✅ NOUVEAU
    socialPlatforms?: string[] // ✅ NOUVEAU
  ) => {
    try {
      const priority = user?.roles?.[0]?.role === 'professionnel' ? 1 : 2;
      
      console.log('🚀 [useEventForm] ============ DÉBUT SOUMISSION ============');
      console.log('📋 [useEventForm] Type:', type);
      console.log('📋 [useEventForm] EventId:', eventId);
      
      // ✅ NOUVEAU : Log des paramètres sociaux
      if (syncToSocial) {
        console.log('📱 [useEventForm] ======== SYNCHRONISATION SOCIALE ========');
        console.log('  Sync activé:', syncToSocial);
        console.log('  Plateformes:', socialPlatforms || []);
      }
      
      // 🔥 AFFICHER LES FICHIERS COMPRESSÉS DU CONTEXT
      console.log('📸 [useEventForm] ======== FICHIERS COMPRESSÉS (Context) ========');
      console.log('  Thumbnail:', thumbnailFile ? `${thumbnailFile.name} (${(thumbnailFile.size / 1024).toFixed(2)} KB)` : 'AUCUN');
      console.log('  Banner:', bannerFile ? `${bannerFile.name} (${(bannerFile.size / 1024).toFixed(2)} KB)` : 'AUCUN');
      console.log('  Images:', imagesFiles.length > 0 ? `${imagesFiles.length} fichier(s)` : 'AUCUN');
      imagesFiles.filter(file => file && file instanceof File).forEach((file, i) => {
        console.log(`    - Image ${i + 1}: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      });
      
      console.log('🗑️  [useEventForm] Images à supprimer:', deletedImageIds.length > 0 ? deletedImageIds : 'AUCUNE');
      console.log('🔢 [useEventForm] Ordre des images:', imagesOrder.length > 0 ? imagesOrder : 'AUCUN');
      
      const data = {
        ...values,
        base_price: Number(values.base_price),
        capacity: values.capacity ? Number(values.capacity) : undefined,
        max_places: Number(values.max_places),
        priority,
        localisation_lat: values.localisation_lat ? Number(values.localisation_lat) : 48.8566,
        localisation_lng: values.localisation_lng ? Number(values.localisation_lng) : 2.3522,
      };

      const formData = new FormData();

      // Scalar fields
      const SCALAR_FIELDS = [
        'name',
        'description',
        'start_date',
        'end_date',
        'base_price',
        'capacity',
        'max_places',
        'priority',
        'level',
        'localisation_address',
        'localisation_lat',
        'localisation_lng',
        'categorie_event_id',
      ];

      SCALAR_FIELDS.forEach(key => {
        const value = data[key as keyof typeof data];
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // ✅ NOUVEAU : Ajouter les paramètres de synchronisation sociale
      if (syncToSocial && type === 'create') {
        formData.append('sync_to_social', 'true');
        formData.append('enable_social_sync', 'true');
        
        if (socialPlatforms && socialPlatforms.length > 0) {
          socialPlatforms.forEach(platform => {
            formData.append('social_platforms[]', platform);
          });
        }
        
        console.log('✅ [useEventForm] Paramètres sociaux ajoutés au FormData');
      }

      // Files
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
        console.log(`  ✅ Thumbnail ajouté: ${thumbnailFile.name} (${(thumbnailFile.size / 1024).toFixed(2)} KB)`);
      }
      
      if (bannerFile) {
        formData.append('banner', bannerFile);
        console.log(`  ✅ Banner ajouté: ${bannerFile.name} (${(bannerFile.size / 1024).toFixed(2)} KB)`);
      }
      
      if (imagesFiles.length > 0) {
        const validFiles = imagesFiles.filter(file => file && file instanceof File);
        
        if (validFiles.length !== imagesFiles.length) {
          console.warn(`⚠️  [useEventForm] ${imagesFiles.length - validFiles.length} fichier(s) invalide(s) ignoré(s)`);
        }
        
        validFiles.forEach((file, index) => {
          formData.append('images[]', file);
          console.log(`  ✅ Image ${index + 1} ajoutée: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
        });
      }

      // Edit-specific: deleted images and order
      if (type === 'edit') {
        if (deleteThumbnail) {
          formData.append('delete_thumbnail', '1');
        }
        if (deleteBanner) {
          formData.append('delete_banner', '1');
        }
        if (deletedImageIds.length > 0) {
          deletedImageIds.forEach(id => {
            formData.append('deleted_image_ids[]', String(id));
          });
        }
        if (imagesOrder.length > 0) {
          imagesOrder.forEach(id => {
            formData.append('images_order[]', String(id));
          });
        }
      }

      // Execute action
      if (type === 'create') {
        console.log('🆕 [useEventForm] ======== CRÉATION ÉVÉNEMENT ========');
        await createEvent(formData as CreateEventData);
      } else if (type === 'edit' && eventId) {
        console.log('✏️  [useEventForm] ======== MISE À JOUR ÉVÉNEMENT ========');
        await updateEvent(eventId, formData as UpdateEventData);
      }

      console.log('✅ [useEventForm] ============ SOUMISSION RÉUSSIE ============');
      
      clearFiles();
      console.log('🗑️  [useEventForm] Fichiers nettoyés du Context');
      
      onSuccess?.();
    } catch (error) {
      console.error('❌ [useEventForm] Erreur soumission:', error);
      throw error;
    }
  };

  return {
    handleSubmit
  };
}