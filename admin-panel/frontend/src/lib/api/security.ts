import { api } from '../api'

export interface SecurityAlert {
    id: string
    type: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    message: string
    source: string
    timestamp: string
    resolved: boolean
    details: string
    location?: string
}

export interface AuditLog {
    id: string
    adminId: string
    action: string
    resource: string
    resourceId?: string
    details: any
    ipAddress: string
    userAgent: string
    createdAt: string
    admin: {
        id: string
        email: string
        firstName: string
        lastName: string
    }
}

export interface ActiveSession {
    id: string
    adminId: string
    token: string
    ipAddress: string
    userAgent: string
    lastActivity: string
    createdAt: string
    expiresAt: string
    admin: {
        id: string
        email: string
        firstName: string
        lastName: string
    }
}

export interface SystemHealth {
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL'
    uptime: number
    memoryUsage: NodeJS.MemoryUsage
    nodeVersion: string
    platform: string
    arch: string
    pid: number
    timestamp: string
    dbStats: {
        users: number
        orders: number
        tasks: number
        socialAccounts: number
        transactions: number
        admins: number
    }
    recentActivity: {
        newUsers: number
        newOrders: number
        completedTasks: number
        adminActivities: number
    }
}

export interface SecurityAlertsResponse {
    message: string
    data: {
        alerts: SecurityAlert[]
        pagination?: {
            currentPage: number
            totalPages: number
            totalAlerts: number
            hasNextPage: boolean
            hasPrevPage: boolean
        }
    }
}

export interface AuditLogsResponse {
    message: string
    data: {
        activities: AuditLog[]
        pagination: {
            currentPage: number
            totalPages: number
            totalActivities: number
            hasNextPage: boolean
            hasPrevPage: boolean
        }
    }
}

export interface ActiveSessionsResponse {
    message: string
    data: {
        sessions: ActiveSession[]
    }
}

export interface SystemHealthResponse {
    message: string
    data: SystemHealth
}

export const securityApi = {
    // Get security alerts
    getAlerts: async (params?: {
        page?: number
        limit?: number
        search?: string
        severity?: string
        resolved?: boolean
        type?: string
    }): Promise<SecurityAlertsResponse> => {
        const searchParams = new URLSearchParams()
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    searchParams.append(key, value.toString())
                }
            })
        }

        const response = await api.get(`/security/alerts?${searchParams.toString()}`)
        return response.data
    },

    // Get audit logs (admin activities)
    getAuditLogs: async (params?: {
        page?: number
        limit?: number
        search?: string
        adminId?: string
        action?: string
        resource?: string
        startDate?: string
        endDate?: string
    }): Promise<AuditLogsResponse> => {
        const searchParams = new URLSearchParams()
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    searchParams.append(key, value.toString())
                }
            })
        }

        // Use admin activities endpoint since that's what exists in the backend
        const response = await api.get(`/admin/activities?${searchParams.toString()}`)
        return response.data
    },

    // Get active admin sessions
    getActiveSessions: async (): Promise<ActiveSessionsResponse> => {
        const response = await api.get('/admin/sessions')
        return response.data
    },

    // Terminate a specific session
    terminateSession: async (sessionId: string): Promise<{ message: string }> => {
        const response = await api.delete(`/admin/sessions/${sessionId}`)
        return response.data
    },

    // Terminate all sessions for a user
    terminateUserSessions: async (adminId: string): Promise<{ message: string }> => {
        const response = await api.delete(`/admin/sessions/user/${adminId}`)
        return response.data
    },

    // Get current session info
    getCurrentSession: async (): Promise<{ message: string; data: { session: ActiveSession } }> => {
        const response = await api.get('/admin/sessions/current')
        return response.data
    },

    // Get system health and information
    getSystemHealth: async (): Promise<SystemHealthResponse> => {
        const response = await api.get('/settings/system-info')
        return response.data
    },

    // Create security alert (for testing or manual alerts)
    createAlert: async (data: {
        type: string
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
        message: string
        source: string
        details: string
    }): Promise<{ message: string; data: { alert: SecurityAlert } }> => {
        const response = await api.post('/security/alerts', data)
        return response.data
    },

    // Mark alert as resolved
    resolveAlert: async (alertId: string): Promise<{ message: string }> => {
        const response = await api.put(`/security/alerts/${alertId}/resolve`)
        return response.data
    },

    // Get security statistics
    getSecurityStats: async (): Promise<{
        message: string
        data: {
            alertCounts: Record<string, number>
            sessionCounts: Record<string, number>
            recentLoginAttempts: Array<{
                timestamp: string
                success: boolean
                ipAddress: string
            }>
        }
    }> => {
        const response = await api.get('/security/statistics')
        return response.data
    },

    // Force logout user (terminate all sessions)
    forceLogout: async (adminId: string, reason?: string): Promise<{ message: string }> => {
        const response = await api.post(`/admin/${adminId}/force-logout`, { reason })
        return response.data
    },

    // Get login attempt history
    getLoginHistory: async (params?: {
        page?: number
        limit?: number
        adminId?: string
        ipAddress?: string
        success?: boolean
        startDate?: string
        endDate?: string
    }): Promise<{
        message: string
        data: {
            attempts: Array<{
                id: string
                adminId?: string
                email: string
                ipAddress: string
                userAgent: string
                success: boolean
                failureReason?: string
                timestamp: string
                location?: string
            }>
            pagination: {
                currentPage: number
                totalPages: number
                totalAttempts: number
                hasNextPage: boolean
                hasPrevPage: boolean
            }
        }
    }> => {
        const searchParams = new URLSearchParams()
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    searchParams.append(key, value.toString())
                }
            })
        }

        const response = await api.get(`/security/login-history?${searchParams.toString()}`)
        return response.data
    },

    // Mock function to generate security alerts from activity patterns
    generateMockAlerts: (activities: AuditLog[]): SecurityAlert[] => {
        const alerts: SecurityAlert[] = []

        // Check for suspicious patterns
        const recentActivities = activities.filter(a =>
            new Date(a.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
        )

        // Multiple failed login attempts
        const failedLogins = recentActivities.filter(a =>
            a.action.includes('LOGIN') && a.details?.success === false
        )

        if (failedLogins.length >= 3) {
            alerts.push({
                id: 'alert-failed-logins',
                type: 'FAILED_LOGIN_ATTEMPTS',
                severity: 'HIGH',
                message: `${failedLogins.length} failed login attempts detected`,
                source: failedLogins[0]?.ipAddress || 'Unknown',
                timestamp: new Date().toISOString(),
                resolved: false,
                details: `Multiple failed login attempts from ${failedLogins[0]?.ipAddress}`,
                location: 'System'
            })
        }

        // Unusual admin activity
        const adminActions = recentActivities.filter(a =>
            ['DELETE', 'UPDATE', 'CREATE'].some(action => a.action.includes(action))
        )

        if (adminActions.length >= 10) {
            alerts.push({
                id: 'alert-high-admin-activity',
                type: 'HIGH_ADMIN_ACTIVITY',
                severity: 'MEDIUM',
                message: 'Unusually high admin activity detected',
                source: adminActions[0]?.admin?.email || 'Unknown',
                timestamp: new Date().toISOString(),
                resolved: false,
                details: `${adminActions.length} admin actions in the last 24 hours`,
                location: 'Admin Panel'
            })
        }

        return alerts
    }
}

export default securityApi