import { api } from '../api'

export interface User {
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
    emailVerifiedAt?: string
    twoFactorEnabled: boolean
    lastLoginAt?: string
    createdAt: string
    updatedAt: string
}

export interface UsersResponse {
    message: string
    data: {
        users: User[]
        pagination: {
            page: number
            limit: number
            total: number
            totalPages: number
            hasNext: boolean
            hasPrev: boolean
        }
    }
}

export interface UserDetailResponse {
    message: string
    data: {
        user: User
    }
}

export interface UserStatistics {
    overview: {
        totalUsers: number
        activeUsers: number
        inactiveUsers: number
        verifiedUsers: number
        newUsersThisMonth: number
    }
    userTypes: {
        taskGivers: number
        taskDoers: number
    }
    roles: {
        admins: number
        moderators: number
        users: number
    }
    status: {
        active: number
        inactive: number
        activeRate: string
    }
}

export interface CreateUserRequest {
    email: string
    password: string
    firstName: string
    lastName: string
    username: string
    phone?: string
    role?: 'user' | 'moderator' | 'admin'
    userMode?: 'taskDoer' | 'taskGiver'
    permissions?: Record<string, boolean>
    balance?: number
}

export interface UpdateUserRequest {
    firstName?: string
    lastName?: string
    username?: string
    phone?: string
    role?: 'user' | 'moderator' | 'admin' | 'super_admin'
    userMode?: 'taskDoer' | 'taskGiver'
    isActive?: boolean
    permissions?: Record<string, boolean>
    balance?: number
}

export interface BulkActionRequest {
    userIds: string[]
    action: 'activate' | 'deactivate' | 'delete' | 'updateRole'
    value?: string // For updateRole action
}

export interface BulkActionResponse {
    message: string
    data: {
        results: Array<{
            userId: string
            status: 'activated' | 'deactivated' | 'deleted' | 'role_updated' | 'error'
            error?: string
        }>
    }
}

export const userApi = {
    // Get all users with filtering and pagination
    getUsers: async (params?: {
        page?: number
        limit?: number
        search?: string
        role?: string
        userMode?: string
        isActive?: string
        sortBy?: string
        sortOrder?: 'asc' | 'desc'
    }): Promise<UsersResponse> => {
        const searchParams = new URLSearchParams()
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    searchParams.append(key, value.toString())
                }
            })
        }

        const response = await api.get(`/admin/users?${searchParams.toString()}`)
        return response.data
    },

    // Get single user details
    getUser: async (id: string): Promise<UserDetailResponse> => {
        const response = await api.get(`/admin/users/${id}`)
        return response.data
    },

    // Create new user
    createUser: async (data: CreateUserRequest): Promise<UserDetailResponse> => {
        const response = await api.post('/admin/users', data)
        return response.data
    },

    // Update user
    updateUser: async (id: string, data: UpdateUserRequest): Promise<UserDetailResponse> => {
        const response = await api.put(`/admin/users/${id}`, data)
        return response.data
    },

    // Update user password
    updateUserPassword: async (id: string, password: string): Promise<{ message: string }> => {
        const response = await api.put(`/admin/users/${id}/password`, { password })
        return response.data
    },

    // Toggle user status (activate/deactivate)
    toggleUserStatus: async (id: string): Promise<UserDetailResponse> => {
        const response = await api.patch(`/admin/users/${id}/toggle-status`)
        return response.data
    },

    // Delete user
    deleteUser: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/admin/users/${id}`)
        return response.data
    },

    // Bulk actions
    bulkAction: async (data: BulkActionRequest): Promise<BulkActionResponse> => {
        const response = await api.post('/admin/users/bulk-actions', data)
        return response.data
    },

    // Get user statistics
    getStatistics: async (): Promise<{ message: string; data: UserStatistics }> => {
        const response = await api.get('/admin/users/statistics')
        return response.data
    }
}