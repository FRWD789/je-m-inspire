import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ResponsiveImage from '@/components/ui/ResponsiveImage';

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

  // Filtrer les images valides
  const validImages = Array.isArray(images) && images.length > 0 
    ? images.filter(img => img.image_path || img.url)
    : [];

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

  // Si pas d'images, ne rien afficher
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
      
      {/* ✅ FIX: Hauteur augmentée + object-center pour centrage */}
      <div className="relative w-full h-[500px] lg:h-[600px] rounded-xl overflow-hidden bg-gray-100 group">
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
              {/* ✅ FIX: Ajout de object-center */}
              <ResponsiveImage
                src={image.image_path || image.url}
                variants={image.variants}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover object-center"
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
              />
            </div>
          ))}
        </div>

        {/* Navigation Buttons - Visible au survol */}
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
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white w-8' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Aller à la photo ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Compteur */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium z-20">
          {currentIndex + 1} / {validImages.length}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;