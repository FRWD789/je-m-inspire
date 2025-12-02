// src/components/utils/image/imageCompression.ts
import imageCompression from 'browser-image-compression';

/**
 * Options de compression optimales pour Je m'inspire
 */
export const compressionOptions = {
  maxSizeMB: 3,           // Max 3MB par image
  maxWidthOrHeight: 1920, // Max 1920px (4K pas nécessaire)
  useWebWorker: true,     // Ne pas bloquer UI
  fileType: 'image/jpeg', // Convertir tout en JPEG
  initialQuality: 0.85,   // Quality initiale
};

/**
 * Compresse une image avant upload
 */
export async function compressImage(file: File): Promise<File> {
  try {
    // Vérifier taille originale
    const originalSizeMB = file.size / 1024 / 1024;
    
    console.log('[ImageCompression] Début compression', {
      name: file.name,
      size: originalSizeMB.toFixed(2) + 'MB',
      type: file.type
    });

    // Si déjà petite, ne pas comprimer
    if (originalSizeMB < 1) {
      console.log('[ImageCompression] Image déjà optimisée, skip');
      return file;
    }

    // Compression
    const compressedFile = await imageCompression(file, compressionOptions);
    
    const compressedSizeMB = compressedFile.size / 1024 / 1024;
    const reduction = ((originalSizeMB - compressedSizeMB) / originalSizeMB * 100).toFixed(1);

    console.log('[ImageCompression] Compression réussie', {
      original: originalSizeMB.toFixed(2) + 'MB',
      compressed: compressedSizeMB.toFixed(2) + 'MB',
      reduction: reduction + '%'
    });

    return compressedFile;
    
  } catch (error) {
    console.error('[ImageCompression] Erreur:', error);
    // En cas d'erreur, retourner fichier original
    return file;
  }
}

/**
 * Compresse un tableau d'images en parallèle
 */
export async function compressImages(files: File[]): Promise<File[]> {
  console.log('[ImageCompression] Compression batch de', files.length, 'images');
  
  const compressionPromises = files.map(file => compressImage(file));
  const compressedFiles = await Promise.all(compressionPromises);
  
  return compressedFiles;
}

/**
 * Hook React pour compression avec état de progression
 */
import { useState } from 'react';

export function useImageCompression() {
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);

  const compress = async (files: File[]) => {
    setIsCompressing(true);
    setProgress(0);

    const compressed: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const compressedFile = await compressImage(files[i]);
      compressed.push(compressedFile);
      setProgress(((i + 1) / files.length) * 100);
    }

    setIsCompressing(false);
    return compressed;
  };

  return { compress, isCompressing, progress };
}