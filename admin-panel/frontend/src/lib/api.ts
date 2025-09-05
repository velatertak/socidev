import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add authentication token
        const authData = localStorage.getItem('admin-auth')
        if (authData) {
            try {
                const { token } = JSON.parse(authData)
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`
                }
            } catch (error) {
                console.error('Failed to parse auth data:', error)
                localStorage.removeItem('admin-auth')
            }
        }

        // Add timestamp to prevent caching
        if (config.method === 'get') {
            config.params = { ...config.params, _t: Date.now() }
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        // Handle common errors
        if (error.response) {
            const { status, data } = error.response

            switch (status) {
                case 401:
                    // Unauthorized - redirect to login
                    if (window.location.pathname !== '/login') {
                        toast.error('Session expired. Please login again.')
                        // Clear auth state
                        localStorage.removeItem('admin-auth')
                        window.location.href = '/login'
                    }
                    break

                case 403:
                    toast.error('You do not have permission to perform this action')
                    break

                case 404:
                    toast.error('Resource not found')
                    break

                case 422:
                    // Validation errors
                    if (data.details && Array.isArray(data.details)) {
                        data.details.forEach((detail: any) => {
                            toast.error(detail.msg || detail.message)
                        })
                    } else {
                        toast.error(data.message || 'Validation failed')
                    }
                    break

                case 429:
                    toast.error('Too many requests. Please try again later.')
                    break

                case 500:
                    toast.error('Internal server error. Please try again.')
                    break

                default:
                    toast.error(data.message || 'An unexpected error occurred')
            }
        } else if (error.request) {
            // Network error
            toast.error('Network error. Please check your connection.')
        } else {
            // Other errors
            toast.error('An unexpected error occurred')
        }

        return Promise.reject(error)
    }
)

export default api