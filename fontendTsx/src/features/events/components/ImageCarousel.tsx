import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: Array<{
    id: number;
    url: string;
    display_order: number;
  }>;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0])); // Précharger la 1ère

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => {
      const newIndex = prev === 0 ? images.length - 1 : prev - 1;
      // Précharger l'image précédente
      setLoadedImages((loaded) => new Set(loaded).add(newIndex));
      return newIndex;
    });
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const newIndex = prev === images.length - 1 ? 0 : prev + 1;
      // Précharger l'image suivante
      setLoadedImages((loaded) => new Set(loaded).add(newIndex));
      return newIndex;
    });
  }, [images.length]);

  // Précharger l'image suivante et précédente au montage
  useEffect(() => {
    const preloadIndexes = [
      currentIndex,
      currentIndex + 1 < images.length ? currentIndex + 1 : 0,
      currentIndex - 1 >= 0 ? currentIndex - 1 : images.length - 1,
    ];
    
    setLoadedImages((loaded) => {
      const newLoaded = new Set(loaded);
      preloadIndexes.forEach((idx) => newLoaded.add(idx));
      return newLoaded;
    });
  }, [currentIndex, images.length]);

  // Support navigation clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-3">Photos de l'événement</h2>
      <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-gray-100">
        {/* Images */}
        {images.map((image, index) => (
          <img
            key={image.id}
            src={image.url}
            alt={`Photo ${index + 1}`}
            loading={loadedImages.has(index) ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={index === currentIndex ? 'high' : 'low'}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            style={{
              // Précharger les images adjacentes en arrière-plan
              visibility: loadedImages.has(index) ? 'visible' : 'hidden',
            }}
          />
        ))}
        
        {images.length > 1 && (
          <>
            {/* Navigation buttons */}
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition shadow-lg z-20"
              aria-label="Image précédente"
            >
              <ChevronLeft size={24} className="text-gray-800" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition shadow-lg z-20"
              aria-label="Image suivante"
            >
              <ChevronRight size={24} className="text-gray-800" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setLoadedImages((loaded) => new Set(loaded).add(index));
                  }}
                  className={`rounded-full transition ${
                    index === currentIndex 
                      ? 'bg-white w-8 h-2' 
                      : 'bg-white/50 w-2 h-2 hover:bg-white/75'
                  }`}
                  aria-label={`Aller à l'image ${index + 1}`}
                />
              ))}
            </div>

            {/* Counter */}
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-20">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageCarousel;