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

  const validImages = useMemo(() => {
    return Array.isArray(images) && images.length > 0 
      ? images.filter(img => img.image_path || img.url)
      : [];
  }, [images]);

  const getOptimizedImageUrl = useCallback((image: ImageData): string => {
    const API_BASE = 'https://api.jminspire.com';
    
    if (!image.variants) {
      return image.url || `${API_BASE}/storage/${image.image_path}`;
    }

    let bestVariant: string | undefined;
    
    if (image.variants.lg_webp) {
      bestVariant = image.variants.lg_webp;
      console.log('✅ Utilisation lg_webp (1200px):', bestVariant);
    } else if (image.variants.xl_webp) {
      bestVariant = image.variants.xl_webp;
    } else if (image.variants.lg) {
      bestVariant = image.variants.lg;
    } else if (image.variants.xl) {
      bestVariant = image.variants.xl;
    } else {
      bestVariant = image.variants.original || image.image_path;
    }

    return `${API_BASE}/storage/${bestVariant}`;
  }, []);

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
      
      {/* 
        ✅ CONTENEUR avec inline styles pour la plus haute spécificité
        Pas de classes Tailwind qui peuvent être overridées
      */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          height: '500px',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#1a1a1a',
        }}
        onMouseEnter={(e) => e.currentTarget.classList.add('group-hover')}
        onMouseLeave={(e) => e.currentTarget.classList.remove('group-hover')}
      >
        
        {/* 
          ✅ IMAGES avec inline styles purs
          Chaque propriété CSS en inline a la plus haute spécificité
        */}
        {validImages.map((image, index) => (
          <div
            key={image.id}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              opacity: index === currentIndex ? 1 : 0,
              zIndex: index === currentIndex ? 10 : 0,
              pointerEvents: index === currentIndex ? 'auto' : 'none',
              transition: 'opacity 300ms',
              // ✅ Background-image avec propriétés inline
              backgroundImage: `url("${imageUrls[index]}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              // ✅ Forcer la taille du conteneur
              width: '100%',
              height: '100%',
            }}
          />
        ))}

        {/* Boutons navigation */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              disabled={isTransitioning}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#1f2937',
                borderRadius: '50%',
                padding: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: 'none',
                cursor: isTransitioning ? 'not-allowed' : 'pointer',
                opacity: 0,
                transition: 'all 300ms',
                zIndex: 20,
              }}
              className="group-hover-opacity"
              aria-label="Image précédente"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={handleNext}
              disabled={isTransitioning}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#1f2937',
                borderRadius: '50%',
                padding: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: 'none',
                cursor: isTransitioning ? 'not-allowed' : 'pointer',
                opacity: 0,
                transition: 'all 300ms',
                zIndex: 20,
              }}
              className="group-hover-opacity"
              aria-label="Image suivante"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Indicateurs pagination */}
        {validImages.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 20,
          }}>
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
                style={{
                  height: '8px',
                  width: index === currentIndex ? '32px' : '8px',
                  borderRadius: '4px',
                  backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 300ms',
                }}
                aria-label={`Aller à la photo ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Compteur */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 500,
          backdropFilter: 'blur(8px)',
          zIndex: 20,
        }}>
          {currentIndex + 1} / {validImages.length}
        </div>
      </div>

      {/* CSS pour le hover des boutons */}
      <style>{`
        .mb-6 > div:hover .group-hover-opacity {
          opacity: 1 !important;
        }
        
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