import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Settings,
    Save,
    RefreshCw,
    Mail,
    CreditCard,
    Globe,
    Shield,
    Bell,
    Eye,
    EyeOff,
    AlertTriangle,
    CheckCircle,
    XCircle
} from 'lucide-react'
import { cn } from '../../lib/utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { settingsApi, SystemSettings } from '../../lib/api/settings'
import toast from 'react-hot-toast'

// Error Boundary Component for Settings
class SettingsPageErrorBoundary extends React.Component<
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
        console.error('SettingsPage error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                    <XCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 text-center mb-4">There was an error loading the settings page.</p>
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

const SettingsPageContent = () => {
    const [activeTab, setActiveTab] = useState('general')
    const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
    const [settings, setSettings] = useState<SystemSettings | null>(null)
    const [changedSettings, setChangedSettings] = useState<Record<string, Record<string, any>>>({})

    const queryClient = useQueryClient()

    // Fetch settings from API
    const {
        data: settingsResponse,
        isLoading: settingsLoading,
        error: settingsError,
        refetch: refetchSettings
    } = useQuery({
        queryKey: ['settings'],
        queryFn: settingsApi.getSettings,
        refetchInterval: 60000,
        retry: 2,
        retryDelay: 1000,
        staleTime: 30000,
    })

    // Transform settings data when loaded
    useEffect(() => {
        if (settingsResponse) {
            const structuredSettings = settingsApi.transformSettingsToStructured(settingsResponse.data.settings)
            setSettings(structuredSettings)
            setChangedSettings({})
        }
    }, [settingsResponse])

    // Mutation to update settings
    const updateSettingsMutation = useMutation({
        mutationFn: async (data: { settingsToUpdate: Array<{ key: string; value: string; category: string; description?: string }> }) => {
            const results = await Promise.allSettled(
                data.settingsToUpdate.map(setting => {
                    // Find the setting ID from the current settings
                    const currentSetting = settingsResponse?.data.settings[setting.category]?.find(s => s.key === setting.key)
                    if (currentSetting) {
                        return settingsApi.updateSetting(currentSetting.id, {
                            value: setting.value,
                            description: setting.description
                        })
                    } else {
                        // Create new setting if it doesn't exist
                        return settingsApi.createSetting({
                            key: setting.key,
                            value: setting.value,
                            category: setting.category,
                            description: setting.description
                        })
                    }
                })
            )
            return results
        },
        onSuccess: (results) => {
            const succeeded = results.filter(r => r.status === 'fulfilled').length
            const failed = results.filter(r => r.status === 'rejected').length

            if (succeeded > 0) {
                toast.success(`${succeeded} settings updated successfully`)
            }
            if (failed > 0) {
                toast.error(`${failed} settings failed to update`)
            }

            queryClient.invalidateQueries({ queryKey: ['settings'] })
            setChangedSettings({})
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update settings')
        }
    })

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'api', label: 'API', icon: Globe },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell }
    ]

    // Handle authentication errors
    useEffect(() => {
        if (settingsError) {
            console.error('Failed to fetch settings:', settingsError)
            const errorResponse = settingsError as any
            if (errorResponse.response?.status === 401) {
                toast.error('Authentication failed. Please log in again.')
            } else {
                toast.error('Failed to load settings. Please try again.')
            }
        }
    }, [settingsError])

    const handleInputChange = (section: string, field: string, value: any) => {
        if (!settings) return

        // Update local settings
        setSettings(prev => {
            if (!prev) return prev
            return {
                ...prev,
                [section]: {
                    ...prev[section as keyof SystemSettings],
                    [field]: value
                }
            }
        })

        // Track changed settings
        setChangedSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }))
    }

    const handleSave = async () => {
        if (!settings || !changedSettings) return

        const sectionsToSave = Object.keys(changedSettings)
        if (sectionsToSave.length === 0) {
            toast.error('No changes to save')
            return
        }

        // Prepare settings for API update
        const settingsToUpdate: Array<{ key: string; value: string; category: string; description?: string }> = []

        sectionsToSave.forEach(sectionName => {
            if (changedSettings[sectionName]) {
                Object.keys(changedSettings[sectionName]).forEach(key => {
                    const value = changedSettings[sectionName][key]
                    settingsToUpdate.push({
                        key,
                        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
                        category: sectionName,
                        description: `${sectionName} ${key} configuration`
                    })
                })
            }
        })

        if (settingsToUpdate.length === 0) {
            toast.error('No changes to save')
            return
        }

        updateSettingsMutation.mutate({ settingsToUpdate })
    }

    const togglePasswordVisibility = (field: string) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }))
    }

    const refreshSettings = async () => {
        await refetchSettings()
        toast.success('Settings refreshed')
    }

    const hasChanges = () => {
        return Object.keys(changedSettings).length > 0
    }

    // Loading state
    if (settingsLoading || !settings) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">Loading settings...</span>
            </div>
        )
    }

    // Error state
    if (settingsError && !settingsResponse) {
        const errorResponse = settingsError as any
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                <XCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Settings</h2>
                <p className="text-gray-600 text-center mb-4">
                    {errorResponse?.response?.status === 401
                        ? 'Please log in to access this page.'
                        : 'There was a problem loading the settings. Please try again.'}
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => refetchSettings()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        <RefreshCw className="h-4 w-4 inline mr-2" />
                        Retry
                    </button>
                    {errorResponse?.response?.status === 401 && (
                        <button
                            onClick={() => window.location.href = '/login'}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Go to Login
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings className="h-7 w-7 text-primary-600" />
                        System Settings
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage system configuration and preferences
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {hasChanges() && (
                        <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                            <AlertTriangle className="h-4 w-4 inline mr-1" />
                            Unsaved changes
                        </div>
                    )}
                    <button
                        onClick={refreshSettings}
                        disabled={settingsLoading}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw className={cn("h-4 w-4 mr-2", settingsLoading && "animate-spin")} />
                        Refresh
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges() || updateSettingsMutation.isPending}
                        className={cn(
                            "inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white",
                            hasChanges() && !updateSettingsMutation.isPending
                                ? "bg-primary-600 hover:bg-primary-700"
                                : "bg-gray-400 cursor-not-allowed"
                        )}
                    >
                        {updateSettingsMutation.isPending ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'flex items-center py-4 px-1 border-b-2 font-medium text-sm',
                                        activeTab === tab.id
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

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                                    <input
                                        type="text"
                                        value={settings.general?.siteName || ''}
                                        onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                                    <input
                                        type="email"
                                        value={settings.general?.contactEmail || ''}
                                        onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                                <textarea
                                    value={settings.general?.siteDescription || ''}
                                    onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                                    rows={3}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="maintenanceMode"
                                    checked={settings.general?.maintenanceMode || false}
                                    onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="maintenanceMode" className="ml-2 text-sm text-gray-700">
                                    Enable Maintenance Mode
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="space-y-6">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm text-yellow-800">
                                    <Shield className="h-4 w-4 inline mr-1" />
                                    Payment credentials are encrypted and stored securely.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={settings.payments?.commissionRate || 0}
                                        onChange={(e) => handleInputChange('payments', 'commissionRate', parseFloat(e.target.value) || 0)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Order Amount ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={settings.payments?.minOrderAmount || 0}
                                        onChange={(e) => handleInputChange('payments', 'minOrderAmount', parseFloat(e.target.value) || 0)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'email' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                                    <input
                                        type="text"
                                        value={settings.email?.smtpHost || ''}
                                        onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                                    <input
                                        type="email"
                                        value={settings.email?.fromEmail || ''}
                                        onChange={(e) => handleInputChange('email', 'fromEmail', e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'api' && (
                        <div className="space-y-6">
                            <div className="text-sm text-gray-600">API configuration settings will be available soon.</div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (hours)</label>
                                    <input
                                        type="number"
                                        value={settings.security?.sessionTimeout || 24}
                                        onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value) || 24)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                                    <input
                                        type="number"
                                        value={settings.security?.maxLoginAttempts || 5}
                                        onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value) || 5)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <div className="text-sm text-gray-600">Notification settings will be available soon.</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Main component with error boundary
const SettingsPage = () => {
    return (
        <SettingsPageErrorBoundary>
            <SettingsPageContent />
        </SettingsPageErrorBoundary>
    )
}

export default SettingsPage