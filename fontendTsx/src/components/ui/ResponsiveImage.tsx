import React, { useRef } from 'react';

/**
 * ResponsiveImage - VERSION OPTIMISÉE (md, lg, xl uniquement)
 * 
 * ✅ Génère uniquement 3 variantes : md (600px), lg (1200px), xl (1920px)
 * ✅ sm (300px) supprimé - md sert de fallback pour les petites tailles
 * ✅ Garantit que les images remplissent TOUJOURS leur conteneur
 */

interface ResponsiveImageProps {
  src: string;
  variants?: {
    original?: string;
    md?: string;
    lg?: string;
    xl?: string;
    md_webp?: string;
    lg_webp?: string;
    xl_webp?: string;
  };
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  onLoad?: () => void;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  variants,
  alt,
  className = '',
  style,
  loading = 'lazy',
  fetchPriority = 'auto',
  onLoad,
}) => {
  const API_BASE = 'https://api.jminspire.com';
  const imgRef = useRef<HTMLImageElement>(null);
  
  const buildUrl = (path: string | undefined | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE}/storage/${path}`;
  };

  const handleImageLoad = () => {
    if (imgRef.current) {
      const loadedSrc = imgRef.current.currentSrc || imgRef.current.src;
      const isWebP = loadedSrc.includes('.webp');
      const format = isWebP ? 'WebP' : 'JPG';
      
      let variant = 'original';
      if (loadedSrc.includes('_xl')) variant = 'xl (1920px)';
      else if (loadedSrc.includes('_lg')) variant = 'lg (1200px)';
      else if (loadedSrc.includes('_md')) variant = 'md (600px)';
      
      console.log(
        `%c🖼️ ${alt}%c → ${variant} %c${format}`,
        'color: #3b82f6; font-weight: bold',
        'color: #10b981; font-weight: bold',
        `color: ${isWebP ? '#8b5cf6' : '#f59e0b'}; font-weight: bold`
      );
    }
    
    if (onLoad) onLoad();
  };

  const combinedStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    ...style,
  };

  if (!variants) {
    return (
      <img
        ref={imgRef}
        src={buildUrl(src) || ''}
        alt={alt}
        className={className}
        style={combinedStyle}
        loading={loading}
        fetchpriority={fetchPriority}
        decoding="async"
        onLoad={handleImageLoad}
      />
    );
  }

  // Construire srcset avec WebP en priorité (md, lg, xl uniquement)
  const srcsetItems = [];
  
  if (variants.md_webp) srcsetItems.push(`${buildUrl(variants.md_webp)} 600w`);
  if (variants.lg_webp) srcsetItems.push(`${buildUrl(variants.lg_webp)} 1200w`);
  if (variants.xl_webp) srcsetItems.push(`${buildUrl(variants.xl_webp)} 1920w`);
  
  // Fallback JPEG si pas de WebP
  if (srcsetItems.length === 0) {
    if (variants.md) srcsetItems.push(`${buildUrl(variants.md)} 600w`);
    if (variants.lg) srcsetItems.push(`${buildUrl(variants.lg)} 1200w`);
    if (variants.xl) srcsetItems.push(`${buildUrl(variants.xl)} 1920w`);
  }

  const srcset = srcsetItems.join(', ');
  const fallbackSrc = buildUrl(
    variants.xl_webp || 
    variants.lg_webp || 
    variants.md_webp || 
    variants.xl || 
    variants.lg || 
    variants.md ||
    variants.original || 
    src
  );

  return (
    <img
      ref={imgRef}
      src={fallbackSrc || ''}
      srcSet={srcset || undefined}
      sizes="(max-width: 640px) 600px, (max-width: 1024px) 1200px, 1920px"
      alt={alt}
      className={className}
      style={combinedStyle}
      loading={loading}
      fetchpriority={fetchPriority}
      decoding="async"
      onLoad={handleImageLoad}
    />
  );
};

// ============================================
// ThumbnailImage - Pour les miniatures
// ============================================

interface ThumbnailImageProps {
  src: string;
  variants?: {
    original?: string;
    md?: string;
    lg?: string;
    md_webp?: string;
    lg_webp?: string;
  };
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  onLoad?: () => void;
  size?: 'sm' | 'md' | 'lg'; // sm utilise maintenant md comme fallback
}

export const ThumbnailImage: React.FC<ThumbnailImageProps> = ({
  src,
  variants,
  alt,
  className = '',
  style,
  size = 'md',
  loading = 'lazy',
  fetchPriority = 'auto',
  onLoad,
}) => {
  const API_BASE = 'https://api.jminspire.com';
  const imgRef = useRef<HTMLImageElement>(null);
  
  const buildUrl = (path: string | undefined | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE}/storage/${path}`;
  };

  const handleImageLoad = () => {
    if (imgRef.current) {
      const loadedSrc = imgRef.current.currentSrc || imgRef.current.src;
      const isWebP = loadedSrc.includes('.webp');
      const format = isWebP ? 'WebP' : 'JPG';
      
      console.log(
        `%c📸 Thumbnail: ${alt}%c → ${size === 'sm' ? 'SM→MD' : size.toUpperCase()} ${format}`,
        'color: #ec4899; font-weight: bold',
        `color: ${isWebP ? '#8b5cf6' : '#f59e0b'}`
      );
    }
    
    if (onLoad) onLoad();
  };

  const combinedStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    ...style,
  };

  if (!variants) {
    return (
      <img
        ref={imgRef}
        src={buildUrl(src) || ''}
        alt={alt}
        className={className}
        style={combinedStyle}
        loading={loading}
        fetchpriority={fetchPriority}
        decoding="async"
        onLoad={handleImageLoad}
      />
    );
  }

  // ✅ sm utilise md comme fallback (sm n'existe plus)
  const effectiveSize = size === 'sm' ? 'md' : size;
  
  const webpSrc = effectiveSize === 'md' ? variants.md_webp : variants.lg_webp;
  const jpegSrc = effectiveSize === 'md' ? variants.md : variants.lg;
  const fallbackSrc = buildUrl(webpSrc || jpegSrc || variants.original || src);

  return (
    <img
      ref={imgRef}
      src={fallbackSrc || ''}
      alt={alt}
      className={className}
      style={combinedStyle}
      loading={loading}
      fetchpriority={fetchPriority}
      decoding="async"
      onLoad={handleImageLoad}
    />
  );
};

export default ResponsiveImage;