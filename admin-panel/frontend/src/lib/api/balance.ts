import { api } from '../api'

export interface BalanceRequest {
    id: string
    userId: string
    type: 'deposit' | 'withdrawal' | 'order_payment' | 'task_earning'
    amount: number
    status: 'pending' | 'completed' | 'failed'
    method: string
    details: Record<string, any>
    reference?: string
    createdAt: string
    updatedAt: string
    User?: {
        id: string
        email: string
        firstName: string
        lastName: string
        username: string
        balance: number
    }
}

export interface BalanceRequestsResponse {
    transactions: BalanceRequest[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export const balanceApi = {
    // Get balance requests with filtering
    getRequests: async (params?: {
        page?: number
        limit?: number
        type?: 'deposit' | 'withdrawal'
        status?: 'pending' | 'completed' | 'failed'
        search?: string
    }): Promise<BalanceRequestsResponse> => {
        const searchParams = new URLSearchParams()
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    searchParams.append(key, value.toString())
                }
            })
        }

        const response = await api.get(`/admin/balance/requests?${searchParams.toString()}`)
        return response.data
    },

    // Approve a balance request
    approveRequest: async (id: string, adminNotes?: string): Promise<any> => {
        const response = await api.put(`/admin/balance/requests/${id}/approve`, {
            adminNotes
        })
        return response.data
    },

    // Reject a balance request
    rejectRequest: async (id: string, rejectionReason: string, adminNotes?: string): Promise<any> => {
        const response = await api.put(`/admin/balance/requests/${id}/reject`, {
            rejectionReason,
            adminNotes
        })
        return response.data
    },

    // Get details of a specific balance request
    getRequestDetails: async (id: string): Promise<{ transaction: BalanceRequest }> => {
        const response = await api.get(`/admin/balance/requests/${id}`)
        return response.data
    }
}