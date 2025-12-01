import { useEvent } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import type { CreateEventData, UpdateEventData } from '@/types/events';

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
      
      console.log('🚀 [useEventForm] ============ DÉBUT SOUMISSION ============');
      console.log('📋 [useEventForm] Type:', type);
      console.log('📋 [useEventForm] EventId:', eventId);
      console.log('📋 [useEventForm] Values reçues:', values);
      
      // 🔍 DEBUG FICHIERS - Vérifier le type de données reçues
      console.log('🔍 [useEventForm] Type de values.thumbnail:', values.thumbnail?.constructor.name);
      console.log('🔍 [useEventForm] Type de values.banner:', values.banner?.constructor.name);
      console.log('🔍 [useEventForm] Type de values.images:', values.images?.constructor.name);
      
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
      
      // Ajouter les champs scalaires
      console.log('📝 [useEventForm] Ajout des champs scalaires...');
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && !(value instanceof FileList)) {
          formData.append(key, String(value));
        }
      });
      
      // 🔥 CORRECTION : Gestion des fichiers
      console.log('📸 [useEventForm] ======== TRAITEMENT DES FICHIERS ========');
      
      ['thumbnail', 'banner', 'images'].forEach((key) => {
        const fileOrFiles = (values as any)[key];

        if (!fileOrFiles) {
          console.log(`⏭️  [useEventForm] ${key}: AUCUN fichier`);
          return;
        }

        console.log(`🔍 [useEventForm] ${key}: Type = ${fileOrFiles.constructor.name}`);
        console.log(`🔍 [useEventForm] ${key}: Valeur =`, fileOrFiles);

        // Pour les images multiples
        if (key === 'images') {
          if (fileOrFiles instanceof FileList) {
            console.log(`📸 [useEventForm] ${fileOrFiles.length} image(s) de type FileList détectée(s)`);
            Array.from(fileOrFiles).forEach((file: File, index) => {
              formData.append('images[]', file);
              console.log(`  ✅ Image ${index + 1}: ${file.name} (${(file.size / 1024).toFixed(2)} KB, ${file.type})`);
            });
          } else if (Array.isArray(fileOrFiles) && fileOrFiles[0] instanceof File) {
            console.log(`📸 [useEventForm] ${fileOrFiles.length} image(s) de type Array<File> détectée(s)`);
            fileOrFiles.forEach((file: File, index) => {
              formData.append('images[]', file);
              console.log(`  ✅ Image ${index + 1}: ${file.name} (${(file.size / 1024).toFixed(2)} KB, ${file.type})`);
            });
          } else {
            console.warn(`⚠️  [useEventForm] images a un type inattendu:`, typeof fileOrFiles);
          }
        } 
        // Pour les fichiers uniques (thumbnail, banner)
        else if (key === 'thumbnail' || key === 'banner') {
          let file: File | null = null;
          
          if (fileOrFiles instanceof FileList && fileOrFiles.length > 0) {
            file = fileOrFiles[0];
            console.log(`✅ [useEventForm] ${key} de type FileList détecté`);
          } else if (fileOrFiles instanceof File) {
            file = fileOrFiles;
            console.log(`✅ [useEventForm] ${key} de type File détecté`);
          } else if (Array.isArray(fileOrFiles) && fileOrFiles[0] instanceof File) {
            file = fileOrFiles[0];
            console.log(`✅ [useEventForm] ${key} de type Array<File> détecté`);
          }
          
          if (file) {
            formData.append(key, file);
            console.log(`  ✅ ${key}: ${file.name} (${(file.size / 1024).toFixed(2)} KB, ${file.type})`);
          } else {
            console.warn(`⚠️  [useEventForm] ${key} présent mais pas de File valide`);
          }
        }
      });

      // 🔍 DEBUG : Afficher tout le contenu du FormData
      console.log('📦 [useEventForm] ======== CONTENU FORMDATA FINAL ========');
      let fileCount = 0;
      let scalarCount = 0;
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          fileCount++;
          console.log(`  📎 ${pair[0]}: File(${pair[1].name}, ${(pair[1].size / 1024).toFixed(2)} KB, ${pair[1].type})`);
        } else {
          scalarCount++;
          console.log(`  📝 ${pair[0]}: ${pair[1]}`);
        }
      }
      console.log(`📊 [useEventForm] Total: ${scalarCount} champs scalaires + ${fileCount} fichiers`);

      // Exécuter l'action
      if (type === 'create') {
        console.log('🆕 [useEventForm] ======== CRÉATION ÉVÉNEMENT ========');
        await createEvent(formData as CreateEventData);
      } else if (type === 'edit' && eventId) {
        console.log('✏️  [useEventForm] ======== MISE À JOUR ÉVÉNEMENT ========');
        await updateEvent(eventId, formData as UpdateEventData);
      }

      console.log('✅ [useEventForm] ============ SOUMISSION RÉUSSIE ============');
      onSuccess?.();
    } catch (err: any) {
      console.error('❌ [useEventForm] ============ ERREUR ============');
      console.error('❌ [useEventForm] Message:', err.message);
      console.error('❌ [useEventForm] Réponse serveur:', err.response?.data);
      console.error('❌ [useEventForm] Status:', err.response?.status);
      console.error('❌ [useEventForm] Stack:', err.stack);
    }
  };

  return { handleSubmit };
}