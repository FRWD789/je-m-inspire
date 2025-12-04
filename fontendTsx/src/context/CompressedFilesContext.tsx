// src/context/CompressedFilesContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react'

interface CompressedFilesContextType {
  thumbnailFile: File | null
  bannerFile: File | null
  imagesFiles: File[]
  // ✅ NOUVEAU : États pour la suppression et l'ordre
  deletedImageIds: number[]
  imagesOrder: number[]
  setThumbnailFile: (file: File | null) => void
  setBannerFile: (file: File | null) => void
  setImagesFiles: (files: File[] | ((prev: File[]) => File[])) => void
  // ✅ NOUVEAU : Setters pour suppression et ordre
  setDeletedImageIds: (ids: number[] | ((prev: number[]) => number[])) => void
  setImagesOrder: (order: number[]) => void
  clearFiles: () => void
}

const CompressedFilesContext = createContext<CompressedFilesContextType | undefined>(undefined)

export function CompressedFilesProvider({ children }: { children: ReactNode }) {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [imagesFiles, setImagesFilesState] = useState<File[]>([])
  
  // ✅ NOUVEAU : États pour la suppression et l'ordre
  const [deletedImageIds, setDeletedImageIdsState] = useState<number[]>([])
  const [imagesOrder, setImagesOrderState] = useState<number[]>([])

  // Wrapper pour setImagesFiles qui accepte fonction ou valeur
  const setImagesFiles = (filesOrUpdater: File[] | ((prev: File[]) => File[])) => {
    if (typeof filesOrUpdater === 'function') {
      setImagesFilesState(filesOrUpdater)
    } else {
      setImagesFilesState(filesOrUpdater)
    }
  }

  // Wrapper pour setDeletedImageIds qui accepte fonction ou valeur
  const setDeletedImageIds = (idsOrUpdater: number[] | ((prev: number[]) => number[])) => {
    if (typeof idsOrUpdater === 'function') {
      setDeletedImageIdsState(idsOrUpdater)
    } else {
      setDeletedImageIdsState(idsOrUpdater)
    }
  }

  const setImagesOrder = (order: number[]) => {
    setImagesOrderState(order)
  }

  const clearFiles = () => {
    console.log('🗑️  [CompressedFilesContext] Nettoyage des fichiers')
    setThumbnailFile(null)
    setBannerFile(null)
    setImagesFilesState([])
    setDeletedImageIdsState([])
    setImagesOrderState([])
  }

  return (
    <CompressedFilesContext.Provider
      value={{
        thumbnailFile,
        bannerFile,
        imagesFiles,
        deletedImageIds,
        imagesOrder,
        setThumbnailFile,
        setBannerFile,
        setImagesFiles,
        setDeletedImageIds,
        setImagesOrder,
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