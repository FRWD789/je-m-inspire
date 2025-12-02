import React, { useRef } from 'react';

/**
 * ResponsiveImage - VERSION SIMPLIFIÉE SANS PICTURE
 * 
 * ✅ Utilise uniquement <img> avec srcset
 * ✅ Pas de wrapper qui interfère avec le layout
 * ✅ Classes CSS directement appliquées
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
      else if (loadedSrc.includes('_sm')) variant = 'sm (300px)';
      
      console.log(
        `%c🖼️ ${alt}%c → ${variant} %c${format}`,
        'color: #3b82f6; font-weight: bold',
        'color: #10b981; font-weight: bold',
        `color: ${isWebP ? '#8b5cf6' : '#f59e0b'}; font-weight: bold`
      );
    }
    
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
        style={style}
        loading={loading}
        fetchpriority={fetchPriority}
        decoding="async"
        onLoad={handleImageLoad}
      />
    );
  }

  // Construire srcset avec WebP en priorité
  // Le navigateur choisira WebP s'il le supporte, sinon JPEG
  const srcsetItems = [];
  
  // Ajouter les variantes WebP (prioritaire)
  if (variants.sm_webp) srcsetItems.push(`${buildUrl(variants.sm_webp)} 300w`);
  if (variants.md_webp) srcsetItems.push(`${buildUrl(variants.md_webp)} 600w`);
  if (variants.lg_webp) srcsetItems.push(`${buildUrl(variants.lg_webp)} 1200w`);
  if (variants.xl_webp) srcsetItems.push(`${buildUrl(variants.xl_webp)} 1920w`);
  
  // Fallback JPEG si pas de WebP
  if (srcsetItems.length === 0) {
    if (variants.sm) srcsetItems.push(`${buildUrl(variants.sm)} 300w`);
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
    variants.original || 
    src
  );

  return (
    <img
      ref={imgRef}
      src={fallbackSrc || ''}
      srcSet={srcset || undefined}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
      alt={alt}
      className={className}
      style={style}
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
    sm?: string;
    md?: string;
    lg?: string;
    sm_webp?: string;
    md_webp?: string;
    lg_webp?: string;
  };
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  onLoad?: () => void;
  size?: 'sm' | 'md' | 'lg';
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
        style={style}
        loading={loading}
        fetchpriority={fetchPriority}
        decoding="async"
        onLoad={handleImageLoad}
      />
    );
  }

  // Choisir la bonne taille
  const webpSrc = size === 'sm' ? variants.sm_webp : size === 'md' ? variants.md_webp : variants.lg_webp;
  const jpegSrc = size === 'sm' ? variants.sm : size === 'md' ? variants.md : variants.lg;
  const fallbackSrc = buildUrl(webpSrc || jpegSrc || variants.original || src);

  return (
    <img
      ref={imgRef}
      src={fallbackSrc || ''}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      fetchpriority={fetchPriority}
      decoding="async"
      onLoad={handleImageLoad}
    />
  );
};

export default ResponsiveImage;