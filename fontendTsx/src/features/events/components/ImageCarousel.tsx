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
  const [debugInfo, setDebugInfo] = useState<any>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const validImages = useMemo(() => {
    const valid = Array.isArray(images) && images.length > 0 
      ? images.filter(img => img.image_path || img.url)
      : [];
    
    console.group('🖼️ CAROUSEL DEBUG - Images reçues');
    console.log('Total images:', images.length);
    console.log('Images valides:', valid.length);
    console.groupEnd();
    
    return valid;
  }, [images]);

  // ✅ SIMPLE: Toujours utiliser xl_webp (1920px)
  const getImageUrl = useCallback((image: ImageData, index: number): string => {
    const API_BASE = 'https://api.jminspire.com';
    
    let url = '';
    let variant = '';
    
    // Priorité: xl_webp > xl > original
    if (image.variants?.xl_webp) {
      url = `${API_BASE}/storage/${image.variants.xl_webp}`;
      variant = 'xl_webp';
      console.log(`✅ Image ${index + 1} URL:`, url);
    } else if (image.variants?.xl) {
      url = `${API_BASE}/storage/${image.variants.xl}`;
      variant = 'xl';
      console.log(`⚠️ Image ${index + 1} URL (JPG):`, url);
    } else if (image.url) {
      url = image.url;
      variant = 'url complète';
      console.log(`⚠️ Image ${index + 1} URL (complete):`, url);
    } else {
      url = `${API_BASE}/storage/${image.image_path}`;
      variant = 'original';
      console.log(`⚠️ Image ${index + 1} URL (original):`, url);
    }
    
    return url;
  }, []);

  const imageUrls = useMemo(() => {
    console.group('🔗 GÉNÉRATION DES URLs');
    const urls = validImages.map((img, idx) => getImageUrl(img, idx));
    console.log('URLs complètes:', urls);
    console.groupEnd();
    return urls;
  }, [validImages, getImageUrl]);

  // Debug du conteneur
  useEffect(() => {
    const measureContainer = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const computed = window.getComputedStyle(containerRef.current);
        
        const info = {
          width: rect.width,
          height: rect.height,
          computedWidth: computed.width,
          computedHeight: computed.height,
          display: computed.display,
          position: computed.position,
        };
        
        console.group('📐 DIMENSIONS CONTENEUR DÉTAILLÉES');
        console.log('BoundingRect width:', rect.width);
        console.log('BoundingRect height:', rect.height);
        console.log('Computed width:', computed.width);
        console.log('Computed height:', computed.height);
        console.log('Display:', computed.display);
        console.log('Position:', computed.position);
        console.groupEnd();
        
        setDebugInfo(info);
      }
    };

    measureContainer();
    window.addEventListener('resize', measureContainer);
    return () => window.removeEventListener('resize', measureContainer);
  }, []);

  const handleImageLoad = (index: number, event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    console.group(`✅ IMAGE ${index + 1} CHARGÉE !!!!`);
    console.log('URL:', img.src);
    console.log('Dimensions naturelles:', `${img.naturalWidth}x${img.naturalHeight}`);
    console.log('Dimensions affichées:', `${img.offsetWidth}x${img.offsetHeight}`);
    console.log('Object-fit:', window.getComputedStyle(img).objectFit);
    console.log('Width computed:', window.getComputedStyle(img).width);
    console.log('Height computed:', window.getComputedStyle(img).height);
    console.groupEnd();
    
    setImageLoadStatus(prev => ({ ...prev, [index]: 'loaded' }));
  };

  const handleImageError = (index: number, event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    console.group(`❌ ERREUR IMAGE ${index + 1}`);
    console.log('URL qui a échoué:', img.src);
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

      {/* 🔍 PANNEAU DE DEBUG AMÉLIORÉ */}
      <div style={{
        backgroundColor: '#fef3c7',
        border: '2px solid #f59e0b',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        fontFamily: 'monospace',
        fontSize: '11px',
      }}>
        <div><strong>🎯 Image actuelle:</strong> {currentIndex + 1} / {validImages.length}</div>
        <div><strong>📁 URL:</strong> {imageUrls[currentIndex]}</div>
        <div><strong>📊 Status:</strong> {imageLoadStatus[currentIndex] || '⏳ loading...'}</div>
        <div><strong>📐 Conteneur:</strong> {debugInfo.width?.toFixed(1)}px × {debugInfo.height?.toFixed(1)}px</div>
        <div style={{ marginTop: '8px', fontSize: '10px', color: '#92400e' }}>
          <strong>💡 Test rapide:</strong> Clique sur une image pour ouvrir l'URL directement
        </div>
      </div>
      
      {/* ✅ Conteneur avec bordures pour debug */}
      <div 
        ref={containerRef}
        className="relative w-full h-[500px] lg:h-[600px] rounded-xl overflow-hidden bg-black group"
        style={{ border: '4px solid red' }}
        onClick={() => {
          console.log('🖱️ Click sur conteneur');
          window.open(imageUrls[currentIndex], '_blank');
        }}
      >
        
        {/* ✅ Images avec logs détaillés */}
        {validImages.map((image, index) => {
          console.log(`🎨 Rendering image ${index + 1}:`, imageUrls[index]);
          
          return (
            <div
              key={image.id}
              className={`absolute inset-0 transition-opacity duration-300 ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              style={{ border: '3px solid blue' }}
            >
              <img
                src={imageUrls[index]}
                alt={`Photo ${index + 1}`}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="w-full h-full object-cover"
                style={{ border: '3px solid green' }}
                onLoad={(e) => handleImageLoad(index, e)}
                onError={(e) => handleImageError(index, e)}
                onLoadStart={() => {
                  console.log(`🔄 Image ${index + 1} loading START`);
                  setImageLoadStatus(prev => ({ ...prev, [index]: 'loading' }));
                }}
              />
              
              {/* Overlay de status */}
              {imageLoadStatus[index] === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/80 text-white p-4">
                  <div className="text-xl mb-2">❌ Erreur de chargement</div>
                  <div className="text-xs break-all max-w-full px-4">{imageUrls[index]}</div>
                </div>
              )}
              
              {!imageLoadStatus[index] && index === currentIndex && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <div className="text-white text-lg">⏳ Chargement...</div>
                </div>
              )}
            </div>
          );
        })}

        {/* Boutons navigation */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              disabled={isTransitioning}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all opacity-100 group-hover:opacity-100 disabled:opacity-50 z-20"
              aria-label="Image précédente"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              disabled={isTransitioning}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all opacity-100 group-hover:opacity-100 disabled:opacity-50 z-20"
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
                onClick={(e) => {
                  e.stopPropagation();
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
        <div className="absolute top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium z-20">
          {currentIndex + 1} / {validImages.length}
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        backgroundColor: '#e0e7ff',
        border: '1px solid #6366f1',
        borderRadius: '8px',
        padding: '12px',
        marginTop: '12px',
        fontSize: '12px',
      }}>
        <strong>🔍 Instructions:</strong>
        <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
          <li>Clique sur l'image pour ouvrir l'URL dans un nouvel onglet</li>
          <li>Vérifie si l'image s'ouvre correctement</li>
          <li>Regarde la console (F12) pour les logs détaillés</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageCarousel;