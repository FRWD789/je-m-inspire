import React, { useState, useCallback, useEffect, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ResponsiveImage from '@/components/ui/ResponsiveImage';

interface ImageCarouselProps {
  images: Array<{
    id: number;
    url: string;
    image_path?: string;
    variants?: {
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
      sm_webp?: string;
      md_webp?: string;
      lg_webp?: string;
      xl_webp?: string;
    };
    display_order?: number;
  }>;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 🔧 FIX: Vérification robuste des images
  const validImages = Array.isArray(images) && images.length > 0 ? images : [];

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

  // 🔧 FIX: Reset index si images changent
  useEffect(() => {
    if (currentIndex >= validImages.length && validImages.length > 0) {
      setCurrentIndex(0);
    }
  }, [validImages.length, currentIndex]);

  // 🔧 FIX: Si pas d'images, ne rien afficher
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

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-3">
        Photos de l'événement ({validImages.length})
      </h2>
      
      <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-gray-100 group">
        {/* Images Container */}
        <div className="relative w-full h-full">
          {validImages.map((image, index) => (
            <div
              key={image.id}
              className={`absolute inset-0 transition-opacity duration-300 ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              style={{
                pointerEvents: index === currentIndex ? 'auto' : 'none'
              }}
            >
              <ResponsiveImage
                    src={image.image_path || image.url}
                    variants={image.variants}  // ← AJOUTÉ
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'low'}
                />
            </div>
          ))}
        </div>

        {/* Navigation Buttons - Visible au hover sur desktop */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              disabled={isTransitioning}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 
                bg-white/90 hover:bg-white rounded-full p-3 
                shadow-lg transition-all duration-200
                opacity-0 group-hover:opacity-100
                md:opacity-100
                disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>

            <button
              onClick={handleNext}
              disabled={isTransitioning}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 
                bg-white/90 hover:bg-white rounded-full p-3 
                shadow-lg transition-all duration-200
                opacity-0 group-hover:opacity-100
                md:opacity-100
                disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
          </>
        )}

        {/* Indicators (Dots) */}
        {validImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 
            flex gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-2">
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
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-white w-6' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Aller à l'image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image counter */}
        <div className="absolute top-4 right-4 z-20 
          bg-black/50 backdrop-blur-sm text-white 
          px-3 py-1 rounded-full text-sm font-medium">
          {currentIndex + 1} / {validImages.length}
        </div>
      </div>
    </div>
  );
};

// 🚀 OPTIMISATION: Memo pour éviter re-renders inutiles
export default memo(ImageCarousel, (prevProps, nextProps) => {
  // Ne re-render que si le nombre d'images ou les IDs changent
  if (prevProps.images.length !== nextProps.images.length) return false;
  
  return prevProps.images.every((img, idx) => 
    img.id === nextProps.images[idx]?.id &&
    img.url === nextProps.images[idx]?.url
  );
});