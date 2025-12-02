import React from 'react';

/**
 * ResponsiveImage - Composant optimisé pour Lighthouse
 * 
 * Utilise <picture> + srcset pour servir la bonne taille selon:
 * - Format du navigateur (WebP prioritaire, fallback JPG)
 * - Taille de l'écran (mobile, tablet, desktop)
 * 
 * Résultat : Économies de 50-70% sur le poids des images
 */

interface ResponsiveImageProps {
  /** Chemin de l'image originale depuis l'API (ex: 'event_images/123_abc.jpg') */
  src: string;
  
  /** Texte alternatif */
  alt: string;
  
  /** Classes Tailwind/CSS */
  className?: string;
  
  /** Loading strategy - 'lazy' par défaut, 'eager' pour LCP */
  loading?: 'lazy' | 'eager';
  
  /** Priorité de fetch - 'high' pour LCP uniquement */
  fetchPriority?: 'high' | 'low' | 'auto';
  
  /** Callback quand l'image est chargée */
  onLoad?: () => void;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  fetchPriority = 'auto',
  onLoad,
}) => {
  // Extraire le chemin de base et construire les variantes
  const getImageVariants = (originalPath: string) => {
    if (!originalPath) return null;
    
    const API_BASE = import.meta.env.VITE_API_URL || 'https://api.jminspire.com';
    const pathParts = originalPath.split('/');
    const filename = pathParts[pathParts.length - 1];
    const directory = pathParts.slice(0, -1).join('/');
    const basename = filename.split('.')[0]; // Enlever l'extension
    
    const baseUrl = `${API_BASE}/storage/${directory}`;
    
    return {
      // WebP (format moderne, prioritaire)
      sm_webp: `${baseUrl}/${basename}_sm.webp`,
      md_webp: `${baseUrl}/${basename}_md.webp`,
      lg_webp: `${baseUrl}/${basename}_lg.webp`,
      xl_webp: `${baseUrl}/${basename}_xl.webp`,
      
      // JPEG (fallback pour navigateurs anciens)
      sm: `${baseUrl}/${basename}_sm.jpg`,
      md: `${baseUrl}/${basename}_md.jpg`,
      lg: `${baseUrl}/${basename}_lg.jpg`,
      xl: `${baseUrl}/${basename}_xl.jpg`,
      
      // Original (ultime fallback)
      original: `${API_BASE}/storage/${originalPath}`,
    };
  };

  const variants = getImageVariants(src);
  
  if (!variants) {
    return <div className={`bg-gray-200 ${className}`} aria-label="Image non disponible" />;
  }

  return (
    <picture>
      {/* WebP sources - Format moderne (50% plus léger) */}
      <source
        type="image/webp"
        srcSet={`
          ${variants.sm_webp} 300w,
          ${variants.md_webp} 600w,
          ${variants.lg_webp} 1200w,
          ${variants.xl_webp} 1920w
        `}
        sizes="(max-width: 640px) 300px, (max-width: 1024px) 600px, (max-width: 1536px) 1200px, 1920px"
      />
      
      {/* JPEG sources - Fallback pour navigateurs anciens */}
      <source
        type="image/jpeg"
        srcSet={`
          ${variants.sm} 300w,
          ${variants.md} 600w,
          ${variants.lg} 1200w,
          ${variants.xl} 1920w
        `}
        sizes="(max-width: 640px) 300px, (max-width: 1024px) 600px, (max-width: 1536px) 1200px, 1920px"
      />
      
      {/* Fallback IMG - Si <picture> pas supporté */}
      <img
        src={variants.original}
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
interface ThumbnailImageProps extends ResponsiveImageProps {
  /** Taille max du thumbnail */
  size?: 'sm' | 'md' | 'lg';
}

export const ThumbnailImage: React.FC<ThumbnailImageProps> = ({
  src,
  alt,
  className = '',
  size = 'md',
  loading = 'lazy',
  fetchPriority = 'auto',
  onLoad,
}) => {
  const variants = React.useMemo(() => {
    if (!src) return null;
    
    const API_BASE = import.meta.env.VITE_API_URL || 'https://api.jminspire.com';
    const pathParts = src.split('/');
    const filename = pathParts[pathParts.length - 1];
    const directory = pathParts.slice(0, -1).join('/');
    const basename = filename.split('.')[0];
    
    const baseUrl = `${API_BASE}/storage/${directory}`;
    
    // Pour les thumbnails, on utilise seulement sm et md
    return {
      webp: `${baseUrl}/${basename}_${size}.webp`,
      jpg: `${baseUrl}/${basename}_${size}.jpg`,
      fallback: `${API_BASE}/storage/${src}`,
    };
  }, [src, size]);

  if (!variants) {
    return <div className={`bg-gray-200 ${className}`} aria-label="Image non disponible" />;
  }

  return (
    <picture>
      <source type="image/webp" srcSet={variants.webp} />
      <source type="image/jpeg" srcSet={variants.jpg} />
      <img
        src={variants.fallback}
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
 * EXEMPLES D'UTILISATION
 * 
 * 1. Image LCP (première image visible - hero/banner):
 * <ResponsiveImage
 *   src={event.banner_path}
 *   alt={event.name}
 *   className="w-full h-full object-cover"
 *   loading="eager"
 *   fetchPriority="high"
 * />
 * 
 * 2. Images dans carousel (lazy load):
 * <ResponsiveImage
 *   src={image.image_path}
 *   alt={`Photo ${index + 1}`}
 *   className="w-full h-full object-cover"
 *   loading="lazy"
 * />
 * 
 * 3. Thumbnails dans cartes:
 * <ThumbnailImage
 *   src={event.thumbnail_path}
 *   alt={event.name}
 *   size="md"
 *   className="w-full aspect-square object-cover"
 * />
 */