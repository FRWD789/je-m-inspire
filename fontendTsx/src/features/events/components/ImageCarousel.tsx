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
  const [imageLoadStatus, setImageLoadStatus] = useState<Record<number, 'loading' | 'loaded' | 'error'>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const validImages = useMemo(() => {
    const valid = Array.isArray(images) && images.length > 0 
      ? images.filter(img => img.image_path || img.url)
      : [];
    
    console.group('🖼️ CAROUSEL DEBUG - Images reçues');
    console.log('Total images:', images.length);
    console.log('Images valides:', valid.length);
    console.log('Données complètes:', JSON.stringify(valid, null, 2));
    console.groupEnd();
    
    return valid;
  }, [images]);

  // ✅ SIMPLE: Toujours utiliser xl_webp (1920px)
  const getImageUrl = useCallback((image: ImageData): string => {
    const API_BASE = 'https://api.jminspire.com';
    
    let url = '';
    let variant = '';
    
    // Priorité: xl_webp > xl > original
    if (image.variants?.xl_webp) {
      url = `${API_BASE}/storage/${image.variants.xl_webp}`;
      variant = 'xl_webp (1920px WebP)';
    } else if (image.variants?.xl) {
      url = `${API_BASE}/storage/${image.variants.xl}`;
      variant = 'xl (1920px JPG)';
    } else if (image.url) {
      url = image.url;
      variant = 'url complète';
    } else {
      url = `${API_BASE}/storage/${image.image_path}`;
      variant = 'image_path original';
    }
    
    console.log(`📸 Image ${image.id}:`, {
      variant,
      url,
      hasVariants: !!image.variants,
      variantsKeys: image.variants ? Object.keys(image.variants) : []
    });
    
    return url;
  }, []);

  const imageUrls = useMemo(() => {
    const urls = validImages.map(img => getImageUrl(img));
    console.log('🔗 URLs générées:', urls);
    return urls;
  }, [validImages, getImageUrl]);

  // Debug du conteneur
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      console.group('📐 DIMENSIONS CONTENEUR');
      console.log('Largeur:', rect.width);
      console.log('Hauteur:', rect.height);
      console.log('Position:', { top: rect.top, left: rect.left });
      console.groupEnd();
    }
  }, []);

  const handleImageLoad = (index: number, event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    console.group(`✅ IMAGE ${index + 1} CHARGÉE`);
    console.log('URL:', img.src);
    console.log('Dimensions naturelles:', `${img.naturalWidth}x${img.naturalHeight}`);
    console.log('Dimensions affichées:', `${img.width}x${img.height}`);
    console.log('Object-fit:', window.getComputedStyle(img).objectFit);
    console.groupEnd();
    
    setImageLoadStatus(prev => ({ ...prev, [index]: 'loaded' }));
  };

  const handleImageError = (index: number, event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    console.group(`❌ ERREUR IMAGE ${index + 1}`);
    console.log('URL qui a échoué:', img.src);
    console.log('Erreur:', event);
    console.groupEnd();
    
    setImageLoadStatus(prev => ({ ...prev, [index]: 'error' }));
  };

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

  useEffect(() => {
    console.log(`🎯 Index actuel: ${currentIndex + 1}/${validImages.length}`);
  }, [currentIndex, validImages.length]);

  if (validImages.length === 0) {
    console.warn('⚠️ Aucune image valide à afficher');
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

      {/* 🔍 PANNEAU DE DEBUG */}
      <div style={{
        backgroundColor: '#fef3c7',
        border: '2px solid #f59e0b',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        fontFamily: 'monospace',
        fontSize: '12px',
      }}>
        <div><strong>🎯 Image actuelle:</strong> {currentIndex + 1} / {validImages.length}</div>
        <div><strong>📁 URL:</strong> {imageUrls[currentIndex]}</div>
        <div><strong>📊 Status:</strong> {imageLoadStatus[currentIndex] || 'loading...'}</div>
        <div><strong>🎨 Object-fit:</strong> cover</div>
        <div><strong>📐 Conteneur:</strong> 100% × 500px (600px sur desktop)</div>
      </div>
      
      {/* ✅ Conteneur avec bordure rouge pour debug */}
      <div 
        ref={containerRef}
        className="relative w-full h-[500px] lg:h-[600px] rounded-xl overflow-hidden bg-black group"
        style={{ border: '3px solid red' }}
      >
        
        {/* ✅ Images avec bordure bleue pour debug */}
        {validImages.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-300 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            style={{ border: '2px solid blue' }}
          >
            <img
              src={imageUrls[index]}
              alt={`Photo ${index + 1}`}
              loading={index === 0 ? 'eager' : 'lazy'}
              className="w-full h-full object-cover"
              style={{ border: '2px solid green' }}
              onLoad={(e) => handleImageLoad(index, e)}
              onError={(e) => handleImageError(index, e)}
            />
            
            {/* Overlay de status */}
            {imageLoadStatus[index] === 'error' && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                <div className="bg-red-500 text-white px-4 py-2 rounded">
                  ❌ Erreur de chargement
                </div>
              </div>
            )}
            
            {imageLoadStatus[index] === 'loading' && index === currentIndex && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white">Chargement...</div>
              </div>
            )}
          </div>
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

      {/* Instructions de debug */}
      <div style={{
        backgroundColor: '#e0e7ff',
        border: '1px solid #6366f1',
        borderRadius: '8px',
        padding: '12px',
        marginTop: '12px',
        fontSize: '12px',
      }}>
        <strong>🔍 Debug actif:</strong>
        <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
          <li>Bordure ROUGE = conteneur principal</li>
          <li>Bordure BLEUE = wrapper de l'image</li>
          <li>Bordure VERTE = balise img</li>
          <li>Ouvre la console (F12) pour voir les logs détaillés</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageCarousel;