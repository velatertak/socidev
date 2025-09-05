import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

export interface Admin {
    id: string
    email: string
    username: string
    firstName: string
    lastName: string
    role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR'
    profileImage?: string
    lastLogin?: string
    createdAt: string
}

interface AuthState {
    admin: Admin | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean

    // Actions
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    refreshProfile: () => Promise<void>
    updateProfile: (data: Partial<Admin>) => Promise<boolean>
    changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
    clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            admin: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (email: string, password: string) => {
                set({ isLoading: true })

                try {
                    const response = await api.post('/auth/login', { email, password })
                    // Fix: Match the actual response format from backend
                    const { admin: adminData, token } = response.data.data || response.data

                    // Check if user has admin access
                    const userRole = adminData.role?.toUpperCase()
                    if (!['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(userRole)) {
                        toast.error('Access denied. Admin privileges required.')
                        set({ isLoading: false })
                        return false
                    }

                    // Map admin data
                    const admin: Admin = {
                        id: adminData.id,
                        email: adminData.email,
                        username: adminData.username,
                        firstName: adminData.firstName || adminData.first_name,
                        lastName: adminData.lastName || adminData.last_name,
                        role: userRole as 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR',
                        profileImage: adminData.profileImage,
                        lastLogin: adminData.lastLogin || adminData.last_login,
                        createdAt: adminData.createdAt || adminData.created_at || new Date().toISOString()
                    }

                    // Set token in API headers
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

                    set({
                        admin,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    })

                    return true
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Login failed'
                    toast.error(message)
                    set({ isLoading: false })
                    return false
                }
            },

            logout: async () => {
                try {
                    await api.post('/auth/logout')
                } catch (error) {
                    // Ignore logout errors
                } finally {
                    // Clear auth state
                    delete api.defaults.headers.common['Authorization']
                    set({
                        admin: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                    })
                    toast.success('Logged out successfully')
                }
            },

            refreshProfile: async () => {
                try {
                    const response = await api.get('/auth/me')
                    // Fix: Match the actual response format from backend
                    const { admin: adminData } = response.data.data || response.data

                    // Map admin data
                    const admin: Admin = {
                        id: adminData.id,
                        email: adminData.email,
                        username: adminData.username,
                        firstName: adminData.firstName || adminData.first_name,
                        lastName: adminData.lastName || adminData.last_name,
                        role: adminData.role?.toUpperCase() as 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR',
                        profileImage: adminData.profileImage,
                        lastLogin: adminData.lastLogin || adminData.last_login,
                        createdAt: adminData.createdAt || adminData.created_at || new Date().toISOString()
                    }

                    set({ admin })
                } catch (error: any) {
                    if (error.response?.status === 401) {
                        get().clearAuth()
                    }
                }
            },

            updateProfile: async (data: Partial<Admin>) => {
                try {
                    const response = await api.put('/auth/profile', data)
                    // Fix: Match the actual response format from backend
                    const { admin: adminData } = response.data.data || response.data

                    // Map admin data
                    const admin: Admin = {
                        id: adminData.id,
                        email: adminData.email,
                        username: adminData.username,
                        firstName: adminData.firstName || adminData.first_name,
                        lastName: adminData.lastName || adminData.last_name,
                        role: adminData.role?.toUpperCase() as 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR',
                        profileImage: adminData.profileImage,
                        lastLogin: adminData.lastLogin || adminData.last_login,
                        createdAt: adminData.createdAt || adminData.created_at || new Date().toISOString()
                    }

                    set({ admin })
                    toast.success('Profile updated successfully')
                    return true
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Failed to update profile'
                    toast.error(message)
                    return false
                }
            },

            changePassword: async (currentPassword: string, newPassword: string) => {
                try {
                    await api.put('/auth/change-password', {
                        currentPassword,
                        newPassword,
                    })

                    toast.success('Password changed successfully')
                    return true
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Failed to change password'
                    toast.error(message)
                    return false
                }
            },

            clearAuth: () => {
                delete api.defaults.headers.common['Authorization']
                set({
                    admin: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                })
            },
        }),
        {
            name: 'admin-auth',
            partialize: (state) => ({
                admin: state.admin,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                // Set token in API headers on app load
                if (state?.token && state?.isAuthenticated) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
                    // Validate token by checking /auth/me endpoint
                    api.get('/auth/me').catch(() => {
                        // If token is invalid, clear auth state
                        const store = useAuthStore.getState()
                        store.clearAuth()
                    })
                }
            },
        }
    )
)