import React, { useState, useEffect, useRef } from 'react';

/**
 * ResponsiveImage - VERSION AVEC DEBUG CONSOLE
 * 
 * Logs en temps réel :
 * - Quelle variante est chargée (sm, md, lg, xl, original)
 * - Format utilisé (WebP ou JPG)
 * - Taille réelle chargée
 */

interface ResponsiveImageProps {
  src: string;
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
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  onLoad?: () => void;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  variants,
  alt,
  className = '',
  loading = 'lazy',
  fetchPriority = 'auto',
  onLoad,
}) => {
  const API_BASE = import.meta.env.VITE_API_URL || 'https://api.jminspire.com';
  const imgRef = useRef<HTMLImageElement>(null);
  const [loadedInfo, setLoadedInfo] = useState<string>('');
  
  const buildUrl = (path: string | undefined | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;

    // Construire l'URL sans /api pour les images
    const baseUrl = API_BASE.replace('api/', ''); // Enlever /api si présent
    return `${baseUrl}/storage/${path}`;
  };

  // 🔍 Handler pour détecter quelle image a été chargée
  const handleImageLoad = () => {
    if (imgRef.current) {
      const loadedSrc = imgRef.current.currentSrc || imgRef.current.src;
      const naturalWidth = imgRef.current.naturalWidth;
      const naturalHeight = imgRef.current.naturalHeight;
      const displayWidth = imgRef.current.width;
      const displayHeight = imgRef.current.height;
      
      // Détecter le format
      const isWebP = loadedSrc.includes('.webp');
      const format = isWebP ? 'WebP' : 'JPG';
      
      // Détecter la variante
      let variant = 'original';
      if (loadedSrc.includes('_xl')) variant = 'xl (1920px)';
      else if (loadedSrc.includes('_lg')) variant = 'lg (1200px)';
      else if (loadedSrc.includes('_md')) variant = 'md (600px)';
      else if (loadedSrc.includes('_sm')) variant = 'sm (300px)';
      
      const info = {
        alt: alt,
        variant: variant,
        format: format,
        naturalSize: `${naturalWidth}×${naturalHeight}`,
        displaySize: `${displayWidth}×${displayHeight}`,
        url: loadedSrc,
        savings: isWebP ? '~50% vs JPG' : 'N/A'
      };
      
      // 🎨 Log stylisé dans la console
      console.groupCollapsed(
        `%c🖼️ ${alt}%c → ${variant} %c${format}`,
        'color: #3b82f6; font-weight: bold',
        'color: #10b981; font-weight: bold',
        `color: ${isWebP ? '#8b5cf6' : '#f59e0b'}; font-weight: bold`
      );
      console.table({
        'Variante': variant,
        'Format': format,
        'Taille naturelle': info.naturalSize,
        'Taille affichée': info.displaySize,
        'Économie': info.savings,
      });
      console.log('URL:', loadedSrc);
      console.groupEnd();
      
      setLoadedInfo(`${variant} (${format})`);
    }
    
    // Appeler le callback original
    if (onLoad) onLoad();
  };

  // Si pas de variantes, image simple
  if (!variants) {
    return (
      <img
        ref={imgRef}
        src={buildUrl(src) || ''}
        alt={alt}
        className={className}
        loading={loading}
        fetchpriority={fetchPriority}
        decoding="async"
        onLoad={handleImageLoad}
      />
    );
  }

  // Construire les URLs pour srcset WebP
  const webpSrcset = [
    variants.sm_webp ? `${buildUrl(variants.sm_webp)} 300w` : null,
    variants.md_webp ? `${buildUrl(variants.md_webp)} 600w` : null,
    variants.lg_webp ? `${buildUrl(variants.lg_webp)} 1200w` : null,
    variants.xl_webp ? `${buildUrl(variants.xl_webp)} 1920w` : null,
  ].filter(Boolean).join(', ');

  // Construire les URLs pour srcset JPEG
  const jpegSrcset = [
    variants.sm ? `${buildUrl(variants.sm)} 300w` : null,
    variants.md ? `${buildUrl(variants.md)} 600w` : null,
    variants.lg ? `${buildUrl(variants.lg)} 1200w` : null,
    variants.xl ? `${buildUrl(variants.xl)} 1920w` : null,
  ].filter(Boolean).join(', ');

  return (
    <picture>
      {/* WebP sources - Format moderne */}
      {webpSrcset && (
        <source
          type="image/webp"
          srcSet={webpSrcset}
          sizes="(max-width: 640px) 300px, (max-width: 1024px) 600px, (max-width: 1536px) 1200px, 1920px"
        />
      )}
      
      {/* JPEG sources - Fallback */}
      {jpegSrcset && (
        <source
          type="image/jpeg"
          srcSet={jpegSrcset}
          sizes="(max-width: 640px) 300px, (max-width: 1024px) 600px, (max-width: 1536px) 1200px, 1920px"
        />
      )}
      
      {/* Fallback IMG */}
      <img
        ref={imgRef}
        src={buildUrl(variants.original || src) || ''}
        alt={alt}
        className={className}
        loading={loading}
        fetchpriority={fetchPriority}
        decoding="async"
        onLoad={handleImageLoad}
        title={loadedInfo || 'Chargement...'}
      />
    </picture>
  );
};

