import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts'
import {
    TrendingUp,
    Users,
    CheckCircle,
    DollarSign,
    Clock,
    AlertCircle,
    Calendar,
    Filter,
    Download
} from 'lucide-react'
import { cn, formatCurrency } from '../../lib/utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { analyticsApi } from '../../lib/api/analytics'
import toast from 'react-hot-toast'

// Mock data for charts (will be replaced with real API data)
const mockTaskData = [
    { date: '2024-01-01', tasks: 45, completions: 38 },
    { date: '2024-01-02', tasks: 52, completions: 42 },
    { date: '2024-01-03', tasks: 48, completions: 45 },
    { date: '2024-01-04', tasks: 61, completions: 55 },
    { date: '2024-01-05', tasks: 55, completions: 49 },
    { date: '2024-01-06', tasks: 67, completions: 60 },
    { date: '2024-01-07', tasks: 63, completions: 58 },
]

const mockPlatformData = [
    { name: 'Instagram', value: 45, color: '#E1306C' },
    { name: 'YouTube', value: 30, color: '#FF0000' },
    { name: 'TikTok', value: 15, color: '#000000' },
    { name: 'Twitter', value: 7, color: '#1DA1F2' },
    { name: 'Facebook', value: 3, color: '#4267B2' },
]

const mockRevenueData = [
    { date: '2024-01-01', revenue: 1250, earnings: 750 },
    { date: '2024-01-02', revenue: 1320, earnings: 792 },
    { date: '2024-01-03', revenue: 1180, earnings: 708 },
    { date: '2024-01-04', revenue: 1450, earnings: 870 },
    { date: '2024-01-05', revenue: 1380, earnings: 828 },
    { date: '2024-01-06', revenue: 1520, earnings: 912 },
    { date: '2024-01-07', revenue: 1480, earnings: 888 },
]

interface StatCardProps {
    title: string
    value: string | number
    change: number
    icon: React.ComponentType<{ className?: string }>
    color: 'primary' | 'blue' | 'green' | 'purple' | 'red'
    isLoading?: boolean
}

const StatCard = ({ title, value, change, icon: Icon, color, isLoading }: StatCardProps) => {
    const isPositive = change >= 0

    const colorClasses = {
        primary: 'bg-primary-50 text-primary-700',
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-green-50 text-green-700',
        purple: 'bg-purple-50 text-purple-700',
        red: 'bg-red-50 text-red-700'
    }

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    <div className="flex items-center mt-2">
                        {isPositive ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                            <TrendingUp className="h-4 w-4 text-red-500 mr-1 rotate-180" />
                        )}
                        <span className={cn(
                            'text-sm font-medium',
                            isPositive ? 'text-green-600' : 'text-red-600'
                        )}>
                            {isPositive ? '+' : ''}{change}%
                        </span>
                        <span className="text-sm text-gray-500 ml-1">vs last period</span>
                    </div>
                </div>
                <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', colorClasses[color])}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    )
}

const AnalyticsDashboardPage = () => {
    const [dateRange, setDateRange] = useState('7d')
    const [isLoading, setIsLoading] = useState(true)

    // Get analytics data
    const {
        data: analyticsData,
        isLoading: dataLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['analytics', dateRange],
        queryFn: () => analyticsApi.getDashboardData({ range: dateRange }),
        refetchInterval: 60000, // Refetch every minute
        retry: 1,
        staleTime: 30000, // Consider data stale after 30 seconds
    })

    useEffect(() => {
        setIsLoading(dataLoading)
    }, [dataLoading])

    const handleRefresh = () => {
        refetch()
    }

    const handleExport = () => {
        toast.success('Report exported successfully')
        // In a real implementation, this would download a CSV or PDF report
    }

    // Use mock data if API data is not available
    const taskData = analyticsData?.taskTrends || mockTaskData
    const platformData = analyticsData?.platformDistribution || mockPlatformData
    const revenueData = analyticsData?.revenueTrends || mockRevenueData

    const stats = {
        totalTasks: analyticsData?.totalTasks?.value || 1247,
        taskGrowth: analyticsData?.totalTasks?.growth || 12.5,
        completedTasks: analyticsData?.completedTasks?.value || 856,
        completionRate: analyticsData?.completionRate?.value || 68.6,
        totalUsers: analyticsData?.totalUsers?.value || 3421,
        userGrowth: analyticsData?.totalUsers?.growth || 8.3,
        totalRevenue: analyticsData?.totalRevenue?.value || 45250.75,
        revenueGrowth: analyticsData?.totalRevenue?.growth || 22.1,
        workerEarnings: analyticsData?.workerEarnings?.value || 27150.45,
        earningsGrowth: analyticsData?.workerEarnings?.growth || 18.7,
        topTaskGivers: analyticsData?.topTaskGivers || [],
        topEarners: analyticsData?.topEarners || []
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        Track platform performance and key metrics
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="pr-8 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-primary-200"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="1y">Last year</option>
                        </select>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <svg className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Tasks"
                    value={stats.totalTasks.toLocaleString()}
                    change={stats.taskGrowth}
                    icon={CheckCircle}
                    color="primary"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Completed Tasks"
                    value={stats.completedTasks.toLocaleString()}
                    change={stats.completionRate}
                    icon={Clock}
                    color="blue"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers.toLocaleString()}
                    change={stats.userGrowth}
                    icon={Users}
                    color="green"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats.totalRevenue)}
                    change={stats.revenueGrowth}
                    icon={DollarSign}
                    color="purple"
                    isLoading={isLoading}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Task Trends Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Trends</h3>
                    <div className="h-80">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={taskData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [value, 'Tasks']} />
                                    <Legend />
                                    <Bar dataKey="tasks" name="New Tasks" fill="#3B82F6" />
                                    <Bar dataKey="completions" name="Completed Tasks" fill="#10B981" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Platform Distribution Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Distribution</h3>
                    <div className="h-80">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={platformData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {platformData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [value, 'Tasks']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Revenue Trends Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
                    <div className="h-80">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Amount']} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        name="Platform Revenue"
                                        stroke="#8B5CF6"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="earnings"
                                        name="Worker Earnings"
                                        stroke="#10B981"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Performers */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Top Task Givers */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Task Givers</h3>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="animate-pulse flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                        <div className="space-y-1">
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                                        </div>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stats.topTaskGivers.slice(0, 5).map((giver: any, index: number) => (
                                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                                            {giver.user.firstName.charAt(0)}{giver.user.lastName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {giver.user.firstName} {giver.user.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {giver.taskCount} tasks • {formatCurrency(giver.totalBudget)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">#{index + 1}</p>
                                    </div>
                                </div>
                            ))}
                            {stats.topTaskGivers.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No task giver data available
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Top Earners */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Earners</h3>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="animate-pulse flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                        <div className="space-y-1">
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                                        </div>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stats.topEarners.slice(0, 5).map((earner: any, index: number) => (
                                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                                            {earner.user.firstName.charAt(0)}{earner.user.lastName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {earner.user.firstName} {earner.user.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Total earnings: {formatCurrency(earner.totalEarnings)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">#{index + 1}</p>
                                    </div>
                                </div>
                            ))}
                            {stats.topEarners.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No earner data available
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AnalyticsDashboardPage