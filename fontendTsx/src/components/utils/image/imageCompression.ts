// src/components/utils/image/imageCompression.ts

/**
 * 🎯 Configuration optimale par type d'image (alignée avec backend)
 * 
 * Backend génère ensuite les variantes :
 * - md: 600px (mobile/thumbnail)
 * - lg: 1200px (desktop)
 * - xl: 1920px (hero/carousel)
 * + versions WebP
 */
export const IMAGE_CONFIGS = {
  thumbnail: { maxDimension: 800, quality: 0.85 },
  banner: { maxDimension: 1920, quality: 0.90 },
  gallery: { maxDimension: 1200, quality: 0.85 }
} as const

export type ImageType = keyof typeof IMAGE_CONFIGS

/**
 * Compresse une image aux dimensions et qualité optimales selon son type
 * 
 * @param file - Fichier image à compresser
 * @param imageType - Type d'image (thumbnail, banner, gallery)
 * @returns Fichier compressé optimisé
 * 
 * @example
 * const thumb = await compressImage(file, 'thumbnail')  // 800px max, 85%
 * const banner = await compressImage(file, 'banner')     // 1920px max, 90%
 * const image = await compressImage(file, 'gallery')     // 1200px max, 85%
 */
export async function compressImage(
  file: File,
  imageType: ImageType = 'gallery'
): Promise<File> {
  const config = IMAGE_CONFIGS[imageType]
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }
        
        let width = img.width
        let height = img.height
        
        // Redimensionner selon maxDimension
        if (width > height) {
          if (width > config.maxDimension) {
            height = (height * config.maxDimension) / width
            width = config.maxDimension
          }
        } else {
          if (height > config.maxDimension) {
            width = (width * config.maxDimension) / height
            height = config.maxDimension
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }
            
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            
            console.log(`📦 [${imageType}] ${(file.size / 1024).toFixed(0)}KB → ${(blob.size / 1024).toFixed(0)}KB (${width}x${height} @ ${config.quality * 100}%)`)
            
            resolve(compressedFile)
          },
          'image/jpeg',
          config.quality
        )
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}