/**
 * Variante simplifiée pour les thumbnails (cartes d'événements)
 */
interface ThumbnailImageProps extends Omit<ResponsiveImageProps, 'size'> {
  size?: 'sm' | 'md' | 'lg';
}

export const ThumbnailImage: React.FC<ThumbnailImageProps> = ({
  src,
  variants,
  alt,
  className = '',
  size = 'md',
  loading = 'lazy',
  fetchPriority = 'auto',
  onLoad,
}) => {
  const API_BASE = import.meta.env.VITE_API_URL || 'https://api.jminspire.com';
  const imgRef = useRef<HTMLImageElement>(null);
  
  const buildUrl = (path: string | undefined | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    
    // Construire l'URL sans /api pour les images
    const baseUrl = API_BASE.replace('api/', ''); // Enlever /api si présent
    return `${baseUrl}/storage/${path}`;
  };

  const handleImageLoad = () => {
    if (imgRef.current) {
      const loadedSrc = imgRef.current.currentSrc || imgRef.current.src;
      const isWebP = loadedSrc.includes('.webp');
      const format = isWebP ? 'WebP' : 'JPG';
      
      console.log(
        `%c📸 Thumbnail: ${alt}%c → ${size.toUpperCase()} ${format}`,
        'color: #ec4899; font-weight: bold',
        `color: ${isWebP ? '#8b5cf6' : '#f59e0b'}`
      );
    }
    
    if (onLoad) onLoad();
  };

  if (!variants) {
    return (
      <img
        ref={imgRef}
        src={buildUrl(src) || ''}
        alt={alt}
        className={className}
        loading={loading}
        fetchpriority={fetchPriority}
        decoding="async"
        onLoad={handleImageLoad}
      />
    );
  }

  // Choisir la bonne taille selon le prop
  const webpSrc = size === 'sm' ? variants.sm_webp : size === 'md' ? variants.md_webp : variants.lg_webp;
  const jpegSrc = size === 'sm' ? variants.sm : size === 'md' ? variants.md : variants.lg;

  return (
    <picture>
      {webpSrc && <source type="image/webp" srcSet={buildUrl(webpSrc) || ''} />}
      {jpegSrc && <source type="image/jpeg" srcSet={buildUrl(jpegSrc) || ''} />}
      <img
        ref={imgRef}
        src={buildUrl(variants.original || src) || ''}
        alt={alt}
        className={className}
        loading={loading}
        fetchpriority={fetchPriority}
        decoding="async"
        onLoad={handleImageLoad}
      />
    </picture>
  );
};

export default ResponsiveImage;