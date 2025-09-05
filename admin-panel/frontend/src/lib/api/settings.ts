import { api } from '../api'

export interface SystemSettings {
    revenueShareRatio: number
    currency: string
    roundingMode: 'up' | 'down' | 'half-up' | 'half-down'
    minWithdrawalAmount: number
    withdrawalFee: number
    withdrawalFeeType: 'fixed' | 'percentage'
    moderationEnabled: boolean
    autoApproveTasks: boolean
    taskExpirationDays: number
    maxConcurrentTasksPerUser: number
    platformFeePercentage: number
}

export interface EmailSettings {
    smtpHost: string
    smtpPort: number
    smtpUser: string
    smtpPassword: string
    fromEmail: string
    fromName: string
}

export interface PaymentSettings {
    stripePublicKey: string
    stripeSecretKey: string
    paypalClientId: string
    paypalSecret: string
    currency: string
}

export interface ApiSettings {
    rateLimit: number
    rateLimitWindow: number
    maxRequestBodySize: string
    corsOrigins: string[]
}

export const settingsApi = {
    // Get system settings
    getSystemSettings: async (): Promise<SystemSettings> => {
        const response = await api.get('/admin/settings/system')
        return response.data
    },

    // Update system settings
    updateSystemSettings: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
        const response = await api.put('/admin/settings/system', settings)
        return response.data
    },

    // Get email settings
    getEmailSettings: async (): Promise<EmailSettings> => {
        const response = await api.get('/admin/settings/email')
        return response.data
    },

    // Update email settings
    updateEmailSettings: async (settings: Partial<EmailSettings>): Promise<EmailSettings> => {
        const response = await api.put('/admin/settings/email', settings)
        return response.data
    },

    // Get payment settings
    getPaymentSettings: async (): Promise<PaymentSettings> => {
        const response = await api.get('/admin/settings/payment')
        return response.data
    },

    // Update payment settings
    updatePaymentSettings: async (settings: Partial<PaymentSettings>): Promise<PaymentSettings> => {
        const response = await api.put('/admin/settings/payment', settings)
        return response.data
    },

    // Get API settings
    getApiSettings: async (): Promise<ApiSettings> => {
        const response = await api.get('/admin/settings/api')
        return response.data
    },

    // Update API settings
    updateApiSettings: async (settings: Partial<ApiSettings>): Promise<ApiSettings> => {
        const response = await api.put('/admin/settings/api', settings)
        return response.data
    },

    // Get all settings
    getAllSettings: async (): Promise<{
        system: SystemSettings
        email: EmailSettings
        payment: PaymentSettings
        api: ApiSettings
    }> => {
        const response = await api.get('/admin/settings')
        return response.data
    },

    // Reset settings to defaults
    resetSettings: async (type: 'system' | 'email' | 'payment' | 'api'): Promise<any> => {
        const response = await api.post('/admin/settings/reset', { type })
        return response.data
    }
}

export default settingsApi