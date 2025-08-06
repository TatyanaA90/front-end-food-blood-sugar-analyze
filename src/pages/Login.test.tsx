import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../__tests__/utils'
import Login from './Login'

// Mock the useAuth hook
const mockLogin = vi.fn()
const mockUseAuth = {
  login: mockLogin,
  isLoading: false,
  user: null,
  token: null,
  isAuthenticated: false,
  register: vi.fn(),
  logout: vi.fn(),
  updateUser: vi.fn(),
}

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth,
}))

// Mock react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render login form elements', () => {
    render(<Login />)

    expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /create a new account/i })).toBeInTheDocument()
  })

  it('should show password toggle functionality', async () => {
    const user = userEvent.setup()
    render(<Login />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const toggleButton = screen.getByRole('button', { name: /show password/i })

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Click toggle to show password
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    // Click toggle again to hide password
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<Login />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // Try to submit without filling fields
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument()
    })
  })

  it('should validate minimum username length', async () => {
    const user = userEvent.setup()
    render(<Login />)

    const usernameInput = screen.getByLabelText(/username/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(usernameInput, 'ab') // Less than 3 characters
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument()
    })
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValueOnce(undefined)
    
    render(<Login />)

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'testpass')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'testpass')
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should show error message on login failure', async () => {
    const user = userEvent.setup()
    mockLogin.mockRejectedValueOnce(new Error('Login failed'))
    
    render(<Login />)

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'wrongpass')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument()
    })
  })

  it('should clear error message when typing in form', async () => {
    const user = userEvent.setup()
    mockLogin.mockRejectedValueOnce(new Error('Login failed'))
    
    render(<Login />)

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    // First, trigger an error
    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'wrongpass')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument()
    })

    // Then type in the form again - error should clear
    await user.type(usernameInput, '2')

    expect(screen.queryByText(/invalid username or password/i)).not.toBeInTheDocument()
  })

  it('should show loading state during login', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = userEvent.setup()
    mockUseAuth.isLoading = true
    
    render(<Login />)

    const submitButton = screen.getByRole('button', { name: /signing in.../i })
    expect(submitButton).toBeDisabled()
    
    // Reset for other tests
    mockUseAuth.isLoading = false
  })

  it('should have accessible form labels and structure', () => {
    render(<Login />)

    // Check for proper form structure (forms don't have implicit role)
    const form = screen.getByRole('button', { name: /sign in/i }).closest('form')
    expect(form).toBeInTheDocument()
    
    // Check for proper labeling
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    
    expect(usernameInput).toHaveAttribute('id', 'username')
    expect(passwordInput).toHaveAttribute('id', 'password')
    
    // Check for autocomplete attributes
    expect(usernameInput).toHaveAttribute('autoComplete', 'username')
    expect(passwordInput).toHaveAttribute('autoComplete', 'current-password')
  })
})