import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageData {
  id: number;
  image_path: string;
  url?: string;
  variants?: any;
}

interface ImageCarouselProps {
  images: ImageData[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageLoadStatus, setImageLoadStatus] = useState<Record<number, 'loading' | 'loaded' | 'error'>>({});

  // Filtrer les images valides
  const validImages = Array.isArray(images) && images.length > 0 
    ? images.filter(img => img.image_path || img.url)
    : [];

  // 🔍 DEBUG: Afficher la structure des images
  useEffect(() => {
    console.group('🖼️ IMAGE CAROUSEL DEBUG');
    console.log('Total images reçues:', images?.length);
    console.log('Images valides:', validImages.length);
    console.log('Données complètes:', JSON.stringify(images, null, 2));
    console.groupEnd();
  }, [images]);

  const handlePrevious = useCallback(() => {
    if (isTransitioning || validImages.length === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev === 0 ? validImages.length - 1 : prev - 1);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [validImages.length, isTransitioning]);

  const handleNext = useCallback(() => {
    if (isTransitioning || validImages.length === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev === validImages.length - 1 ? 0 : prev + 1);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [validImages.length, isTransitioning]);

  // Support navigation clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext]);

  // Reset index si images changent
  useEffect(() => {
    if (currentIndex >= validImages.length && validImages.length > 0) {
      setCurrentIndex(0);
    }
  }, [validImages.length, currentIndex]);

  // Si pas d'images
  if (validImages.length === 0) {
    console.warn('[ImageCarousel] No valid images provided');
    return (
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Photos de l'événement</h2>
        <div className="w-full h-[400px] rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
          <p className="text-gray-400">Aucune image disponible</p>
        </div>
      </div>
    );
  }

  // 🔍 Construction d'URL ultra-simple
  const buildSimpleUrl = (image: ImageData): string => {
    const API_BASE = 'https://api.jminspire.com';
    const path = image.image_path || image.url || '';
    
    // Si déjà une URL complète
    if (path.startsWith('http')) {
      console.log('✅ URL complète détectée:', path);
      return path;
    }
    
    // Si c'est un chemin relatif
    const fullUrl = `${API_BASE}/storage/${path}`;
    console.log('🔨 URL construite:', fullUrl);
    return fullUrl;
  };

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-3">
        Photos de l'événement ({validImages.length})
      </h2>
      
      {/* 🎯 DEBUG: Afficher les infos de l'image courante */}
      <div className="mb-2 p-3 bg-blue-50 rounded text-xs font-mono">
        <div><strong>Image actuelle:</strong> {currentIndex + 1}/{validImages.length}</div>
        <div><strong>ID:</strong> {validImages[currentIndex]?.id}</div>
        <div><strong>Path:</strong> {validImages[currentIndex]?.image_path}</div>
        <div><strong>URL construite:</strong> {buildSimpleUrl(validImages[currentIndex])}</div>
        <div><strong>Variants:</strong> {validImages[currentIndex]?.variants ? 'Présents' : 'Absents'}</div>
        <div><strong>Status:</strong> {imageLoadStatus[validImages[currentIndex]?.id] || 'non chargée'}</div>
      </div>
      
      {/* Conteneur principal avec hauteur fixe et fond visible pour debug */}
      <div 
        className="relative w-full rounded-xl overflow-hidden group"
        style={{
          height: '500px',
          backgroundColor: '#1a1a1a', // Fond noir pour voir si image charge
        }}
      >
        
        {/* Images avec absolute positioning */}
        {validImages.map((image, index) => {
          const imageUrl = buildSimpleUrl(image);
          
          return (
            <div
              key={image.id}
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: index === currentIndex ? 1 : 0,
                zIndex: index === currentIndex ? 10 : 0,
                pointerEvents: index === currentIndex ? 'auto' : 'none',
              }}
            >
              {/* 🎯 IMAGE ULTRA-SIMPLE sans srcset, sans variants */}
              <img
                src={imageUrl}
                alt={`Photo ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block', // Elimine les espaces inline
                }}
                loading={index === 0 ? 'eager' : 'lazy'}
                onLoad={() => {
                  console.log(`✅ Image ${index + 1} chargée:`, imageUrl);
                  setImageLoadStatus(prev => ({ ...prev, [image.id]: 'loaded' }));
                }}
                onError={(e) => {
                  console.error(`❌ Erreur chargement image ${index + 1}:`, imageUrl);
                  console.error('Détails:', e);
                  setImageLoadStatus(prev => ({ ...prev, [image.id]: 'error' }));
                }}
              />
              
              {/* Indicateur de chargement */}
              {imageLoadStatus[image.id] === 'error' && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-red-900/50 text-white"
                  style={{ zIndex: 20 }}
                >
                  <div className="text-center p-4">
                    <p className="font-bold mb-2">❌ Erreur de chargement</p>
                    <p className="text-sm opacity-80 break-all">{imageUrl}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Boutons de navigation */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              disabled={isTransitioning}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed z-20"
              aria-label="Image précédente"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={handleNext}
              disabled={isTransitioning}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed z-20"
              aria-label="Image suivante"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Indicateurs de pagination */}
        {validImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true);
                    setCurrentIndex(index);
                    setTimeout(() => setIsTransitioning(false), 300);
                  }
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white w-8' 
                    : 'bg-white/50 hover:bg-white/75 w-2'
                }`}
                aria-label={`Aller à la photo ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Compteur */}
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm z-20">
          {currentIndex + 1} / {validImages.length}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;