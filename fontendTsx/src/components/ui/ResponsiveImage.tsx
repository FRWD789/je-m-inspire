import React from 'react';

const API_BASE = 'https://api.jminspire.com';

interface ImageVariants {
  original?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  sm_webp?: string;
  md_webp?: string;
  lg_webp?: string;
  xl_webp?: string;
}

interface ResponsiveImageProps {
  src?: string | null;
  variants?: ImageVariants | null;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}

interface ThumbnailImageProps extends ResponsiveImageProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Construit l'URL complète pour une image
 */
const buildImageUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE}/storage/${path}`;
};

/**
 * ResponsiveImage - Composant pour images avec srcset complet
 * 
 * Génère automatiquement srcset avec toutes les variantes disponibles.
 * Priorité WebP, fallback JPG.
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  variants,
  alt,
  className = '',
  loading = 'lazy',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px'
}) => {
  // Si pas de variants, utiliser src directement
  if (!variants && src) {
    return (
      <img
        src={buildImageUrl(src)}
        alt={alt}
        loading={loading}
        className={className}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }

  // Si pas de src et pas de variants, placeholder
  if (!variants || !src) {
    return (
      <div 
        className={className}
        style={{ 
          width: '100%', 
          height: '100%', 
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span style={{ color: '#9ca3af' }}>Aucune image</span>
      </div>
    );
  }

  // Construire srcset WebP
  const webpSrcset = [
    variants.sm_webp && `${buildImageUrl(variants.sm_webp)} 300w`,
    variants.md_webp && `${buildImageUrl(variants.md_webp)} 600w`,
    variants.lg_webp && `${buildImageUrl(variants.lg_webp)} 1200w`,
    variants.xl_webp && `${buildImageUrl(variants.xl_webp)} 1920w`,
  ].filter(Boolean).join(', ');

  // Construire srcset JPG (fallback)
  const jpgSrcset = [
    variants.sm && `${buildImageUrl(variants.sm)} 300w`,
    variants.md && `${buildImageUrl(variants.md)} 600w`,
    variants.lg && `${buildImageUrl(variants.lg)} 1200w`,
    variants.xl && `${buildImageUrl(variants.xl)} 1920w`,
  ].filter(Boolean).join(', ');

  // Source par défaut
  const defaultSrc = buildImageUrl(variants.original || src);

  return (
    <picture>
      {/* WebP en priorité */}
      {webpSrcset && (
        <source
          type="image/webp"
          srcSet={webpSrcset}
          sizes={sizes}
        />
      )}
      
      {/* JPG en fallback */}
      {jpgSrcset && (
        <source
          type="image/jpeg"
          srcSet={jpgSrcset}
          sizes={sizes}
        />
      )}
      
      {/* Image par défaut */}
      <img
        src={defaultSrc}
        alt={alt}
        loading={loading}
        className={className}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </picture>
  );
};

/**
 * ThumbnailImage - Composant simplifié pour vignettes
 * 
 * Utilise une seule taille spécifique au lieu du srcset complet.
 * Plus performant pour les listes d'événements.
 */
export const ThumbnailImage: React.FC<ThumbnailImageProps> = ({
  src,
  variants,
  alt,
  size = 'md',
  className = '',
  loading = 'lazy'
}) => {
  // Si pas de variants, utiliser src directement
  if (!variants && src) {
    return (
      <img
        src={buildImageUrl(src)}
        alt={alt}
        loading={loading}
        className={className}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }

  // Si pas de src et pas de variants, placeholder
  if (!variants || !src) {
    return (
      <div 
        className={className}
        style={{ 
          width: '100%', 
          height: '100%', 
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span style={{ color: '#9ca3af' }}>Aucune image</span>
      </div>
    );
  }

  // Sélectionner la bonne variante selon la taille
  const sizeMap = {
    sm: { webp: variants.sm_webp, jpg: variants.sm },
    md: { webp: variants.md_webp, jpg: variants.md },
    lg: { webp: variants.lg_webp, jpg: variants.lg },
    xl: { webp: variants.xl_webp, jpg: variants.xl }
  };

  const selectedVariant = sizeMap[size];
  const webpSrc = selectedVariant.webp ? buildImageUrl(selectedVariant.webp) : null;
  const jpgSrc = selectedVariant.jpg ? buildImageUrl(selectedVariant.jpg) : buildImageUrl(variants.original || src);

  return (
    <picture>
      {/* WebP en priorité */}
      {webpSrc && (
        <source
          type="image/webp"
          srcSet={webpSrc}
        />
      )}
      
      {/* JPG en fallback */}
      <source
        type="image/jpeg"
        srcSet={jpgSrc}
      />
      
      {/* Image par défaut */}
      <img
        src={jpgSrc}
        alt={alt}
        loading={loading}
        className={className}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </picture>
  );
};

export default ResponsiveImage;