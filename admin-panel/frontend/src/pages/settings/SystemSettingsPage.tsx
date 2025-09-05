import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Settings,
    Save,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    DollarSign,
    Percent,
    Shield
} from 'lucide-react'
import { cn } from '../../lib/utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { settingsApi } from '../../lib/api/settings'
import toast from 'react-hot-toast'

interface SystemSettings {
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

const SystemSettingsPage = () => {
    const [settings, setSettings] = useState<SystemSettings>({
        revenueShareRatio: 0.6,
        currency: 'TRY',
        roundingMode: 'half-up',
        minWithdrawalAmount: 50,
        withdrawalFee: 2,
        withdrawalFeeType: 'fixed',
        moderationEnabled: true,
        autoApproveTasks: false,
        taskExpirationDays: 30,
        maxConcurrentTasksPerUser: 5,
        platformFeePercentage: 40
    })
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    const queryClient = useQueryClient()

    // Get current settings
    const {
        data: currentSettings,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['system-settings'],
        queryFn: () => settingsApi.getSystemSettings(),
        retry: 1,
        staleTime: 60000, // Consider data stale after 1 minute
    })

    // Update settings mutation
    const updateSettingsMutation = useMutation({
        mutationFn: (newSettings: Partial<SystemSettings>) => settingsApi.updateSystemSettings(newSettings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system-settings'] })
            toast.success('Settings updated successfully')
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update settings')
        }
    })

    useEffect(() => {
        if (currentSettings) {
            setSettings(currentSettings)
        }
    }, [currentSettings])

    const handleRefresh = () => {
        refetch()
    }

    const handleSave = () => {
        setIsSaving(true)
        updateSettingsMutation.mutate(settings)
        setIsSaving(false)
    }

