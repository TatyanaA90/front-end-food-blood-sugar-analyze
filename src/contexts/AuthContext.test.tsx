import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './AuthContext.tsx'
import { useAuth } from '../hooks/useAuth'
import { server } from '../__tests__/setup'
import { http, HttpResponse } from 'msw'

// Helper to render hook with providers
const renderAuthHook = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )

  return renderHook(() => useAuth(), { wrapper })
}

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should start with no user and not loading', () => {
      const { result } = renderAuthHook()
      
      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })

    it('should restore token from localStorage', () => {
      localStorage.setItem('blood_sugar_token', 'existing-token')
      
      const { result } = renderAuthHook()
      
      expect(result.current.token).toBe('existing-token')
    })
  })

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      const { result } = renderAuthHook()

      await act(async () => {
        await result.current.login('testuser', 'testpass')
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user).toEqual({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          name: 'Test User'
        })
        expect(result.current.token).toBe('mock-jwt-token')
      })

      // Check localStorage was updated
      expect(localStorage.getItem('blood_sugar_token')).toBe('mock-jwt-token')
    })

    it('should handle login failure', async () => {
      const { result } = renderAuthHook()

      await expect(
        act(async () => {
          await result.current.login('wronguser', 'wrongpass')
        })
      ).rejects.toThrow('Login failed')

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
    })

    it('should handle network errors', async () => {
      // Mock network failure
      server.use(
        http.post('*/login', () => {
          return HttpResponse.error()
        })
      )

      const { result } = renderAuthHook()

      await expect(
        act(async () => {
          await result.current.login('testuser', 'testpass')
        })
      ).rejects.toThrow()

      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Registration', () => {
    it('should register successfully', async () => {
      const { result } = renderAuthHook()

      await act(async () => {
        await result.current.register('newuser', 'new@example.com', 'password123')
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user).toEqual({
          id: 2,
          username: 'newuser',
          email: 'new@example.com',
          name: 'newuser'
        })
        expect(result.current.token).toBe('mock-jwt-token')
      })
    })

    it('should handle registration with existing username', async () => {
      const { result } = renderAuthHook()

      await expect(
        act(async () => {
          await result.current.register('existinguser', 'test@example.com', 'password123')
        })
      ).rejects.toThrow('Username or email already exists')

      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Logout', () => {
    it('should logout and clear all data', async () => {
      localStorage.setItem('blood_sugar_token', 'some-token')
      const { result } = renderAuthHook()

      // First set some user data
      await act(async () => {
        await result.current.login('testuser', 'testpass')
      })

      // Then logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(localStorage.getItem('blood_sugar_token')).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('should update user data when user exists', async () => {
      const { result } = renderAuthHook()

      // Login first
      await act(async () => {
        await result.current.login('testuser', 'testpass')
      })

      // Update user
      act(() => {
        result.current.updateUser({ name: 'Updated Name' })
      })

      expect(result.current.user?.name).toBe('Updated Name')
      expect(result.current.user?.username).toBe('testuser') // Should keep existing data
    })

    it('should not update when no user exists', () => {
      const { result } = renderAuthHook()

      act(() => {
        result.current.updateUser({ name: 'Updated Name' })
      })

      expect(result.current.user).toBeNull()
    })
  })
})