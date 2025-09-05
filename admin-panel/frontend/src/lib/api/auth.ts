import { api } from '../api'

export interface LoginRequest {
    email: string
    password: string
}

export interface AuthResponse {
    token: string
    user: {
        id: string
        email: string
        firstName: string
        lastName: string
        username: string
        phone?: string
        balance: number
        role: 'user' | 'moderator' | 'admin' | 'super_admin'
        permissions: Record<string, boolean>
        userMode: 'taskDoer' | 'taskGiver'
        isActive: boolean
        lastLoginAt?: string
        createdAt: string
    }
}

export interface UserValidationResponse {
    user: AuthResponse['user']
}

export const authApi = {
    // Login
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', credentials)
        return response.data
    },

    // Validate current token
    validateToken: async (): Promise<UserValidationResponse> => {
        const response = await api.get('/auth/validate')
        return response.data
    },

    // Logout (client-side only for JWT)
    logout: () => {
        localStorage.removeItem('admin-auth')
        window.location.href = '/login'
    },

    // Get current user info
    getCurrentUser: async (): Promise<UserValidationResponse> => {
        return authApi.validateToken()
    },

    // Check if user has admin access
    hasAdminAccess: (user: AuthResponse['user']): boolean => {
        return ['admin', 'super_admin', 'moderator'].includes(user.role)
    },

    // Check if user has specific role
    hasRole: (user: AuthResponse['user'], role: string): boolean => {
        const roleHierarchy = {
            'user': 0,
            'moderator': 1,
            'admin': 2,
            'super_admin': 3
        }

        const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
        const requiredLevel = roleHierarchy[role as keyof typeof roleHierarchy] || 0

        return userLevel >= requiredLevel
    },

    // Check if user has specific permission
    hasPermission: (user: AuthResponse['user'], permission: string): boolean => {
        if (user.role === 'super_admin') return true
        return user.permissions?.[permission] === true
    },

    // Store authentication data
    storeAuth: (authData: AuthResponse) => {
        localStorage.setItem('admin-auth', JSON.stringify(authData))
    },

    // Get stored authentication data
    getStoredAuth: (): AuthResponse | null => {
        try {
            const authData = localStorage.getItem('admin-auth')
            return authData ? JSON.parse(authData) : null
        } catch (error) {
            console.error('Failed to parse stored auth data:', error)
            localStorage.removeItem('admin-auth')
            return null
        }
    },

    // Clear authentication data
    clearAuth: () => {
        localStorage.removeItem('admin-auth')
    }
}

export default authApi