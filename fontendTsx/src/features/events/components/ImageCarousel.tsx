import React, { useState, useCallback, useMemo, useRef } from 'react';
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

    // Toujours privilégier la plus grande version disponible
    const variant =
      image.variants.xl_webp ||
      image.variants.xl ||
      image.variants.lg_webp ||
      image.variants.lg ||
      image.variants.original ||
      image.image_path;

    return `${API_BASE}/storage/${variant}`;
  }, []);

  const imageUrls = useMemo(() => {
    return validImages.map(img => getOptimizedImageUrl(img));
  }, [validImages, getOptimizedImageUrl]);

  const handlePrevious = useCallback(() => {
    if (isTransitioning || validImages.length === 0) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => (prev === 0 ? validImages.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  }, [validImages.length, isTransitioning]);

  const handleNext = useCallback(() => {
    if (isTransitioning || validImages.length === 0) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => (prev === validImages.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 300);
  }, [validImages.length, isTransitioning]);

  if (validImages.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Photos de l'événement</h2>
        <div className="w-full h-[400px] rounded-xl bg-gray-200 flex items-center justify-center">
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

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '60vw',       // Responsive height
          maxHeight: '650px',   // Maximum en desktop
          minHeight: '300px',   // Minimum pour mobile
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#000',
        }}
      >
        {validImages.map((image, index) => (
          <div
            key={image.id}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: index === currentIndex ? 1 : 0,
              transition: 'opacity 300ms ease',
            }}
          >
            <img
              ref={el => { imageRefs.current[index] = el; }}
              src={imageUrls[index]}
              alt={`Image ${index + 1}`}
              loading={index === 0 ? 'eager' : 'lazy'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
              }}
            />
          </div>
        ))}

        {validImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: '50%',
                padding: '12px',
                border: 'none',
                cursor: 'pointer',
                zIndex: 20,
              }}
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={handleNext}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: '50%',
                padding: '12px',
                border: 'none',
                cursor: 'pointer',
                zIndex: 20,
              }}
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '6px 12px',
            borderRadius: '20px',
            color: 'white',
            fontSize: '14px',
          }}
        >
          {currentIndex + 1} / {validImages.length}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
