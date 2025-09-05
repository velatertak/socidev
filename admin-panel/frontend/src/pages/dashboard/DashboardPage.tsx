import { useState, useEffect } from 'react'
import {
    Users,
    ShoppingCart,
    CheckSquare,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Calendar,
    Activity,
    AlertCircle,
    RefreshCw
} from 'lucide-react'
import { cn } from '../../lib/utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { AdminSectionErrorBoundary } from '../../components/error/AdminErrorBoundary'
import toast from 'react-hot-toast'

// Mock data - will be replaced with real API calls
const mockStats = {
    totalUsers: 1247,
    userGrowth: 12.5,
    totalOrders: 856,
    orderGrowth: 8.3,
    totalTasks: 423,
    taskGrowth: 15.2,
    totalRevenue: 45250.75,
    revenueGrowth: 22.1
}

const mockRecentActivity = [
    {
        id: '1',
        type: 'user',
        message: 'New user registration: John Doe',
        status: 'success',
        timestamp: '2024-01-15T14:30:00Z'
    },
    {
        id: '2',
        type: 'order',
        message: 'Order #ORD-1247 completed successfully',
        status: 'success',
        timestamp: '2024-01-15T14:25:00Z'
    },
    {
        id: '3',
        type: 'task',
        message: 'Task review pending for order #ORD-1246',
        status: 'warning',
        timestamp: '2024-01-15T14:20:00Z'
    },
    {
        id: '4',
        type: 'system',
        message: 'Database backup completed',
        status: 'success',
        timestamp: '2024-01-15T14:15:00Z'
    }
]

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount)
}

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
}

interface StatCardProps {
    title: string
    value: number | string
    change: number
    icon: React.ComponentType<{ className?: string }>
    color: 'primary' | 'blue' | 'green' | 'purple'
    isLoading?: boolean
}

const StatCard = ({ title, value, change, icon: Icon, color, isLoading }: StatCardProps) => {
    const isPositive = change >= 0

    const colorClasses = {
        primary: 'bg-primary-50 text-primary-700',
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-green-50 text-green-700',
        purple: 'bg-purple-50 text-purple-700'
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
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {typeof value === 'number' ? formatNumber(value) : value}
                    </p>
                    <div className="flex items-center mt-2">
                        {isPositive ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={cn(
                            'text-sm font-medium',
                            isPositive ? 'text-green-600' : 'text-red-600'
                        )}>
                            {isPositive ? '+' : ''}{change}%
                        </span>
                        <span className="text-sm text-gray-500 ml-1">vs last month</span>
                    </div>
                </div>
                <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', colorClasses[color])}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    )
}

const ActivityItem = ({ activity }: { activity: typeof mockRecentActivity[0] }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'bg-green-100 text-green-800'
            case 'warning':
                return 'bg-yellow-100 text-yellow-800'
            case 'error':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-blue-100 text-blue-800'
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'user':
                return '👤'
            case 'order':
                return '🛒'
            case 'task':
                return '✅'
            case 'system':
                return '⚙️'
            default:
                return '📢'
        }
    }

    return (
        <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                {getTypeIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <div className="flex items-center mt-1 space-x-2">
                    <span className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        getStatusColor(activity.status)
                    )}>
                        {activity.status}
                    </span>
                    <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                </div>
            </div>
        </div>
    )
}

const DashboardPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState(mockStats)
    const [error, setError] = useState<string | null>(null)
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    useEffect(() => {
        // Simulate API call
        const fetchDashboardData = async () => {
            setIsLoading(true)
            setError(null)
            try {
                // Replace with actual API calls
                await new Promise(resolve => setTimeout(resolve, 1000))
                setStats(mockStats)
                // Only show toast message for manual refreshes, not initial load
                if (!isInitialLoad) {
                    toast.success('Dashboard data refreshed')
                }
                setIsInitialLoad(false)
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error)
                setError('Failed to load dashboard data. Please try again.')
                toast.error('Failed to load dashboard data')
                setIsInitialLoad(false)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    const handleRefresh = async () => {
        setIsLoading(true)
        setError(null)
        try {
            // Replace with actual API calls
            await new Promise(resolve => setTimeout(resolve, 1000))
            setStats(mockStats)
            toast.success('Dashboard data refreshed')
        } catch (error) {
            console.error('Failed to refresh dashboard data:', error)
            setError('Failed to refresh dashboard data. Please try again.')
            toast.error('Failed to refresh dashboard data')
        } finally {
            setIsLoading(false)
        }
    }

    if (error && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h2>
                <p className="text-gray-600 text-center mb-4">{error}</p>
                <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
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
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-600 mt-1">
                        Welcome back! Here's what's happening with your platform.
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
                    <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                        <Activity className="h-4 w-4 mr-2" />
                        View Reports
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    change={stats.userGrowth}
                    icon={Users}
                    color="primary"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    change={stats.orderGrowth}
                    icon={ShoppingCart}
                    color="blue"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Active Tasks"
                    value={stats.totalTasks}
                    change={stats.taskGrowth}
                    icon={CheckSquare}
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

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Chart Area - Placeholder */}
                <div className="lg:col-span-2">
                    <AdminSectionErrorBoundary sectionName="Revenue Overview">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
                                <div className="flex space-x-2">
                                    <button className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-full">
                                        7D
                                    </button>
                                    <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
                                        30D
                                    </button>
                                    <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
                                        90D
                                    </button>
                                </div>
                            </div>
                            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                <div className="text-center text-gray-500">
                                    <Activity className="h-8 w-8 mx-auto mb-2" />
                                    <p className="text-sm">Chart visualization will be added here</p>
                                    <p className="text-xs text-gray-400 mt-1">Using Recharts library</p>
                                </div>
                            </div>
                        </div>
                    </AdminSectionErrorBoundary>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-1">
                    <AdminSectionErrorBoundary sectionName="Recent Activity">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
                                    View all
                                </button>
                            </div>
                            <div className="space-y-1">
                                {mockRecentActivity.map((activity) => (
                                    <ActivityItem key={activity.id} activity={activity} />
                                ))}
                            </div>
                        </div>
                    </AdminSectionErrorBoundary>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all group">
                        <Users className="h-5 w-5 text-gray-400 group-hover:text-primary-600 mr-3" />
                        <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">Manage Users</p>
                            <p className="text-xs text-gray-500">View and edit user accounts</p>
                        </div>
                    </button>
                    <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all group">
                        <ShoppingCart className="h-5 w-5 text-gray-400 group-hover:text-primary-600 mr-3" />
                        <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">View Orders</p>
                            <p className="text-xs text-gray-500">Monitor order status</p>
                        </div>
                    </button>
                    <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all group">
                        <CheckSquare className="h-5 w-5 text-gray-400 group-hover:text-primary-600 mr-3" />
                        <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">Review Tasks</p>
                            <p className="text-xs text-gray-500">Approve pending tasks</p>
                        </div>
                    </button>
                    <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all group">
                        <Activity className="h-5 w-5 text-gray-400 group-hover:text-primary-600 mr-3" />
                        <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">Analytics</p>
                            <p className="text-xs text-gray-500">View detailed reports</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage