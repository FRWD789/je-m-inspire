import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageData {
  id: number;
  image_path: string;
  url?: string;
  variants?: {
    original?: string;
    xl?: string;
    xl_webp?: string;
  };
}

interface ImageCarouselProps {
  images: ImageData[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Filtrage des images valides
  const validImages = useMemo(() => {
    return Array.isArray(images) && images.length > 0 
      ? images.filter(img => img.image_path || img.url)
      : [];
  }, [images]);

  // Logique de sélection d'URL (Priorité WebP)
  const getImageUrl = useCallback((image: ImageData): string => {
    const API_BASE = 'https://api.jminspire.com';
    
    if (image.variants?.xl_webp) return `${API_BASE}/storage/${image.variants.xl_webp}`;
    if (image.variants?.xl) return `${API_BASE}/storage/${image.variants.xl}`;
    if (image.url) return image.url;
    
    return `${API_BASE}/storage/${image.image_path}`;
  }, []);

  const imageUrls = useMemo(() => validImages.map(img => getImageUrl(img)), [validImages, getImageUrl]);

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

  // Gestion des touches clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext]);

  // Reset si l'index dépasse la longueur du tableau
  useEffect(() => {
    if (currentIndex >= validImages.length && validImages.length > 0) {
      setCurrentIndex(0);
    }
  }, [validImages.length, currentIndex]);

  if (validImages.length === 0) {
    return null; // Ou un placeholder si vous préférez
  }

  return (
    <div className="mb-6 group">
      <h2 className="text-2xl font-semibold mb-3">
        Photos de l'événement
      </h2>
      
      {/* Conteneur Principal */}
      <div className="relative w-full h-[500px] lg:h-[600px] rounded-xl overflow-hidden bg-gray-900 shadow-xl">
        
        {/* Images */}
        {validImages.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={imageUrls[index]}
              alt={`Photo ${index + 1}`}
              loading={index === 0 ? 'eager' : 'lazy'}
              /* C'est ICI que la magie opère pour couvrir la surface */
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Boutons navigation (visibles au survol du groupe) */}
        {validImages.length > 1 && (
          <>
            {/* Dégradés pour rendre les flèches plus visibles sur images claires */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/30 to-transparent z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black/30 to-transparent z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

            <button
              onClick={handlePrevious}
              disabled={isTransitioning}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/90 text-white hover:text-gray-900 backdrop-blur-md rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100 z-30"
              aria-label="Image précédente"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={handleNext}
              disabled={isTransitioning}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/90 text-white hover:text-gray-900 backdrop-blur-md rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100 z-30"
              aria-label="Image suivante"
            >
              <ChevronRight size={24} />
            </button>

            {/* Indicateurs (petits points en bas) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
              {validImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => !isTransitioning && setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-white w-8 shadow-lg' 
                      : 'bg-white/40 hover:bg-white/80 w-2'
                  }`}
                  aria-label={`Aller à la photo ${index + 1}`}
                />
              ))}
            </div>

            {/* Compteur discret */}
            <div className="absolute top-4 right-4 bg-black/50 text-white/90 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md z-30">
              {currentIndex + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageCarousel;