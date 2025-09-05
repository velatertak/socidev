import { api } from '../api'

export interface LedgerEntry {
    id: string
    type: 'escrow' | 'earning' | 'revenue'
    direction: 'in' | 'out'
    amount: number
    description: string
    taskId?: string
    userId?: string
    processedAt: string
    status: 'pending' | 'completed' | 'cancelled'
}

export interface FinancialSummary {
    totalEscrow: number
    totalEarnings: number
    totalRevenue: number
    pendingTransactions: number
    completedTransactions: number
}

export interface LedgerDataResponse {
    entries: LedgerEntry[]
    summary: FinancialSummary
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export interface RevenueReport {
    totalRevenue: number
    taskCompletionRevenue: number
    partialRevenue: number
    cancellationRevenue: number
    workerPayouts: number
    currentEscrow: number
    dateRange: {
        from: string
        to: string
    }
}

export interface EarningsReport {
    totalEarnings: number
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
    earningsByDate: Array<{
        date: string
        amount: number
    }>
}

export const financialApi = {
    // Get ledger data with filtering
    getLedgerData: async (params?: {
        type?: 'escrow' | 'earning' | 'revenue' | 'all'
        range?: string
        search?: string
        page?: number
        limit?: number
    }): Promise<LedgerDataResponse> => {
        const searchParams = new URLSearchParams()
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    searchParams.append(key, value.toString())
                }
            })
        }

        const response = await api.get(`/admin/financial/ledger?${searchParams.toString()}`)
        return response.data
    },

    // Get revenue report
    getRevenueReport: async (params?: {
        range?: string
    }): Promise<RevenueReport> => {
        const searchParams = new URLSearchParams()
        if (params?.range) {
            searchParams.append('range', params.range)
        }

        const response = await api.get(`/admin/financial/revenue?${searchParams.toString()}`)
        return response.data
    },

    // Get earnings report
    getEarningsReport: async (params?: {
        range?: string
    }): Promise<EarningsReport> => {
        const searchParams = new URLSearchParams()
        if (params?.range) {
            searchParams.append('range', params.range)
        }

        const response = await api.get(`/admin/financial/earnings?${searchParams.toString()}`)
        return response.data
    },

    // Get escrow report
    getEscrowReport: async (params?: {
        range?: string
    }): Promise<any> => {
        const searchParams = new URLSearchParams()
        if (params?.range) {
            searchParams.append('range', params.range)
        }

        const response = await api.get(`/admin/financial/escrow?${searchParams.toString()}`)
        return response.data
    },

    // Export financial data
    exportFinancialData: async (type: string, params?: {
        range?: string
        format?: 'csv' | 'xlsx' | 'pdf'
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

        const response = await api.get(`/admin/financial/export?${searchParams.toString()}`)
        return response.data
    }
}