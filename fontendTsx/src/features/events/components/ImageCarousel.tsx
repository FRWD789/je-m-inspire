import React, { useState, useCallback, useEffect, useMemo } from 'react';
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

  const validImages = useMemo(() => {
    return Array.isArray(images) && images.length > 0 
      ? images.filter(img => img.image_path || img.url)
      : [];
  }, [images]);

  const getImageUrl = useCallback((image: ImageData): string => {
    const API_BASE = 'https://api.jminspire.com';
    
    if (image.variants?.xl_webp) {
      return `${API_BASE}/storage/${image.variants.xl_webp}`;
    } else if (image.variants?.xl) {
      return `${API_BASE}/storage/${image.variants.xl}`;
    } else if (image.url) {
      return image.url;
    } else {
      return `${API_BASE}/storage/${image.image_path}`;
    }
  }, []);

  const imageUrls = useMemo(() => {
    return validImages.map(img => getImageUrl(img));
  }, [validImages, getImageUrl]);

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

      {/* 🔍 PANNEAU TEST */}
      <div style={{
        backgroundColor: '#fef3c7',
        border: '2px solid #f59e0b',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        fontFamily: 'monospace',
        fontSize: '12px',
      }}>
        <div><strong>🔍 TEST:</strong> L'image brute est affichée SANS aucun CSS</div>
        <div><strong>📁 URL:</strong> {imageUrls[currentIndex]}</div>
        <div style={{ color: '#dc2626', marginTop: '8px' }}>
          <strong>⚠️ Si tu vois du NOIR autour de l'image ci-dessous, c'est que le noir est DANS l'image !</strong>
        </div>
      </div>
      
      {/* ✅ IMAGE BRUTE SANS CSS - Pour voir si le noir est intégré */}
      <div style={{
        marginBottom: '24px',
        border: '3px solid red',
        padding: '10px',
        backgroundColor: '#ffffff',
      }}>
        <h3 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
          📷 IMAGE BRUTE (sans CSS, taille originale)
        </h3>
        <div style={{ 
          overflow: 'auto',
          maxHeight: '400px',
          backgroundColor: '#ffffff',  // Fond blanc pour voir le noir de l'image
        }}>
          <img
            src={imageUrls[currentIndex]}
            alt="Image brute"
            style={{
              // ❌ AUCUN style - image taille naturelle
              display: 'block',
            }}
          />
        </div>
        <p style={{ marginTop: '10px', fontSize: '11px', color: '#666' }}>
          👆 Si l'image a des bords noirs, c'est que le noir est DANS l'image elle-même, 
          pas un problème de CSS !
        </p>
      </div>

      {/* Carrousel normal */}
      <div className="relative w-full h-[500px] lg:h-[600px] rounded-xl overflow-hidden bg-gray-200 group">
        
        {validImages.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-300 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={imageUrls[index]}
              alt={`Photo ${index + 1}`}
              loading={index === 0 ? 'eager' : 'lazy'}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Boutons navigation */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              disabled={isTransitioning}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all opacity-100 disabled:opacity-50 z-20"
              aria-label="Image précédente"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={handleNext}
              disabled={isTransitioning}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all opacity-100 disabled:opacity-50 z-20"
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

      {/* Instructions */}
      <div style={{
        backgroundColor: '#dcfce7',
        border: '2px solid #16a34a',
        borderRadius: '8px',
        padding: '12px',
        marginTop: '12px',
        fontSize: '12px',
      }}>
        <strong>✅ DIAGNOSTIC:</strong>
        <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
          <li><strong>SI l'image brute (en haut) a des bords noirs:</strong> Le noir est DANS l'image → Problème backend</li>
          <li><strong>SI l'image brute (en haut) est correcte:</strong> C'est un problème CSS → Problème frontend</li>
        </ul>
        <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#fef3c7', borderRadius: '4px' }}>
          <strong>💡 Solution si noir intégré:</strong> Il faut corriger le job d'optimisation backend 
          pour ne PAS ajouter de padding noir lors de la création des variants
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;