import { http, HttpResponse } from 'msw'

const API_BASE_URL = 'https://back-end-food-blood-sugar-analyzer.onrender.com'

export const handlers = [
    // Mock successful login
    http.post(`${API_BASE_URL}/login`, async ({ request }) => {
        const body = await request.json() as { username: string; password: string }

        if (body.username === 'testuser' && body.password === 'testpass') {
            return HttpResponse.json({
                access_token: 'mock-jwt-token',
                token_type: 'bearer',
                user: {
                    id: 1,
                    username: 'testuser',
                    email: 'test@example.com',
                    name: 'Test User'
                }
            })
        }

        return HttpResponse.json(
            { detail: 'Incorrect username or password' },
            { status: 401 }
        )
    }),

    // Mock successful registration
    http.post(`${API_BASE_URL}/users`, async ({ request }) => {
        const body = await request.json() as {
            username: string;
            email: string;
            password: string;
            name: string
        }

        // Simulate duplicate username error
        if (body.username === 'existinguser') {
            return HttpResponse.json(
                { detail: 'Username or email already exists' },
                { status: 409 }
            )
        }

        return HttpResponse.json({
            access_token: 'mock-jwt-token',
            token_type: 'bearer',
            user: {
                id: 2,
                username: body.username,
                email: body.email,
                name: body.name
            }
        })
    }),

    // Mock current user endpoint
    http.get(`${API_BASE_URL}/me`, () => {
        return HttpResponse.json({
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            name: 'Test User'
        })
    })
]