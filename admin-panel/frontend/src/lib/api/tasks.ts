import { api } from '../api'

export interface Task {
    id: string
    userId: string
    title: string
    description: string
    serviceType: string
    platform: string
    targetUrl: string
    quantity: number
    startCount: number
    remainingCount: number
    status: string
    adminStatus: string
    reward: number
    budgetTotal: number
    unitPayoutMinor: number
    adminNotes: string
    submittedAt: string
    approvedAt: string
    rejectedAt: string
    rejectionReason: string
    adminReviewedBy: string
    adminReviewedAt: string
    createdAt: string
    updatedAt: string
    user: {
        id: string
        firstName: string
        lastName: string
        email: string
        username: string
    }
    // Optional properties for backward compatibility
    type?: string
}

export interface TaskSubmission {
    id: string
    taskId: string
    doerId: string
    status: string
    proofText: string
    proofFiles: string[]
    proofUrls: string[]
    payoutAmount: number
    rejectionReason: string
    submittedAt: string
    reviewedAt: string
    reviewerId: string
    task: {
        id: string
        title: string
        description: string
        serviceType: string
        platform: string
        targetUrl: string
        reward: number
        unitPayoutMinor: number
    }
    doer: {
        id: string
        firstName: string
        lastName: string
        email: string
        username: string
    }
    reviewer: {
        id: string
        firstName: string
        lastName: string
        username: string
    }
}

export interface TasksResponse {
    tasks: Task[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export interface SubmissionsResponse {
    submissions: TaskSubmission[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export interface TaskDetailResponse {
    task: Task
}

export interface SubmissionDetailResponse {
    submission: TaskSubmission
}

export const taskApi = {
    // Get pending tasks for approval
    getPendingTasks: async (params?: {
        page?: number
        limit?: number
        search?: string
        platform?: string
    }): Promise<TasksResponse> => {
        const searchParams = new URLSearchParams()
        searchParams.append('adminStatus', 'pending')

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    searchParams.append(key, value.toString())
                }
            })
        }

        const response = await api.get(`/admin/tasks?${searchParams.toString()}`)
        return response.data
    },

    // Get pending submissions for review (using tasks with SUBMITTED status)
    getPendingSubmissions: async (params?: {
        page?: number
        limit?: number
        search?: string
    }): Promise<SubmissionsResponse> => {
        const searchParams = new URLSearchParams()
        // Add status parameter for submitted tasks
        searchParams.append('status', 'submitted')

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    searchParams.append(key, value.toString())
                }
            })
        }

        const response = await api.get(`/admin/tasks?${searchParams.toString()}`)
        return response.data
    },

    // Approve task
    approveTask: async (id: string, notes?: string): Promise<TaskDetailResponse> => {
        const response = await api.post(`/admin/tasks/${id}/approve`, { notes })
        return response.data
    },

    // Reject task
    rejectTask: async (id: string, reason: string, notes?: string): Promise<TaskDetailResponse> => {
        const response = await api.post(`/admin/tasks/${id}/reject`, { reason, notes })
        return response.data
    },

    // Approve submission (using task approval endpoint)
    approveSubmission: async (id: string, notes?: string): Promise<SubmissionDetailResponse> => {
        const response = await api.post(`/admin/tasks/${id}/approve`, { notes })
        return response.data
    },

    // Reject submission (using task rejection endpoint)
    rejectSubmission: async (id: string, reason: string, notes?: string): Promise<SubmissionDetailResponse> => {
        const response = await api.post(`/admin/tasks/${id}/reject`, { reason, notes })
        return response.data
    },

    // Get all tasks with filtering
    getAllTasks: async (params?: {
        page?: number
        limit?: number
        search?: string
        status?: string
        adminStatus?: string
        platform?: string
        type?: string
        userId?: string
        sortBy?: string
        sortOrder?: 'asc' | 'desc'
    }): Promise<TasksResponse> => {
        const searchParams = new URLSearchParams()
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    searchParams.append(key, value.toString())
                }
            })
        }

        const response = await api.get(`/admin/tasks?${searchParams.toString()}`)
        return response.data
    },

    // Get all submissions with filtering (using tasks API)
    getAllSubmissions: async (params?: {
        page?: number
        limit?: number
        search?: string
        status?: string
        doerId?: string
        taskId?: string
        sortBy?: string
        sortOrder?: 'asc' | 'desc'
    }): Promise<SubmissionsResponse> => {
        const searchParams = new URLSearchParams()
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    searchParams.append(key, value.toString())
                }
            })
        }

        const response = await api.get(`/admin/tasks?${searchParams.toString()}`)
        return response.data
    }
}