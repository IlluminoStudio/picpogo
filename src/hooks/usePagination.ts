import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface UsePaginationProps {
  totalItems: number
  itemsPerPage: number
}

interface UsePaginationReturn {
  currentPage: number
  totalPages: number
  currentItems: number[]
  goToPage: (page: number) => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  canGoToNextPage: boolean
  canGoToPreviousPage: boolean
  startIndex: number
  endIndex: number
}

export function usePagination({
  totalItems,
  itemsPerPage,
}: UsePaginationProps): UsePaginationReturn {
  const searchParams = useSearchParams()
  const router = useRouter()
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Initialize with a valid page number
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page')
    if (pageParam) {
      const parsedPage = parseInt(pageParam, 10)
      if (!isNaN(parsedPage) && parsedPage > 0 && parsedPage <= totalPages) {
        return parsedPage
      }
    }
    return 1
  })

  // Redirect invalid page request to page 1
  useEffect(() => {
    const pageParam = searchParams.get('page')
    if (pageParam) {
      const parsedPage = parseInt(pageParam, 10)
      const isValidPage = !isNaN(parsedPage) && parsedPage > 0 && parsedPage <= totalPages
      
      if (!isValidPage) {
        setCurrentPage(1)
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.set('page', '1')
        router.replace(newUrl.pathname + newUrl.search)
      }
    }
  }, [searchParams, totalPages, router])

  // Handle total pages changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.set('page', '1')
      router.replace(newUrl.pathname + newUrl.search)
    }
  }, [totalPages, currentPage, router])

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const currentItems = Array.from(
    { length: endIndex - startIndex },
    (_, i) => startIndex + i
  )

  const goToPage = (page: number) => {
    const targetPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(targetPage)
    
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set('page', targetPage.toString())
    router.replace(newUrl.pathname + newUrl.search)
  }

  const goToNextPage = () => goToPage(currentPage + 1)
  const goToPreviousPage = () => goToPage(currentPage - 1)

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    canGoToNextPage: currentPage < totalPages,
    canGoToPreviousPage: currentPage > 1,
    startIndex,
    endIndex,
  }
} 