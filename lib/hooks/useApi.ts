'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UseApiOptions {
  immediate?: boolean
  onError?: (error: string) => void
  onSuccess?: (data: any) => void
}

// Generic API hook for data fetching
export function useApi<T>(
  endpoint: string,
  options: UseApiOptions = {}
): ApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const { immediate = true, onError, onSuccess } = options

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 401) {
        router.push('/auth/login')
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Request failed')
      }

      const result = await response.json()
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [endpoint, router, onError, onSuccess])

  useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, [fetchData, immediate])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

// Paginated API hook
interface PaginatedData<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    nextPage: number | null
    previousPage: number | null
  }
}

interface UsePaginatedApiState<T> extends Omit<ApiState<PaginatedData<T>>, 'refetch'> {
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  setPage: (page: number) => void
  setFilters: (filters: Record<string, any>) => void
  hasMore: boolean
}

export function usePaginatedApi<T>(
  baseEndpoint: string,
  initialFilters: Record<string, any> = {},
  pageSize: number = 20
): UsePaginatedApiState<T> {
  const [data, setData] = useState<T[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    nextPage: null,
    previousPage: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()

  const buildUrl = useCallback((page: number, isLoadMore: boolean = false) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value.toString()
        }
        return acc
      }, {} as Record<string, string>)
    })
    
    return `${baseEndpoint}?${params.toString()}`
  }, [baseEndpoint, pageSize, filters])

  const fetchData = useCallback(async (page: number, isLoadMore: boolean = false) => {
    setLoading(true)
    setError(null)

    try {
      const url = buildUrl(page, isLoadMore)
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 401) {
        router.push('/auth/login')
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Request failed')
      }

      const result = await response.json()
      
      if (isLoadMore && page > 1) {
        // Append to existing data for infinite scroll
        setData(prev => [...prev, ...result.data])
      } else {
        // Replace data for new queries or first page
        setData(result.data)
      }
      
      setPagination(result.pagination)
      setCurrentPage(page)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [buildUrl, router])

  const loadMore = useCallback(async () => {
    if (pagination.hasNextPage && !loading) {
      await fetchData(currentPage + 1, true)
    }
  }, [fetchData, pagination.hasNextPage, loading, currentPage])

  const refresh = useCallback(async () => {
    await fetchData(1, false)
  }, [fetchData])

  const setPage = useCallback(async (page: number) => {
    await fetchData(page, false)
  }, [fetchData])

  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }, [])

  useEffect(() => {
    fetchData(1, false)
  }, [filters])

  return {
    data: { data, pagination } as PaginatedData<T>,
    loading,
    error,
    loadMore,
    refresh,
    setPage,
    setFilters: updateFilters,
    hasMore: pagination.hasNextPage
  }
}

// Mutation hook for POST/PUT/DELETE operations
interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: string, variables: TVariables) => void
  onSettled?: (data: TData | null, error: string | null, variables: TVariables) => void
}

interface MutationState<TData> {
  data: TData | null
  loading: boolean
  error: string | null
}

export function useMutation<TData, TVariables>(
  endpoint: string,
  options: UseMutationOptions<TData, TVariables> = {}
): [
  (variables: TVariables) => Promise<TData>,
  MutationState<TData>
] {
  const [data, setData] = useState<TData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const { onSuccess, onError, onSettled } = options

  const mutate = useCallback(async (variables: TVariables): Promise<TData> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(variables),
      })

      if (response.status === 401) {
        router.push('/auth/login')
        throw new Error('Authentication required')
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Request failed')
      }

      const result = await response.json()
      setData(result)
      onSuccess?.(result, variables)
      onSettled?.(result, null, variables)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      onError?.(errorMessage, variables)
      onSettled?.(null, errorMessage, variables)
      throw err
    } finally {
      setLoading(false)
    }
  }, [endpoint, router, onSuccess, onError, onSettled])

  return [mutate, { data, loading, error }]
}

// Specific hooks for common operations
export function useUser(userId: string) {
  return useApi<any>(`/api/users/${userId}`, {
    immediate: !!userId
  })
}

export function usePosts(filters: Record<string, any> = {}) {
  return usePaginatedApi<any>('/api/posts', filters)
}

export function useCampaigns(filters: Record<string, any> = {}) {
  return usePaginatedApi<any>('/api/campaigns', filters)
}

export function useCompanies() {
  return useApi<any[]>('/api/companies')
}

// Authentication hooks
export function useLogin() {
  return useMutation<any, { email: string; password: string }>('/api/auth/login', {
    onSuccess: () => {
      window.location.href = '/dashboard'
    }
  })
}

export function useRegister() {
  return useMutation<any, { email: string; password: string; name: string }>('/api/auth/register', {
    onSuccess: () => {
      window.location.href = '/dashboard'
    }
  })
}