import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../contexts/AuthContext.tsx'

// Create a custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    initialEntries = ['/'],
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Create a new QueryClient for each test to avoid state pollution
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
        gcTime: 0, // Disable caching in tests
      },
    },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock user data for tests
export const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  name: 'Test User'
}

export const mockAuthResponse = {
  access_token: 'mock-jwt-token',
  token_type: 'bearer',
  user: mockUser
}

// Helper to simulate typing in a form field
export const typeInField = async (
  user: any,
  field: HTMLElement,
  value: string
) => {
  await user.clear(field)
  await user.type(field, value)
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { renderWithProviders as render }