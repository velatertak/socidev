import React, { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Shield,
    Activity,
    AlertTriangle,
    Eye,
    Download,
    RefreshCw,
    Search,
    Calendar,
    MapPin,
    User,
    Settings,
    Database,
    Globe,
    XCircle,
    CheckCircle,
    Trash2,
    LogOut
} from 'lucide-react'
import { cn, formatRelativeTime } from '../../lib/utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { securityApi, SecurityAlert, AuditLog, ActiveSession, SystemHealth } from '../../lib/api/security'
import toast from 'react-hot-toast'

// Error Boundary Component for Security Page
class SecurityPageErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback?: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    constructor(props: any) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('SecurityPage error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                    <XCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 text-center mb-4">There was an error loading the security page.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Reload Page
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

// Session termination confirmation modal
const SessionTerminationModal: React.FC<{
    isOpen: boolean
    onClose: () => void
    session: ActiveSession
    onConfirm: () => void
    isLoading: boolean
}> = ({ isOpen, onClose, session, onConfirm, isLoading }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center mb-4">
                    <div className="bg-red-100 rounded-full p-2 mr-3">
                        <LogOut className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Terminate Session</h3>
                </div>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to terminate the session for{' '}
                    <span className="font-medium">{session.admin.email}</span> from{' '}
                    <span className="font-medium">{session.ipAddress}</span>?
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                    >
                        {isLoading ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Terminating...
                            </>
                        ) : (
                            <>
                                <LogOut className="h-4 w-4 mr-2" />
                                Terminate
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

const SecurityPageContent = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedTab, setSelectedTab] = useState('alerts')
    const [selectedSeverity, setSelectedSeverity] = useState('ALL')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [sessionToTerminate, setSessionToTerminate] = useState<ActiveSession | null>(null)

    const queryClient = useQueryClient()

    // Fetch audit logs (activities)
    const {
        data: auditLogsResponse,
        isLoading: auditLogsLoading,
        error: auditLogsError,
        refetch: refetchAuditLogs
    } = useQuery({
        queryKey: ['admin-activities', { page: currentPage, limit: itemsPerPage, search: searchTerm }],
        queryFn: () => securityApi.getAuditLogs({
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm || undefined
        }),
        refetchInterval: 30000,
        retry: 2,
        retryDelay: 1000,
        staleTime: 10000,
    })

    // Fetch active sessions
    const {
        data: sessionsResponse,
        isLoading: sessionsLoading,
        error: sessionsError,
        refetch: refetchSessions
    } = useQuery({
        queryKey: ['admin-sessions'],
        queryFn: securityApi.getActiveSessions,
        refetchInterval: 30000,
        retry: 2,
        retryDelay: 1000,
        staleTime: 10000,
    })

    // Fetch system health
    const {
        data: systemHealthResponse,
        isLoading: systemHealthLoading,
        error: systemHealthError,
        refetch: refetchSystemHealth
    } = useQuery({
        queryKey: ['system-health'],
        queryFn: securityApi.getSystemHealth,
        refetchInterval: 60000,
        retry: 2,
        retryDelay: 1000,
        staleTime: 30000,
    })

    // Session termination mutation
    const terminateSessionMutation = useMutation({
        mutationFn: (sessionId: string) => securityApi.terminateSession(sessionId),
        onSuccess: () => {
            toast.success('Session terminated successfully')
            queryClient.invalidateQueries({ queryKey: ['admin-sessions'] })
            setSessionToTerminate(null)
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to terminate session')
        }
    })

    const tabs = [
        { id: 'alerts', label: 'Security Alerts', icon: AlertTriangle },
        { id: 'audit', label: 'Audit Logs', icon: Activity },
        { id: 'sessions', label: 'Active Sessions', icon: User },
        { id: 'health', label: 'System Health', icon: Database }
    ]

    // Handle authentication errors
    useEffect(() => {
        if (auditLogsError || sessionsError || systemHealthError) {
            const error = auditLogsError || sessionsError || systemHealthError
            const errorResponse = error as any
            if (errorResponse?.response?.status === 401) {
                toast.error('Authentication failed. Please log in again.')
            }
        }
    }, [auditLogsError, sessionsError, systemHealthError])

    // Generate mock alerts from audit logs for demonstration
    const alerts: SecurityAlert[] = useMemo(() => {
        if (!auditLogsResponse?.data.activities) return []
        return securityApi.generateMockAlerts(auditLogsResponse.data.activities)
    }, [auditLogsResponse])

    // Filter logic for alerts
    const filteredAlerts = useMemo(() => {
        return alerts.filter(alert => {
            const matchesSearch = alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                alert.source.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesSeverity = selectedSeverity === 'ALL' || alert.severity === selectedSeverity
            return matchesSearch && matchesSeverity
        })
    }, [alerts, searchTerm, selectedSeverity])

    // Filter logic for audit logs
    const filteredAuditLogs = useMemo(() => {
        if (!auditLogsResponse?.data.activities) return []
        return auditLogsResponse.data.activities.filter(log => {
            return log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()))
        })
    }, [auditLogsResponse, searchTerm])

    const refreshData = async () => {
        try {
            await Promise.all([
                refetchAuditLogs(),
                refetchSessions(),
                refetchSystemHealth()
            ])
            toast.success('Data refreshed successfully')
        } catch (error) {
            toast.error('Failed to refresh data')
        }
    }

    const exportData = () => {
        let csvContent = ''

        if (selectedTab === 'alerts') {
            csvContent = [
                'Type,Severity,Message,Source,Timestamp,Resolved',
                ...filteredAlerts.map(item =>
                    `${item.type},${item.severity},"${item.message}",${item.source},${item.timestamp},${item.resolved}`
                )
            ].join('\n')
        } else if (selectedTab === 'audit') {
            csvContent = [
                'Action,Admin,IP,Timestamp,Details',
                ...filteredAuditLogs.map(item =>
                    `${item.action},${item.admin.email},${item.ipAddress},${item.createdAt},"${JSON.stringify(item.details)}"`
                )
            ].join('\n')
        }

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedTab}-export-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'HIGH': return 'bg-red-100 text-red-800'
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
            case 'LOW': return 'bg-blue-100 text-blue-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'USER_LOGIN': return <User className="h-4 w-4" />
            case 'USER_UPDATE': return <User className="h-4 w-4" />
            case 'ORDER_APPROVE': return <Eye className="h-4 w-4" />
            case 'SETTINGS_UPDATE': return <Settings className="h-4 w-4" />
            case 'DATA_EXPORT': return <Download className="h-4 w-4" />
            default: return <Activity className="h-4 w-4" />
        }
    }

    const renderAlerts = () => (
        <div className="space-y-4">
            {filteredAlerts.map(alert => (
                <div key={alert.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={cn(
                                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                    getSeverityColor(alert.severity)
                                )}>
                                    {alert.severity}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {formatRelativeTime(alert.timestamp)}
                                </span>
                                {alert.resolved && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Resolved
                                    </span>
                                )}
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 mb-1">
                                {alert.message}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                                {alert.details}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                                <Globe className="h-3 w-3 mr-1" />
                                Source: {alert.source}
                            </div>
                        </div>
                        <button className="text-primary-600 hover:text-primary-900 text-sm">
                            View Details
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )

    const renderAuditLogs = () => (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Action
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Time
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAuditLogs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                            {getActionIcon(log.action)}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {log.action.replace('_', ' ')}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{log.admin.firstName} {log.admin.lastName}</div>
                                    <div className="text-xs text-gray-500">{log.ipAddress}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-900">
                                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                        {log.ipAddress}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{JSON.stringify(log.details)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatRelativeTime(log.createdAt)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )

    const renderActiveSessions = () => {
        const sessions = sessionsResponse?.data.sessions || []

        if (sessionsLoading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                    <span className="ml-3 text-gray-600">Loading sessions...</span>
                </div>
            )
        }

        if (sessionsError) {
            const errorResponse = sessionsError as any
            return (
                <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
                    <XCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Sessions</h2>
                    <p className="text-gray-600 text-center mb-4">
                        {errorResponse?.response?.status === 401
                            ? 'Authentication failed. Please log in again.'
                            : 'There was a problem loading active sessions.'}
                    </p>
                    <button
                        onClick={() => refetchSessions()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        <RefreshCw className="h-4 w-4 inline mr-2" />
                        Retry
                    </button>
                </div>
            )
        }

        if (sessions.length === 0) {
            return (
                <div className="text-center py-12">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Sessions</h3>
                    <p className="text-gray-600">There are currently no active admin sessions.</p>
                </div>
            )
        }

        return (
            <>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        IP Address
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Activity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sessions.map(session => (
                                    <tr key={session.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center mr-3">
                                                    <User className="h-4 w-4 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{session.admin.firstName} {session.admin.lastName}</div>
                                                    <div className="text-xs text-gray-500">{session.admin.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Globe className="h-4 w-4 mr-1 text-gray-400" />
                                                {session.ipAddress}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatRelativeTime(session.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatRelativeTime(session.lastActivity)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => setSessionToTerminate(session)}
                                                className="text-red-600 hover:text-red-900 text-sm font-medium flex items-center"
                                            >
                                                <LogOut className="h-4 w-4 mr-1" />
                                                Terminate
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Session Termination Modal */}
                <SessionTerminationModal
                    isOpen={!!sessionToTerminate}
                    onClose={() => setSessionToTerminate(null)}
                    session={sessionToTerminate!}
                    onConfirm={() => {
                        if (sessionToTerminate) {
                            terminateSessionMutation.mutate(sessionToTerminate.id)
                        }
                    }}
                    isLoading={terminateSessionMutation.isPending}
                />
            </>
        )
    }

    const renderSystemHealth = () => {
        if (systemHealthLoading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                    <span className="ml-3 text-gray-600">Loading system health...</span>
                </div>
            )
        }

        if (systemHealthError) {
            const errorResponse = systemHealthError as any
            return (
                <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
                    <XCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load System Health</h2>
                    <p className="text-gray-600 text-center mb-4">
                        {errorResponse?.response?.status === 401
                            ? 'Authentication failed. Please log in again.'
                            : 'There was a problem loading system health data.'}
                    </p>
                    <button
                        onClick={() => refetchSystemHealth()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        <RefreshCw className="h-4 w-4 inline mr-2" />
                        Retry
                    </button>
                </div>
            )
        }

        const healthData = systemHealthResponse?.data
        if (!healthData) {
            return (
                <div className="text-center py-12">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Health Data</h3>
                    <p className="text-gray-600">System health data is not available.</p>
                </div>
            )
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">System Status</p>
                            <p className="text-2xl font-bold text-green-600">HEALTHY</p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                            <Shield className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Uptime</p>
                            <p className="text-2xl font-bold text-gray-900">{Math.floor(healthData.uptime / 3600)}h</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Activity className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                            <p className="text-2xl font-bold text-gray-900">{Math.round(healthData.memoryUsage.heapUsed / 1024 / 1024)}MB</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                            <Database className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Platform</p>
                            <p className="text-2xl font-bold text-gray-900">{healthData.platform}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Globe className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Database Statistics */}
                <div className="col-span-full">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Statistics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{healthData.dbStats.users}</p>
                                <p className="text-sm text-gray-600">Users</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{healthData.dbStats.orders}</p>
                                <p className="text-sm text-gray-600">Orders</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600">{healthData.dbStats.tasks}</p>
                                <p className="text-sm text-gray-600">Tasks</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">{healthData.dbStats.socialAccounts}</p>
                                <p className="text-sm text-gray-600">Social Accounts</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">{healthData.dbStats.transactions}</p>
                                <p className="text-sm text-gray-600">Transactions</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-indigo-600">{healthData.dbStats.admins}</p>
                                <p className="text-sm text-gray-600">Admins</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderTabContent = () => {
        switch (selectedTab) {
            case 'alerts': return renderAlerts()
            case 'audit': return renderAuditLogs()
            case 'sessions': return renderActiveSessions()
            case 'health': return renderSystemHealth()
            default: return <div>Tab content not implemented</div>
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="h-7 w-7 text-primary-600" />
                        Security & Monitoring
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Advanced security features and activity monitoring
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={refreshData}
                        disabled={auditLogsLoading || sessionsLoading || systemHealthLoading}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw className={cn("h-4 w-4 mr-2", (auditLogsLoading || sessionsLoading || systemHealthLoading) && "animate-spin")} />
                        Refresh
                    </button>
                    <button
                        onClick={exportData}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id)}
                                className={cn(
                                    'flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                                    selectedTab === tab.id
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                )}
                            >
                                <Icon className="h-4 w-4 mr-2" />
                                {tab.label}
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* Filters for Alerts and Audit tabs */}
            {(selectedTab === 'alerts' || selectedTab === 'audit') && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={`Search ${selectedTab}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        {selectedTab === 'alerts' && (
                            <div>
                                <select
                                    value={selectedSeverity}
                                    onChange={(e) => setSelectedSeverity(e.target.value)}
                                    className="block px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
                                >
                                    <option value="ALL">All Severity</option>
                                    <option value="HIGH">High</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="LOW">Low</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {renderTabContent()}
            </div>
        </div>
    )
}

// Main component with error boundary
const SecurityPage = () => {
    return (
        <SecurityPageErrorBoundary>
            <SecurityPageContent />
        </SecurityPageErrorBoundary>
    )
}

export default SecurityPage