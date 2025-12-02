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

  // Construction URL - utilise directement `url` si présent
  const getImageUrl = (image: ImageData): string => {
    // Priorité 1: url complète fournie par l'API
    if (image.url) {
      console.log('✅ Utilisation URL complète:', image.url);
      return image.url;
    }
    
    // Priorité 2: construction depuis image_path
    const API_BASE = 'https://api.jminspire.com';
    const fullUrl = `${API_BASE}/storage/${image.image_path}`;
    console.log('🔨 URL construite:', fullUrl);
    return fullUrl;
  };

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-3">
        Photos de l'événement ({validImages.length})
      </h2>
      
      {/* 
        🎯 APPROCHE BACKGROUND-IMAGE
        Utilise background-image au lieu de <img> pour garantir le remplissage 
      */}
      <div className="relative w-full h-[500px] lg:h-[600px] rounded-xl overflow-hidden bg-gray-900 group">
        
        {validImages.map((image, index) => {
          const imageUrl = getImageUrl(image);
          
          return (
            <div
              key={image.id}
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: index === currentIndex ? 1 : 0,
                zIndex: index === currentIndex ? 10 : 0,
                pointerEvents: index === currentIndex ? 'auto' : 'none',
                // ✅ background-image remplit TOUJOURS son conteneur
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
          );
        })}

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
    </div>
  );
};

export default ImageCarousel;