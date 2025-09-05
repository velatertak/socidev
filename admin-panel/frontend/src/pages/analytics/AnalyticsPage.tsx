import { useState, useMemo } from 'react'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    ShoppingCart,
    CheckSquare,
    Calendar,
    Download,
    RefreshCw,
    Filter,
    Eye
} from 'lucide-react'
import { cn, formatCurrency, formatRelativeTime } from '../../lib/utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

// Mock analytics data
const mockAnalyticsData = {
    overview: {
        totalRevenue: 45250.75,
        totalOrders: 1248,
        totalUsers: 892,
        totalTasks: 3456,
        revenueGrowth: 12.5,
        orderGrowth: 8.3,
        userGrowth: 15.2,
        taskGrowth: 6.8
    },
    revenueByMonth: [
        { month: 'Jan', revenue: 3500, orders: 120 },
        { month: 'Feb', revenue: 4200, orders: 145 },
        { month: 'Mar', revenue: 3800, orders: 135 },
        { month: 'Apr', revenue: 5100, orders: 168 },
        { month: 'May', revenue: 4900, orders: 162 },
        { month: 'Jun', revenue: 5800, orders: 195 },
        { month: 'Jul', revenue: 6200, orders: 208 },
        { month: 'Aug', revenue: 5900, orders: 198 },
        { month: 'Sep', revenue: 6500, orders: 220 },
        { month: 'Oct', revenue: 7100, orders: 235 },
        { month: 'Nov', revenue: 6800, orders: 228 },
        { month: 'Dec', revenue: 7400, orders: 242 }
    ],
    platformBreakdown: [
        { platform: 'YouTube', orders: 456, revenue: 18420.50, percentage: 40.7 },
        { platform: 'Instagram', orders: 398, revenue: 15890.25, percentage: 35.1 },
        { platform: 'Twitter', orders: 234, revenue: 7685.75, percentage: 17.0 },
        { platform: 'Facebook', orders: 160, revenue: 3254.25, percentage: 7.2 }
    ],
    topUsers: [
        { id: '1', name: 'John Doe', email: 'john.doe@example.com', orders: 45, spent: 2850.75 },
        { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', orders: 38, spent: 2340.50 },
        { id: '3', name: 'Mike Wilson', email: 'mike.wilson@example.com', orders: 32, spent: 1980.25 },
        { id: '4', name: 'Sarah Johnson', email: 'sarah.johnson@example.com', orders: 28, spent: 1750.00 },
        { id: '5', name: 'David Brown', email: 'david.brown@example.com', orders: 25, spent: 1625.50 }
    ],
    recentActivity: [
        { type: 'order', description: 'New order placed by John Doe', amount: 125.50, time: '2024-01-15T14:30:00Z' },
        { type: 'user', description: 'New user registration: Jane Smith', amount: 0, time: '2024-01-15T13:45:00Z' },
        { type: 'task', description: 'Task completed by Mike Wilson', amount: 15.75, time: '2024-01-15T13:20:00Z' },
        { type: 'order', description: 'Order completed for Sarah Johnson', amount: 89.25, time: '2024-01-15T12:55:00Z' },
        { type: 'task', description: 'Task approved for David Brown', amount: 22.50, time: '2024-01-15T12:30:00Z' }
    ]
}

const AnalyticsPage = () => {
    const [loading, setLoading] = useState(false)
    const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
    const [selectedMetric, setSelectedMetric] = useState('revenue')

    const { overview, revenueByMonth, platformBreakdown, topUsers, recentActivity } = mockAnalyticsData

    const refreshData = async () => {
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setLoading(false)
    }

    const exportReport = () => {
        const csvContent = [
            'Metric,Value,Growth',
            `Total Revenue,${overview.totalRevenue},${overview.revenueGrowth}%`,
            `Total Orders,${overview.totalOrders},${overview.orderGrowth}%`,
            `Total Users,${overview.totalUsers},${overview.userGrowth}%`,
            `Total Tasks,${overview.totalTasks},${overview.taskGrowth}%`,
            '',
            'Platform,Orders,Revenue,Percentage',
            ...platformBreakdown.map(p => `${p.platform},${p.orders},${p.revenue},${p.percentage}%`)
        ].join('\\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    // Simple chart component placeholder
    const SimpleChart = ({ data, title, color }: { data: any[], title: string, color: string }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <div className="space-y-3">
                {data.slice(0, 6).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.month || item.platform}</span>
                        <div className="flex items-center space-x-2">
                            <div
                                className={`h-2 rounded-full ${color}`}
                                style={{ width: `${(item.revenue || item.orders) / Math.max(...data.map(d => d.revenue || d.orders)) * 100}px` }}
                            ></div>
                            <span className="text-sm font-medium text-gray-900">
                                {typeof (item.revenue || item.orders) === 'number' ?
                                    item.revenue ? formatCurrency(item.revenue) : item.orders :
                                    item.revenue || item.orders
                                }
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="h-7 w-7 text-primary-600" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Comprehensive insights and reports for your platform
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedTimeRange}
                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                        className="block px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
                    >
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="1y">Last Year</option>
                    </select>
                    <button
                        onClick={refreshData}
                        disabled={loading}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                        Refresh
                    </button>
                    <button
                        onClick={exportReport}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.totalRevenue)}</p>
                            <div className="flex items-center mt-2">
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-sm font-medium text-green-600">+{overview.revenueGrowth}%</span>
                                <span className="text-sm text-gray-500 ml-1">vs last period</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{overview.totalOrders.toLocaleString()}</p>
                            <div className="flex items-center mt-2">
                                <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                                <span className="text-sm font-medium text-blue-600">+{overview.orderGrowth}%</span>
                                <span className="text-sm text-gray-500 ml-1">vs last period</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{overview.totalUsers.toLocaleString()}</p>
                            <div className="flex items-center mt-2">
                                <TrendingUp className="h-4 w-4 text-purple-500 mr-1" />
                                <span className="text-sm font-medium text-purple-600">+{overview.userGrowth}%</span>
                                <span className="text-sm text-gray-500 ml-1">vs last period</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                            <p className="text-2xl font-bold text-gray-900">{overview.totalTasks.toLocaleString()}</p>
                            <div className="flex items-center mt-2">
                                <TrendingUp className="h-4 w-4 text-orange-500 mr-1" />
                                <span className="text-sm font-medium text-orange-600">+{overview.taskGrowth}%</span>
                                <span className="text-sm text-gray-500 ml-1">vs last period</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                            <CheckSquare className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SimpleChart
                    data={revenueByMonth}
                    title="Revenue by Month"
                    color="bg-blue-500"
                />
                <SimpleChart
                    data={platformBreakdown}
                    title="Revenue by Platform"
                    color="bg-green-500"
                />
            </div>

            {/* Platform Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Platform
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Orders
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Revenue
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Share
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {platformBreakdown.map((platform) => (
                                <tr key={platform.platform}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {platform.platform}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {platform.orders.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatCurrency(platform.revenue)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                                <div
                                                    className="bg-primary-600 h-2 rounded-full"
                                                    style={{ width: `${platform.percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {platform.percentage}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Users */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
                    <div className="space-y-4">
                        {topUsers.map((user, index) => (
                            <div key={user.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-xs font-medium text-white">
                                            #{index + 1}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {user.orders} orders
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                    {formatCurrency(user.spent)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-start justify-between">
                                <div className="flex items-start">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                                        activity.type === 'order' ? 'bg-blue-50' :
                                            activity.type === 'user' ? 'bg-green-50' : 'bg-orange-50'
                                    )}>
                                        {activity.type === 'order' ?
                                            <ShoppingCart className="h-4 w-4 text-blue-600" /> :
                                            activity.type === 'user' ?
                                                <Users className="h-4 w-4 text-green-600" /> :
                                                <CheckSquare className="h-4 w-4 text-orange-600" />
                                        }
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {activity.description}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatRelativeTime(activity.time)}
                                        </div>
                                    </div>
                                </div>
                                {activity.amount > 0 && (
                                    <div className="text-sm font-medium text-green-600">
                                        +{formatCurrency(activity.amount)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnalyticsPage