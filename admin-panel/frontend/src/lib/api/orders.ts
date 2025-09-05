import { api } from '../api'

export interface Order {
    id: string
    userId: string
    platform: 'instagram' | 'youtube'
    service: string
    targetUrl: string
    quantity: number
    startCount: number
    remainingCount: number
    status: 'pending' | 'processing' | 'completed' | 'failed'
    speed: 'normal' | 'fast' | 'express'
    amount: number
    adminNotes?: string
    approvedBy?: string
    approvedAt?: string
    rejectedBy?: string
    rejectedAt?: string
    rejectionReason?: string
    updatedBy?: string
    createdAt: string
    updatedAt: string
    user: {
        id: string
        firstName: string
        lastName: string
        email: string
        username: string
        userMode: string
        balance?: number
    }
}

export interface OrdersResponse {
    message: string
    data: {
        orders: Order[]
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

export interface OrderDetailResponse {
    message: string
    data: {
        order: Order
    }
}

export interface OrderStatistics {
    ordersByStatus: Record<string, { count: number; revenue: number }>
    orderCounts: {
        today: number
        yesterday: number
        week: number
        month: number
    }
    revenue: {
        total: number
        today: number
        month: number
    }
    platformDistribution: Record<string, { count: number; revenue: number }>
    serviceTypeDistribution: Record<string, { count: number; revenue: number }>
}

export interface BulkActionRequest {
    orderIds: string[]
    action: 'approve' | 'reject' | 'cancel'
    reason?: string
}

export interface BulkActionResponse {
    message: string
    data: {
        results: Array<{
            orderId: string
            status: 'approved' | 'rejected' | 'error'
            error?: string
        }>
    }
}

export const orderApi = {
    // Get all orders with filtering and pagination
    getOrders: async (params?: {
        page?: number
        limit?: number
        search?: string
        status?: string
        platform?: string
        serviceType?: string
        sortBy?: string
        sortOrder?: 'asc' | 'desc'
    }): Promise<OrdersResponse> => {
        try {
            const searchParams = new URLSearchParams()
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== '') {
                        searchParams.append(key, value.toString())
                    }
                })
            }

            const response = await api.get(`/admin/orders?${searchParams.toString()}`)
            return response.data
        } catch (error) {
            console.error('Error fetching orders:', error)
            throw error
        }
    },

    // Get single order details
    getOrder: async (id: string): Promise<OrderDetailResponse> => {
        const response = await api.get(`/admin/orders/${id}`)
        return response.data
    },

    // Get pending orders for approval
    getPendingOrders: async (params?: {
        page?: number
        limit?: number
    }): Promise<OrdersResponse> => {
        const searchParams = new URLSearchParams()
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString())
                }
            })
        }

        const response = await api.get(`/admin/orders/pending-approval?${searchParams.toString()}`)
        return response.data
    },

    // Update order status
    updateOrderStatus: async (id: string, data: {
        status: string
        reason?: string
    }): Promise<OrderDetailResponse> => {
        const response = await api.put(`/admin/orders/${id}/status`, data)
        return response.data
    },

    // Approve order
    approveOrder: async (id: string, notes?: string): Promise<OrderDetailResponse> => {
        const response = await api.put(`/admin/orders/${id}/approve`, { notes })
        return response.data
    },

    // Reject order
    rejectOrder: async (id: string, reason: string): Promise<OrderDetailResponse> => {
        const response = await api.put(`/admin/orders/${id}/reject`, { reason })
        return response.data
    },

    // Bulk actions
    bulkAction: async (data: BulkActionRequest): Promise<BulkActionResponse> => {
        const response = await api.post('/admin/orders/bulk-actions', data)
        return response.data
    },

    // Get order statistics
    getStatistics: async (): Promise<{ message: string; data: OrderStatistics }> => {
        const response = await api.get('/admin/orders/statistics/overview')
        return response.data
    },

    // Delete order
    deleteOrder: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/admin/orders/${id}`)
        return response.data
    }
}