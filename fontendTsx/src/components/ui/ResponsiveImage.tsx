import React, { useRef, useState } from 'react';
import { Layers } from 'lucide-react';

/**
 * ResponsiveImage - VERSION OPTIMISÉE avec gestion d'erreurs 404
 * 
 * ✅ Génère uniquement 3 variantes : md (600px), lg (1200px), xl (1920px)
 * ✅ Fallback automatique vers icône Layers en cas d'erreur 404
 * ✅ Garantit que les images remplissent TOUJOURS leur conteneur
 * ✅ CORRIGÉ: Utilise /storage/ au lieu de /api/storage/
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
  showFallback?: boolean;
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
  showFallback = true,
}) => {
  const API_BASE = 'https://api.jminspire.com';
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageError, setImageError] = useState(false);
  
  const buildUrl = (path: string | undefined | null) => {
    if (!path) return null;
    // ✅ Si l'URL est déjà complète, l'utiliser telle quelle
    if (path.startsWith('http')) return path;
    // ✅ CORRIGÉ: Utiliser /storage/ au lieu de /api/storage/
    return `${API_BASE}/storage/${path}`;
  };

  const handleImageLoad = () => {
    setImageError(false);
    
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
        `color: ${isWebP ? '#10b981' : '#f59e0b'}`
      );
    }
    
    if (onLoad) onLoad();
  };

  const handleImageError = () => {
    console.warn(`❌ Image failed to load: ${alt}`);
    setImageError(true);
  };

  // Si erreur 404 et fallback activé, afficher l'icône
  if (imageError && showFallback) {
    return (
      <div 
        className={`flex items-center justify-center bg-secondary/10 ${className}`}
        style={style}
      >
        <Layers className="w-16 h-16 text-secondary/30" strokeWidth={1.5} />
      </div>
    );
  }

  const combinedStyle: React.CSSProperties = {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
    ...style,
  };

  // ✅ Générer srcset uniquement avec les variantes disponibles
  const srcsetItems: string[] = [];
  
  // WebP srcset (priorité)
  if (variants) {
    if (variants.md_webp) srcsetItems.push(`${buildUrl(variants.md_webp)} 600w`);
    if (variants.lg_webp) srcsetItems.push(`${buildUrl(variants.lg_webp)} 1200w`);
    if (variants.xl_webp) srcsetItems.push(`${buildUrl(variants.xl_webp)} 1920w`);
  }

  // Fallback JPEG srcset
  if (variants && srcsetItems.length === 0) {
    if (variants.md) srcsetItems.push(`${buildUrl(variants.md)} 600w`);
    if (variants.lg) srcsetItems.push(`${buildUrl(variants.lg)} 1200w`);
    if (variants.xl) srcsetItems.push(`${buildUrl(variants.xl)} 1920w`);
  }

  const srcset = srcsetItems.join(', ');
  const fallbackSrc = buildUrl(
    variants?.xl_webp || 
    variants?.lg_webp || 
    variants?.md_webp || 
    variants?.xl || 
    variants?.lg || 
    variants?.md ||
    variants?.original || 
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
      onError={handleImageError}
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
  size?: 'sm' | 'md' | 'lg';
  showFallback?: boolean;
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
  showFallback = true,
}) => {
  const API_BASE = 'https://api.jminspire.com';
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageError, setImageError] = useState(false);
  
  const buildUrl = (path: string | undefined | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // ✅ CORRIGÉ: Utiliser /storage/ au lieu de /api/storage/
    return `${API_BASE}/storage/${path}`;
  };

  const handleImageLoad = () => {
    setImageError(false);
    
    if (imgRef.current) {
      const loadedSrc = imgRef.current.currentSrc || imgRef.current.src;
      const isWebP = loadedSrc.includes('.webp');
      const format = isWebP ? 'WebP' : 'JPG';
      
      console.log(
        `%c📸 Thumbnail: ${alt}%c → ${size === 'sm' ? 'SM→MD' : size.toUpperCase()} ${format}`,
        'color: #ec4899; font-weight: bold',
        `color: ${isWebP ? '#10b981' : '#f59e0b'}`
      );
    }
    
    if (onLoad) onLoad();
  };

  const handleImageError = () => {
    console.warn(`❌ Thumbnail failed to load: ${alt}`);
    setImageError(true);
  };

  if (imageError && showFallback) {
    return (
      <div 
        className={`flex items-center justify-center bg-secondary/10 ${className}`}
        style={style}
      >
        <Layers className="w-12 h-12 text-secondary/30" strokeWidth={1.5} />
      </div>
    );
  }

  const combinedStyle: React.CSSProperties = {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
    ...style,
  };

  let targetSrc: string | null = null;

  if (size === 'sm') {
    targetSrc = buildUrl(variants?.md_webp || variants?.md || src);
  } else if (size === 'md') {
    targetSrc = buildUrl(variants?.lg_webp || variants?.lg || variants?.md_webp || variants?.md || src);
  } else {
    targetSrc = buildUrl(variants?.lg_webp || variants?.lg || src);
  }

  return (
    <img
      ref={imgRef}
      src={targetSrc || ''}
      alt={alt}
      className={className}
      style={combinedStyle}
      loading={loading}
      fetchpriority={fetchPriority}
      decoding="async"
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  );
};

export default ResponsiveImage;