import React from 'react';

/**
 * ResponsiveImage - VERSION CORRIGÉE
 * 
 * Utilise les variantes retournées par l'API (chemins relatifs)
 * et construit les URLs complètes
 */

interface ResponsiveImageProps {
  /** Chemin de l'image originale (ex: 'event_images/123_abc.jpg') */
  src: string;
  
  /** Variantes déjà calculées par l'API (optionnel) */
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
  
  // Construire les URLs complètes à partir des variantes
  const buildUrl = (path: string | undefined | null) => {
    if (!path) return null;
    // Si c'est déjà une URL complète, la retourner telle quelle
    if (path.startsWith('http')) return path;
    // Sinon, construire l'URL
    return `${API_BASE}/storage/${path}`;
  };

  // Si pas de variantes, fallback sur le comportement par défaut
  if (!variants) {
    return (
      <img
        src={buildUrl(src) || ''}
        alt={alt}
        className={className}
        loading={loading}
        fetchpriority={fetchPriority}
        decoding="async"
        onLoad={onLoad}
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
        src={buildUrl(variants.original || src) || ''}
        alt={alt}
        className={className}
        loading={loading}
        fetchpriority={fetchPriority}
        decoding="async"
        onLoad={onLoad}
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
  
  const buildUrl = (path: string | undefined | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE}/storage/${path}`;
  };

  if (!variants) {
    return (
      <img
        src={buildUrl(src) || ''}
        alt={alt}
        className={className}
        loading={loading}
        fetchpriority={fetchPriority}
        decoding="async"
        onLoad={onLoad}
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
        src={buildUrl(variants.original || src) || ''}
        alt={alt}
        className={className}
        loading={loading}
        fetchpriority={fetchPriority}
        decoding="async"
        onLoad={onLoad}
      />
    </picture>
  );
};

export default ResponsiveImage;

/**
 * EXEMPLES D'UTILISATION AVEC VARIANTS DE L'API
 * 
 * 1. Image LCP (hero banner):
 * <ResponsiveImage
 *   src={event.banner_path}
 *   variants={event.banner_variants}
 *   alt={event.name}
 *   className="w-full h-full object-cover"
 *   loading="eager"
 *   fetchPriority="high"
 * />
 * 
 * 2. Images carousel:
 * <ResponsiveImage
 *   src={image.image_path}
 *   variants={image.variants}
 *   alt={`Photo ${index + 1}`}
 *   className="w-full h-full object-cover"
 *   loading="lazy"
 * />
 * 
 * 3. Thumbnails:
 * <ThumbnailImage
 *   src={event.thumbnail_path}
 *   variants={event.thumbnail_variants}
 *   alt={event.name}
 *   size="md"
 *   className="w-full aspect-square object-cover"
 * />
 */