import { useSearchParams } from 'next/navigation'

interface UseUrlParamsReturn {
  getShareableUrl: (params: Record<string, string>) => string
  getCurrentParams: () => URLSearchParams
}

export function useUrlParams(): UseUrlParamsReturn {
  const searchParams = useSearchParams()

  const getCurrentParams = () => {
    return new URLSearchParams(searchParams.toString())
  }

  const getShareableUrl = (params: Record<string, string>) => {
    const url = new URL(window.location.href)
    const currentParams = getCurrentParams()
    
    // Clear existing params
    url.search = ''
    
    // Keep existing params that aren't being updated
    currentParams.forEach((value, key) => {
      if (!(key in params)) {
        url.searchParams.set(key, value)
      }
    })
    
    // Add new params
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
    
    return url.toString()
  }

  return {
    getShareableUrl,
    getCurrentParams,
  }
} 