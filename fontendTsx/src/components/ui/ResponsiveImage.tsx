import React, { useState, useEffect, useRef } from 'react';

/**
 * ResponsiveImage - VERSION CORRIGÉE POUR CAROUSEL
 * 
 * ✅ FIX: picture avec display:contents pour ne pas bloquer le layout
 * ✅ Classes CSS correctement appliquées à l'img interne
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
  const API_BASE = 'https://api.jminspire.com';
  const imgRef = useRef<HTMLImageElement>(null);
  
  const buildUrl = (path: string | undefined | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE}/storage/${path}`;
  };

  // 🔍 Handler pour détecter quelle image a été chargée
  const handleImageLoad = () => {
    if (imgRef.current) {
      const loadedSrc = imgRef.current.currentSrc || imgRef.current.src;
      const isWebP = loadedSrc.includes('.webp');
      const format = isWebP ? 'WebP' : 'JPG';
      
      // Détecter la variante
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

  // Si pas de variants, image simple
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

  // Avec variants, utiliser picture avec srcset
  const lgWebpUrl = buildUrl(variants.lg_webp);
  const lgJpgUrl = buildUrl(variants.lg);
  const mdWebpUrl = buildUrl(variants.md_webp);
  const mdJpgUrl = buildUrl(variants.md);
  const xlWebpUrl = buildUrl(variants.xl_webp);
  const xlJpgUrl = buildUrl(variants.xl);
  const fallbackUrl = buildUrl(variants.original || src);

  return (
    // ✅ FIX: display:contents fait en sorte que picture ne crée pas de boîte
    <picture style={{ display: 'contents' }}>
      {/* WebP sources */}
      {xlWebpUrl && (
        <source
          type="image/webp"
          srcSet={xlWebpUrl}
          media="(min-width: 1920px)"
        />
      )}
      {lgWebpUrl && (
        <source
          type="image/webp"
          srcSet={lgWebpUrl}
          media="(min-width: 1024px)"
        />
      )}
      {mdWebpUrl && (
        <source
          type="image/webp"
          srcSet={mdWebpUrl}
        />
      )}

      {/* JPEG fallbacks */}
      {xlJpgUrl && (
        <source
          type="image/jpeg"
          srcSet={xlJpgUrl}
          media="(min-width: 1920px)"
        />
      )}
      {lgJpgUrl && (
        <source
          type="image/jpeg"
          srcSet={lgJpgUrl}
          media="(min-width: 1024px)"
        />
      )}
      {mdJpgUrl && (
        <source
          type="image/jpeg"
          srcSet={mdJpgUrl}
        />
      )}

      {/* Image finale avec toutes les classes appliquées */}
      <img
        ref={imgRef}
        src={fallbackUrl || ''}
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
    <picture style={{ display: 'contents' }}>
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