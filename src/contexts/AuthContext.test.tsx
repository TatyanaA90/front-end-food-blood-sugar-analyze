import React from 'react'
import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './AuthContext.tsx'
import { useAuth } from '../hooks/useAuth'
import { server } from '../__tests__/setup'
import { http, HttpResponse } from 'msw'
import { render } from '../__tests__/utils'
import { screen, waitFor as rtlWaitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { findWithRetry } from '../utils/retry'
import { Probe } from '../__tests__/fixtures/Probe'
import { configure } from '@testing-library/react'
import { vi } from 'vitest'

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

  beforeAll(() => {
    vi.useRealTimers()
    configure({ asyncUtilTimeout: 5000 })
  })

  describe('Initial State', () => {
    it('should start with no user and not loading', async () => {
      const { result } = renderAuthHook()
      
      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should restore token from localStorage', () => {
      localStorage.setItem('blood_sugar_token', 'existing-token')
      
      const { result } = renderAuthHook()
      
      expect(result.current.token).toBe('existing-token')
    })
  })

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      render(<Probe />)
      const user = userEvent.setup()
      await findWithRetry(() => !screen.queryByTestId('auth-loading'), { maxAttempts: 12, delayMs: 250 })
      const loginBtn = await screen.findByTestId('login', {}, { timeout: 5000 })
      await user.click(loginBtn)
      await screen.findByTestId('user-name', {}, { timeout: 5000 })
    })

    it('should handle login failure', async () => {
      render(<Probe />)
      const user = userEvent.setup()
      await findWithRetry(() => !screen.queryByTestId('auth-loading'), { maxAttempts: 12, delayMs: 250 })
      const usernameInput = await screen.findByTestId('username-input')
      const passwordInput = await screen.findByTestId('password-input')
      await user.clear(usernameInput)
      await user.type(usernameInput, 'wronguser')
      await user.clear(passwordInput)
      await user.type(passwordInput, 'wrongpass')
      const loginBtn = await screen.findByTestId('login')
      await user.click(loginBtn)
      await screen.findByTestId('auth-error')
      await rtlWaitFor(() => expect(screen.getByTestId('auth-state').textContent).toBe('no'))
    })

    it('should handle network errors', async () => {
      // Mock network failure
      server.use(
        http.post('*/login', () => {
          return HttpResponse.error()
        })
      )

      render(<Probe />)
      const user = userEvent.setup()
      await findWithRetry(() => !screen.queryByTestId('auth-loading'), { maxAttempts: 12, delayMs: 250 })
      const loginBtn = await screen.findByTestId('login')
      await user.click(loginBtn)
      await screen.findByTestId('auth-error')
    })
  })

  describe('Registration', () => {
    it('should register successfully', async () => {
      render(<Probe />)
      const user = userEvent.setup()
      await findWithRetry(() => !screen.queryByTestId('auth-loading'), { maxAttempts: 12, delayMs: 250 })
      const registerBtn = await screen.findByTestId('register')
      await user.click(registerBtn)
      await screen.findByTestId('user-name')
    })

    it('should handle registration with existing username', async () => {
      render(<Probe />)
      const user = userEvent.setup()
      await findWithRetry(() => !screen.queryByTestId('auth-loading'), { maxAttempts: 12, delayMs: 250 })
      const usernameInput = await screen.findByTestId('username-input')
      const emailInput = await screen.findByTestId('email-input')
      await user.clear(usernameInput)
      await user.type(usernameInput, 'existinguser')
      await user.clear(emailInput)
      await user.type(emailInput, 'test@example.com')
      const registerBtn = await screen.findByTestId('register')
      await user.click(registerBtn)
      await screen.findByTestId('auth-error')
    })
  })

  describe('Logout', () => {
    it('should logout and clear all data', async () => {
      render(<Probe />)
      const user = userEvent.setup()

      await findWithRetry(() => !screen.queryByTestId('auth-loading'), { maxAttempts: 12, delayMs: 250 })

      // First, wait for Testing Library's built-in async finder
      await screen.findByTestId('login', {}, { timeout: 4000 })
      // Then, apply our retry helper to cover any micro-races
      const loginBtn = await findWithRetry(() => screen.getByTestId('login'), { maxAttempts: 12, delayMs: 250 })
      await user.click(loginBtn)
      await screen.findByTestId('user-name')

      const logoutBtn = await screen.findByTestId('logout')
      await user.click(logoutBtn)
      await rtlWaitFor(() => expect(screen.getByTestId('user-name').textContent).toBe(''))
    })
  })

  describe('updateUser', () => {
    it('should update user data when user exists', async () => {
      // Preload token so provider restores user via /me
      localStorage.setItem('blood_sugar_token', 'mock-jwt-token')
      const { result } = renderAuthHook()

      // Wait until user is restored
      await waitFor(() => {
        expect(result.current.user).not.toBeNull()
        expect(result.current.isAuthenticated).toBe(true)
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