    const handleChange = (field: keyof SystemSettings, value: any) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }))
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner />
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Settings</h3>
                <p className="text-gray-500 mb-6">
                    There was an error loading the system settings.
                </p>
                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                    <p className="text-gray-600 mt-1">
                        Configure platform-wide settings and policies
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                        Refresh
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? (
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

            {saveSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-green-800">Settings saved successfully!</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Payout Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Payout Settings</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Worker Revenue Share Ratio
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="0.1"
                                    max="0.9"
                                    step="0.01"
                                    value={settings.revenueShareRatio}
                                    onChange={(e) => handleChange('revenueShareRatio', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-sm font-medium text-gray-900 min-w-[50px]">
                                    {(settings.revenueShareRatio * 100).toFixed(0)}%
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Percentage of task budget paid to workers (default: 60%)
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Platform Fee Percentage
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="10"
                                    max="90"
                                    step="1"
                                    value={settings.platformFeePercentage}
                                    onChange={(e) => handleChange('platformFeePercentage', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-sm font-medium text-gray-900 min-w-[50px]">
                                    {settings.platformFeePercentage}%
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Platform fee collected from task budgets (default: 40%)
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Currency
                            </label>
                            <select
                                value={settings.currency}
                                onChange={(e) => handleChange('currency', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="TRY">Turkish Lira (₺)</option>
                                <option value="USD">US Dollar ($)</option>
                                <option value="EUR">Euro (€)</option>
                                <option value="GBP">British Pound (£)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Default currency for all transactions
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rounding Mode
                            </label>
                            <select
                                value={settings.roundingMode}
                                onChange={(e) => handleChange('roundingMode', e.target.value as any)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="up">Round Up</option>
                                <option value="down">Round Down</option>
                                <option value="half-up">Round Half Up</option>
                                <option value="half-down">Round Half Down</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                How to handle decimal precision in calculations
                            </p>
                        </div>
                    </div>
                </div>

                {/* Withdrawal Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Percent className="h-5 w-5 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Withdrawal Settings</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Withdrawal Amount
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                    ₺
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={settings.minWithdrawalAmount}
                                    onChange={(e) => handleChange('minWithdrawalAmount', parseFloat(e.target.value))}
                                    className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Minimum amount workers must earn before withdrawing
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Withdrawal Fee Type
                            </label>
                            <select
                                value={settings.withdrawalFeeType}
                                onChange={(e) => handleChange('withdrawalFeeType', e.target.value as any)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="fixed">Fixed Amount</option>
                                <option value="percentage">Percentage</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                How to calculate withdrawal fees
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Withdrawal Fee
                            </label>
                            <div className="relative">
                                {settings.withdrawalFeeType === 'percentage' ? (
                                    <>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={settings.withdrawalFee}
                                            onChange={(e) => handleChange('withdrawalFee', parseFloat(e.target.value))}
                                            className="pr-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                                            %
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                            ₺
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={settings.withdrawalFee}
                                            onChange={(e) => handleChange('withdrawalFee', parseFloat(e.target.value))}
                                            className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Fee charged for each withdrawal transaction
                            </p>
                        </div>
                    </div>
                </div>

                {/* Task Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Settings className="h-5 w-5 text-purple-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Task Settings</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Enable Moderation
                                </label>
                                <p className="text-xs text-gray-500 mt-1">
                                    Require admin approval for all new tasks
                                </p>
                            </div>
                            <button
                                onClick={() => handleChange('moderationEnabled', !settings.moderationEnabled)}
                                className={cn(
                                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                                    settings.moderationEnabled ? "bg-primary-600" : "bg-gray-200"
                                )}
                            >
                                <span
                                    className={cn(
                                        "pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                        settings.moderationEnabled ? "translate-x-5" : "translate-x-0"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
                                            settings.moderationEnabled ? "opacity-0 duration-100 ease-out" : "opacity-100 duration-200 ease-in"
                                        )}
                                    >
                                        <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                                            <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    <span
                                        className={cn(
                                            "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
                                            settings.moderationEnabled ? "opacity-100 duration-200 ease-in" : "opacity-0 duration-100 ease-out"
                                        )}
                                    >
                                        <svg className="h-3 w-3 text-primary-600" fill="currentColor" viewBox="0 0 12 12">
                                            <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-5.707a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                                        </svg>
                                    </span>
                                </span>
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Auto-Approve Tasks
                                </label>
                                <p className="text-xs text-gray-500 mt-1">
                                    Automatically approve tasks that meet criteria
                                </p>
                            </div>
                            <button
                                onClick={() => handleChange('autoApproveTasks', !settings.autoApproveTasks)}
                                className={cn(
                                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                                    settings.autoApproveTasks ? "bg-primary-600" : "bg-gray-200"
                                )}
                            >
                                <span
                                    className={cn(
                                        "pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                        settings.autoApproveTasks ? "translate-x-5" : "translate-x-0"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
                                            settings.autoApproveTasks ? "opacity-0 duration-100 ease-out" : "opacity-100 duration-200 ease-in"
                                        )}
                                    >
                                        <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                                            <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    <span
                                        className={cn(
                                            "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
                                            settings.autoApproveTasks ? "opacity-100 duration-200 ease-in" : "opacity-0 duration-100 ease-out"
                                        )}
                                    >
                                        <svg className="h-3 w-3 text-primary-600" fill="currentColor" viewBox="0 0 12 12">
                                            <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-5.707a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                                        </svg>
                                    </span>
                                </span>
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Task Expiration (Days)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="365"
                                value={settings.taskExpirationDays}
                                onChange={(e) => handleChange('taskExpirationDays', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Number of days before tasks expire automatically
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Concurrent Tasks Per User
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={settings.maxConcurrentTasksPerUser}
                                onChange={(e) => handleChange('maxConcurrentTasksPerUser', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Maximum number of active tasks a user can have
                            </p>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <Shield className="h-5 w-5 text-red-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Session Timeout (Minutes)
                            </label>
                            <input
                                type="number"
                                min="5"
                                max="1440"
                                defaultValue="30"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Time before user sessions expire automatically
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password Complexity
                            </label>
                            <select
                                defaultValue="medium"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="low">Low (6+ characters)</option>
                                <option value="medium">Medium (8+ characters, 1 number)</option>
                                <option value="high">High (10+ characters, mixed case, numbers, symbols)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Minimum requirements for user passwords
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Two-Factor Authentication
                                </label>
                                <p className="text-xs text-gray-500 mt-1">
                                    Require 2FA for admin accounts
                                </p>
                            </div>
                            <button
                                className={cn(
                                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                                    true ? "bg-primary-600" : "bg-gray-200"
                                )}
                            >
                                <span
                                    className={cn(
                                        "pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                        true ? "translate-x-5" : "translate-x-0"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
                                            true ? "opacity-0 duration-100 ease-out" : "opacity-100 duration-200 ease-in"
                                        )}
                                    >
                                        <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                                            <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    <span
                                        className={cn(
                                            "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
                                            true ? "opacity-100 duration-200 ease-in" : "opacity-0 duration-100 ease-out"
                                        )}
                                    >
                                        <svg className="h-3 w-3 text-primary-600" fill="currentColor" viewBox="0 0 12 12">
                                            <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-5.707a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                                        </svg>
                                    </span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SystemSettingsPage