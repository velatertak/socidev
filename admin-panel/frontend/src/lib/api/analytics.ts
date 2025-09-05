import { api } from '../api'

export interface DashboardStats {
    totalTasks: {
        value: number
        growth: number
    }
    completedTasks: {
        value: number
        growth: number
    }
    completionRate: {
        value: number
        growth: number
    }
    totalUsers: {
        value: number
        growth: number
    }
    totalRevenue: {
        value: number
        growth: number
    }
    workerEarnings: {
        value: number
        growth: number
    }
    topTaskGivers: Array<{
        user: {
            id: string
            firstName: string
            lastName: string
            email: string
            username: string
        }
        taskCount: number
        totalBudget: number
    }>
    topEarners: Array<{
        user: {
            id: string
            firstName: string
            lastName: string
            email: string
            username: string
        }
        totalEarnings: number
    }>
}

export interface TaskTrendData {
    date: string
    tasks: number
    completions: number
}

export interface PlatformDistributionData {
    name: string
    value: number
    color: string
}

export interface RevenueTrendData {
    date: string
    revenue: number
    earnings: number
}

export interface AnalyticsDashboardData {
    taskTrends: TaskTrendData[]
    platformDistribution: PlatformDistributionData[]
    revenueTrends: RevenueTrendData[]
    totalTasks: {
        value: number
        growth: number
    }
    completedTasks: {
        value: number
        growth: number
    }
    completionRate: {
        value: number
        growth: number
    }
    totalUsers: {
        value: number
        growth: number
    }
    totalRevenue: {
        value: number
        growth: number
    }
    workerEarnings: {
        value: number
        growth: number
    }
    topTaskGivers: Array<{
        user: {
            id: string
            firstName: string
            lastName: string
            email: string
            username: string
        }
        taskCount: number
        totalBudget: number
    }>
    topEarners: Array<{
        user: {
            id: string
            firstName: string
            lastName: string
            email: string
            username: string
        }
        totalEarnings: number
    }>
}

export const analyticsApi = {
    // Get dashboard data
    getDashboardData: async (params?: {
        range?: string
    }): Promise<AnalyticsDashboardData> => {
        const searchParams = new URLSearchParams()
        if (params?.range) {
            searchParams.append('range', params.range)
        }

        const response = await api.get(`/admin/analytics/dashboard?${searchParams.toString()}`)
        return response.data
    },

    // Get task analytics
    getTaskAnalytics: async (params?: {
        range?: string
        platform?: string
        type?: string
    }): Promise<any> => {
        const searchParams = new URLSearchParams()
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    searchParams.append(key, value.toString())
                }
            })
        }

        const response = await api.get(`/admin/analytics/tasks?${searchParams.toString()}`)
        return response.data
    },

    // Get submission analytics
    getSubmissionAnalytics: async (params?: {
        range?: string
        status?: string
    }): Promise<any> => {
        const searchParams = new URLSearchParams()
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    searchParams.append(key, value.toString())
                }
            })
        }

        const response = await api.get(`/admin/analytics/submissions?${searchParams.toString()}`)
        return response.data
    },

    // Get financial analytics
    getFinancialAnalytics: async (params?: {
        range?: string
    }): Promise<any> => {
        const searchParams = new URLSearchParams()
        if (params?.range) {
            searchParams.append('range', params.range)
        }

        const response = await api.get(`/admin/analytics/financial?${searchParams.toString()}`)
        return response.data
    },

    // Get user analytics
    getUserAnalytics: async (params?: {
        range?: string
        userMode?: string
    }): Promise<any> => {
        const searchParams = new URLSearchParams()
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    searchParams.append(key, value.toString())
                }
            })
        }

        const response = await api.get(`/admin/analytics/users?${searchParams.toString()}`)
        return response.data
    },

    // Export data to CSV
    exportData: async (type: string, params?: {
        range?: string
        format?: string
    }): Promise<any> => {
        const searchParams = new URLSearchParams()
        searchParams.append('type', type)

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    searchParams.append(key, value.toString())
                }
            })
        }

        const response = await api.get(`/admin/analytics/export?${searchParams.toString()}`)
        return response.data
    }
}