// src/context/CompressedFilesContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react'

interface CompressedFilesContextType {
  thumbnailFile: File | null
  bannerFile: File | null
  imagesFiles: File[]
  setThumbnailFile: (file: File | null) => void
  setBannerFile: (file: File | null) => void
  setImagesFiles: (files: File[]) => void
  clearFiles: () => void
}

const CompressedFilesContext = createContext<CompressedFilesContextType | undefined>(undefined)

export function CompressedFilesProvider({ children }: { children: ReactNode }) {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [imagesFiles, setImagesFiles] = useState<File[]>([])

  const clearFiles = () => {
    console.log('🗑️  [CompressedFilesContext] Nettoyage des fichiers')
    setThumbnailFile(null)
    setBannerFile(null)
    setImagesFiles([])
  }

  return (
    <CompressedFilesContext.Provider
      value={{
        thumbnailFile,
        bannerFile,
        imagesFiles,
        setThumbnailFile,
        setBannerFile,
        setImagesFiles,
        clearFiles,
      }}
    >
      {children}
    </CompressedFilesContext.Provider>
  )
}

export function useCompressedFiles() {
  const context = useContext(CompressedFilesContext)
  if (!context) {
    throw new Error('useCompressedFiles must be used within CompressedFilesProvider')
  }
  return context
}