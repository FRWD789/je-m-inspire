import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageData {
  id: number;
  image_path: string;
  url?: string;
  variants?: {
    original?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    sm_webp?: string;
    md_webp?: string;
    lg_webp?: string;
    xl_webp?: string;
  };
}

interface ImageCarouselProps {
  images: ImageData[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ✅ Mémoiser les images valides pour éviter les re-calculs
  const validImages = useMemo(() => {
    return Array.isArray(images) && images.length > 0 
      ? images.filter(img => img.image_path || img.url)
      : [];
  }, [images]);

  // ✅ Fonction pour obtenir la MEILLEURE variante (lg_webp > xl_webp > lg > xl > original)
  const getOptimizedImageUrl = useCallback((image: ImageData): string => {
    const API_BASE = 'https://api.jminspire.com';
    
    // Si pas de variants, utiliser l'URL complète fournie
    if (!image.variants) {
      console.log('⚠️ Pas de variants, utilisation URL:', image.url);
      return image.url || `${API_BASE}/storage/${image.image_path}`;
    }

    // Priorité aux variants WebP optimisés (lg = 1200px, parfait pour desktop)
    let bestVariant: string | undefined;
    
    if (image.variants.lg_webp) {
      bestVariant = image.variants.lg_webp;
      console.log('✅ Utilisation lg_webp (1200px):', bestVariant);
    } else if (image.variants.xl_webp) {
      bestVariant = image.variants.xl_webp;
      console.log('✅ Utilisation xl_webp (1920px):', bestVariant);
    } else if (image.variants.lg) {
      bestVariant = image.variants.lg;
      console.log('✅ Utilisation lg (1200px JPG):', bestVariant);
    } else if (image.variants.xl) {
      bestVariant = image.variants.xl;
      console.log('✅ Utilisation xl (1920px JPG):', bestVariant);
    } else {
      bestVariant = image.variants.original || image.image_path;
      console.log('⚠️ Fallback original:', bestVariant);
    }

    return `${API_BASE}/storage/${bestVariant}`;
  }, []);

  // ✅ Pré-calculer toutes les URLs pour éviter les re-calculs
  const imageUrls = useMemo(() => {
    return validImages.map(img => getOptimizedImageUrl(img));
  }, [validImages, getOptimizedImageUrl]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext]);

  useEffect(() => {
    if (currentIndex >= validImages.length && validImages.length > 0) {
      setCurrentIndex(0);
    }
  }, [validImages.length, currentIndex]);

  if (validImages.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Photos de l'événement</h2>
        <div className="w-full h-[400px] rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
          <p className="text-gray-400">Aucune image disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-3">
        Photos de l'événement ({validImages.length})
      </h2>
      
      {/* Conteneur avec hauteur fixe responsive */}
      <div 
        className="relative w-full rounded-xl overflow-hidden bg-gray-900 group"
        style={{
          height: '500px',
        }}
      >
        
        {/* Images avec background-image optimisé */}
        {validImages.map((image, index) => (
          <div
            key={image.id}
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: index === currentIndex ? 1 : 0,
              zIndex: index === currentIndex ? 10 : 0,
              pointerEvents: index === currentIndex ? 'auto' : 'none',
              // ✅ Utilise l'URL pré-calculée (variant optimisé)
              backgroundImage: `url("${imageUrls[index]}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        ))}

        {/* Boutons navigation */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              disabled={isTransitioning}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 z-20"
              aria-label="Image précédente"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={handleNext}
              disabled={isTransitioning}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 z-20"
              aria-label="Image suivante"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Indicateurs pagination */}
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

      {/* 
        📱 Version responsive pour desktop 
        Sur grand écran, on augmente la hauteur 
      */}
      <style>{`
        @media (min-width: 1024px) {
          .mb-6 > div:first-of-type {
            height: 600px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ImageCarousel;