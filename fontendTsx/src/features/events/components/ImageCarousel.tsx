import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
  const [dimensions, setDimensions] = useState<{
    container?: { width: number; height: number };
    images?: Array<{ natural: { width: number; height: number }; display: { width: number; height: number } }>;
  }>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

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

    // Essaie xl d'abord pour voir si c'est un problème de taille
    let bestVariant: string | undefined;
    
    if (image.variants.xl_webp) {
      bestVariant = image.variants.xl_webp;
      console.log('📸 Utilisation xl_webp (1920px):', bestVariant);
    } else if (image.variants.lg_webp) {
      bestVariant = image.variants.lg_webp;
      console.log('📸 Utilisation lg_webp (1200px):', bestVariant);
    } else if (image.variants.xl) {
      bestVariant = image.variants.xl;
    } else if (image.variants.lg) {
      bestVariant = image.variants.lg;
    } else {
      bestVariant = image.variants.original || image.image_path;
    }

    return `${API_BASE}/storage/${bestVariant}`;
  }, []);

  const imageUrls = useMemo(() => {
    return validImages.map(img => getOptimizedImageUrl(img));
  }, [validImages, getOptimizedImageUrl]);

  // 🔍 DIAGNOSTIC: Mesurer les dimensions après chargement
  useEffect(() => {
    const measureDimensions = () => {
      if (!containerRef.current) return;

      const containerDims = {
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      };

      const imageDims = imageRefs.current.map((img) => {
        if (!img) return null;
        return {
          natural: {
            width: img.naturalWidth,
            height: img.naturalHeight,
          },
          display: {
            width: img.offsetWidth,
            height: img.offsetHeight,
          },
        };
      }).filter(Boolean);

      setDimensions({
        container: containerDims,
        images: imageDims as any,
      });

      console.group('🔍 DIAGNOSTIC DIMENSIONS');
      console.log('Conteneur:', containerDims);
      console.log('Images:', imageDims);
      console.groupEnd();
    };

    // Mesurer après un court délai pour laisser les images charger
    const timer = setTimeout(measureDimensions, 1000);
    return () => clearTimeout(timer);
  }, [currentIndex]);

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
        <div style={{ width: '100%', height: '400px', borderRadius: '12px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb' }}>
          <p style={{ color: '#9ca3af' }}>Aucune image disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-3">
        Photos de l'événement ({validImages.length})
      </h2>

      {/* 🔍 PANNEAU DE DIAGNOSTIC */}
      {dimensions.container && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          fontFamily: 'monospace',
          fontSize: '12px',
        }}>
          <div><strong>📏 Conteneur:</strong> {dimensions.container.width}px × {dimensions.container.height}px</div>
          {dimensions.images && dimensions.images[currentIndex] && (
            <>
              <div><strong>🖼️ Image naturelle:</strong> {dimensions.images[currentIndex].natural.width}px × {dimensions.images[currentIndex].natural.height}px</div>
              <div><strong>📺 Image affichée:</strong> {dimensions.images[currentIndex].display.width}px × {dimensions.images[currentIndex].display.height}px</div>
              <div style={{ color: dimensions.images[currentIndex].display.width < dimensions.container.width ? '#dc2626' : '#16a34a' }}>
                <strong>Status:</strong> {dimensions.images[currentIndex].display.width < dimensions.container.width ? '❌ Image plus petite que conteneur' : '✅ Image remplit le conteneur'}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Conteneur du carrousel */}
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '500px',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#1a1a1a',
          border: '3px solid #dc2626', // ← Bordure rouge pour voir le conteneur
        }}
      >
        
        {/* Images avec IMG TAG */}
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
              border: '2px solid #10b981', // ← Bordure verte pour voir la div
            }}
          >
            <img
              ref={(el) => { imageRefs.current[index] = el; }}
              src={imageUrls[index]}
              alt={`Photo ${index + 1}`}
              loading={index === 0 ? 'eager' : 'lazy'}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                border: '2px solid #3b82f6', // ← Bordure bleue pour voir l'img
              }}
              onLoad={() => {
                console.log(`✅ Image ${index + 1} chargée`);
                if (containerRef.current) {
                  setTimeout(() => {
                    const img = imageRefs.current[index];
                    if (img) {
                      console.log(`📸 Image ${index + 1}:`, {
                        natural: `${img.naturalWidth}x${img.naturalHeight}`,
                        display: `${img.offsetWidth}x${img.offsetHeight}`,
                        container: `${containerRef.current?.offsetWidth}x${containerRef.current?.offsetHeight}`,
                      });
                    }
                  }, 100);
                }
              }}
            />
          </div>
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
                border: 'none',
                cursor: 'pointer',
                zIndex: 20,
              }}
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
                border: 'none',
                cursor: 'pointer',
                zIndex: 20,
              }}
              aria-label="Image suivante"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Compteur */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          zIndex: 20,
        }}>
          {currentIndex + 1} / {validImages.length}
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .mb-6 > div:nth-of-type(2) {
            height: 600px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ImageCarousel;