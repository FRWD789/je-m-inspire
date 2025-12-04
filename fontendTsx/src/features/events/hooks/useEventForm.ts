// src/features/events/hooks/useEventForm.ts
import { useEvent } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { useCompressedFiles } from '@/context/CompressedFilesContext';
import type { CreateEventData, UpdateEventData } from '@/types/events';

interface UseEventFormProps {
  type: 'create' | 'edit';
  eventId?: number;
  onSuccess?: () => void;
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

  const handleSubmit = async (values: any) => {
    try {
      const priority = user?.roles?.[0]?.role === 'professionnel' ? 1 : 2;
      
      console.log('🚀 [useEventForm] ============ DÉBUT SOUMISSION ============');
      console.log('📋 [useEventForm] Type:', type);
      console.log('📋 [useEventForm] EventId:', eventId);
      
      // 🔥 AFFICHER LES FICHIERS COMPRESSÉS DU CONTEXT
      console.log('📸 [useEventForm] ======== FICHIERS COMPRESSÉS (Context) ========');
      console.log('  Thumbnail:', thumbnailFile ? `${thumbnailFile.name} (${(thumbnailFile.size / 1024).toFixed(2)} KB)` : 'AUCUN');
      console.log('  Banner:', bannerFile ? `${bannerFile.name} (${(bannerFile.size / 1024).toFixed(2)} KB)` : 'AUCUN');
      console.log('  Images:', imagesFiles.length > 0 ? `${imagesFiles.length} fichier(s)` : 'AUCUN');
      imagesFiles.filter(file => file && file instanceof File).forEach((file, i) => {
        console.log(`    - Image ${i + 1}: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      });
      
      // ✅ NOUVEAU : Afficher deletedImageIds et imagesOrder
      console.log('🗑️  [useEventForm] Images à supprimer:', deletedImageIds.length > 0 ? deletedImageIds : 'AUCUNE');
      console.log('🔢 [useEventForm] Ordre des images:', imagesOrder.length > 0 ? imagesOrder : 'AUCUN');
      
      const data = {
        ...values,
        base_price: Number(values.base_price),
        capacity: values.capacity ? Number(values.capacity) : undefined,
        max_places: Number(values.max_places),
        priority,
        localisation_lat: Number(values.localisation_lat || 48.8566),
        localisation_lng: Number(values.localisation_lng || 2.3522),
      };

      // 🔥 FILTRER les champs file et arrays gérés manuellement
      delete data.thumbnail;
      delete data.banner;
      delete data.images;
      delete data.delete_images; // ✅ Géré manuellement depuis le contexte
      delete data.images_order;  // ✅ Géré manuellement depuis le contexte

      const formData = new FormData();
      
      // Ajouter les champs scalaires
      console.log('📝 [useEventForm] Ajout des champs scalaires...');
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && !(value instanceof FileList)) {
          formData.append(key, String(value));
        }
      });
      
      // ✅ NOUVEAU : Ajouter delete_images depuis le contexte (mode EDIT uniquement)
      if (type === 'edit' && deletedImageIds.length > 0) {
        console.log('🗑️  [useEventForm] ======== AJOUT DELETE_IMAGES ========');
        deletedImageIds.forEach((id, index) => {
          formData.append(`delete_images[${index}]`, String(id));
          console.log(`  ✅ delete_images[${index}] = ${id}`);
        });
      }
      
      // ✅ NOUVEAU : Ajouter images_order depuis le contexte (mode EDIT uniquement)
      if (type === 'edit' && imagesOrder.length > 0) {
        console.log('🔢 [useEventForm] ======== AJOUT IMAGES_ORDER ========');
        imagesOrder.forEach((id, index) => {
          formData.append(`images_order[${index}]`, String(id));
          console.log(`  ✅ images_order[${index}] = ${id}`);
        });
      }
      
      // ✅ NOUVEAU : Ajouter flags de suppression thumbnail/banner (mode EDIT uniquement)
      if (type === 'edit') {
         console.log('🔍 [useEventForm] État du contexte avant envoi:', {
          deleteThumbnail,
          deleteBanner,
          thumbnailFile: thumbnailFile?.name,
          bannerFile: bannerFile?.name
        });
        if (deleteThumbnail) {
          formData.append('delete_thumbnail', '1');
          console.log('🗑️  [useEventForm] ✅ delete_thumbnail = 1');
        }
        if (deleteBanner) {
          formData.append('delete_banner', '1');
          console.log('🗑️  [useEventForm] ✅ delete_banner = 1');
        }
      }
      
      // 🔥 UTILISER LES FICHIERS COMPRESSÉS DU CONTEXT
      console.log('📸 [useEventForm] ======== AJOUT FICHIERS COMPRESSÉS ========');
      
      // ✅ En mode CREATE : thumbnail et banner sont OBLIGATOIRES
      // ✅ En mode EDIT : seulement si modifiées (sinon backend garde les existantes)
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
        console.log(`  ✅ Thumbnail ajouté: ${thumbnailFile.name} (${(thumbnailFile.size / 1024).toFixed(2)} KB)`);
      } else {
        if (type === 'create') {
          console.log('  ⚠️  [CREATE] Pas de thumbnail (requis!)');
        } else {
          console.log('  ⏭️  [EDIT] Pas de nouveau thumbnail (garde existant)');
        }
      }
      
      if (bannerFile) {
        formData.append('banner', bannerFile);
        console.log(`  ✅ Banner ajouté: ${bannerFile.name} (${(bannerFile.size / 1024).toFixed(2)} KB)`);
      } else {
        if (type === 'create') {
          console.log('  ⚠️  [CREATE] Pas de banner (requis!)');
        } else {
          console.log('  ⏭️  [EDIT] Pas de nouveau banner (garde existant)');
        }
      }
      
      if (imagesFiles.length > 0) {
        // 🛡️ SÉCURITÉ : Filtrer les undefined/null avant d'envoyer
        const validFiles = imagesFiles.filter(file => file && file instanceof File);
        
        if (validFiles.length !== imagesFiles.length) {
          console.warn(`⚠️  [useEventForm] ${imagesFiles.length - validFiles.length} fichier(s) invalide(s) détecté(s) et ignoré(s)`);
        }
        
        validFiles.forEach((file, index) => {
          formData.append('images[]', file);
          console.log(`  ✅ Image ${index + 1} ajoutée: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
        });
      } else {
        console.log('  ⏭️  Pas d\'images galerie');
      }

      // 🔍 DEBUG : Afficher tout le contenu du FormData
      console.log('📦 [useEventForm] ======== CONTENU FORMDATA FINAL ========');
      let fileCount = 0;
      let scalarCount = 0;
      let arrayCount = 0;
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          fileCount++;
          console.log(`  📎 ${pair[0]}: File(${pair[1].name}, ${(pair[1].size / 1024).toFixed(2)} KB, ${pair[1].type})`);
        } else if (pair[0].includes('[') && pair[0].includes(']')) {
          arrayCount++;
          console.log(`  📋 ${pair[0]}: ${pair[1]}`);
        } else {
          scalarCount++;
          console.log(`  📝 ${pair[0]}: ${pair[1]}`);
        }
      }
      console.log(`📊 [useEventForm] Total: ${scalarCount} champs scalaires + ${arrayCount} éléments array + ${fileCount} fichiers`);

      // Exécuter l'action
      if (type === 'create') {
        console.log('🆕 [useEventForm] ======== CRÉATION ÉVÉNEMENT ========');
        await createEvent(formData as CreateEventData);
      } else if (type === 'edit' && eventId) {
        console.log('✏️  [useEventForm] ======== MISE À JOUR ÉVÉNEMENT ========');
        await updateEvent(eventId, formData as UpdateEventData);
      }

      console.log('✅ [useEventForm] ============ SOUMISSION RÉUSSIE ============');
      
      // 🔥 Nettoyer les fichiers du Context après succès
      clearFiles();
      console.log('🗑️  [useEventForm] Fichiers nettoyés du Context');
      
      onSuccess?.();
    } catch (err: any) {
      console.error('❌ [useEventForm] ============ ERREUR ============');
      console.error('❌ [useEventForm] Message:', err.message);
      console.error('❌ [useEventForm] Réponse serveur:', err.response?.data);
      console.error('❌ [useEventForm] Status:', err.response?.status);
      console.error('❌ [useEventForm] Stack:', err.stack);
      
      // Ne pas nettoyer les fichiers en cas d'erreur
      // L'utilisateur peut réessayer sans avoir à les resélectionner
    }
  };

  return { handleSubmit };
}