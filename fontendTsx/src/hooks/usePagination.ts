import { useState, useMemo } from 'react'

export function usePagination<T>(data: T[], itemsPerPage = 6) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = useMemo(() => Math.ceil(data.length / itemsPerPage), [data.length, itemsPerPage])

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return data.slice(start, start + itemsPerPage)
  }, [data, currentPage, itemsPerPage])

  const goToPage = (page: number) => {
    if (page < 1) page = 1
    if (page > totalPages) page = totalPages
    setCurrentPage(page)
  }

  const nextPage = () => goToPage(currentPage + 1)
  const prevPage = () => goToPage(currentPage - 1)

  return { currentData, currentPage, totalPages, goToPage, nextPage, prevPage, setCurrentPage }
}