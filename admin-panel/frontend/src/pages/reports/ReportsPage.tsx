import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Download, RefreshCw, Calendar, Filter } from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import api from '../../lib/api'

// Types
interface ReportData {
    id: string
    title: string
    type: 'user' | 'order' | 'revenue' | 'task'
    generatedAt: string
    data: any
}

interface UserGrowthData {
    date: string
    newUsers: number
    totalUsers: number
}

interface RevenueData {
    month: string
    revenue: number
    orders: number
}

interface PlatformDistribution {
    platform: string
    count: number
    revenue: number
}

// Mock data for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

// API functions
const reportApi = {
    getUserGrowthData: async (): Promise<UserGrowthData[]> => {
        // In a real implementation, this would fetch from the backend
        return [
            { date: '2024-01', newUsers: 120, totalUsers: 1200 },
            { date: '2024-02', newUsers: 180, totalUsers: 1380 },
            { date: '2024-03', newUsers: 150, totalUsers: 1530 },
            { date: '2024-04', newUsers: 220, totalUsers: 1750 },
            { date: '2024-05', newUsers: 190, totalUsers: 1940 },
            { date: '2024-06', newUsers: 250, totalUsers: 2190 },
        ]
    },

    getRevenueData: async (): Promise<RevenueData[]> => {
        // In a real implementation, this would fetch from the backend
        return [
            { month: 'Jan', revenue: 12500, orders: 120 },
            { month: 'Feb', revenue: 18900, orders: 180 },
            { month: 'Mar', revenue: 15600, orders: 150 },
            { month: 'Apr', revenue: 22300, orders: 220 },
            { month: 'May', revenue: 19800, orders: 190 },
            { month: 'Jun', revenue: 25400, orders: 250 },
        ]
    },

    getPlatformDistribution: async (): Promise<PlatformDistribution[]> => {
        // In a real implementation, this would fetch from the backend
        return [
            { platform: 'YouTube', count: 450, revenue: 12500 },
            { platform: 'Instagram', count: 620, revenue: 18900 },
            { platform: 'TikTok', count: 380, revenue: 15600 },
            { platform: 'Twitter', count: 290, revenue: 8900 },
            { platform: 'Facebook', count: 520, revenue: 19800 },
        ]
    },

    generateReport: async (type: string): Promise<ReportData> => {
        // In a real implementation, this would call the backend to generate a report
        return {
            id: Math.random().toString(36).substr(2, 9),
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
            type: type as any,
            generatedAt: new Date().toISOString(),
            data: {}
        }
    }
}

const ReportsPage = () => {
    const [selectedReport, setSelectedReport] = useState<string>('user-growth')
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
        start: '2024-01-01',
        end: '2024-06-30'
    })

    // Fetch data based on selected report
    const { data: userGrowthData, isLoading: userGrowthLoading, refetch: refetchUserGrowth } = useQuery({
        queryKey: ['userGrowthData'],
        queryFn: reportApi.getUserGrowthData,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    const { data: revenueData, isLoading: revenueLoading, refetch: refetchRevenue } = useQuery({
        queryKey: ['revenueData'],
        queryFn: reportApi.getRevenueData,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    const { data: platformData, isLoading: platformLoading, refetch: refetchPlatform } = useQuery({
        queryKey: ['platformData'],
        queryFn: reportApi.getPlatformDistribution,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    // Handle report generation
    const handleGenerateReport = async (type: string) => {
        try {
            const report = await reportApi.generateReport(type)
            console.log('Generated report:', report)
            // In a real implementation, you would save or display the report
        } catch (error) {
            console.error('Error generating report:', error)
        }
    }

    // Handle export
    const handleExport = () => {
        // In a real implementation, this would export the current report data
        console.log('Exporting report data...')
    }

    // Render the appropriate chart based on selected report
    const renderChart = () => {
        switch (selectedReport) {
            case 'user-growth':
                if (userGrowthLoading) return <LoadingSpinner />
                return (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="newUsers" fill="#8884d8" name="New Users" />
                                <Bar dataKey="totalUsers" fill="#82ca9d" name="Total Users" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )

            case 'revenue':
                if (revenueLoading) return <LoadingSpinner />
                return (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                                <Bar yAxisId="right" dataKey="orders" fill="#82ca9d" name="Orders" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )

            case 'platform-distribution':
                if (platformLoading) return <LoadingSpinner />
                return (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Distribution</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-md font-medium text-gray-700 mb-2">By User Count</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={platformData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                            nameKey="platform"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {platformData?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div>
                                <h4 className="text-md font-medium text-gray-700 mb-2">By Revenue</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={platformData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="revenue"
                                            nameKey="platform"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {platformData?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )

            default:
                return (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Select a Report Type</h3>
                        <p className="text-gray-500">Please select a report type from the dropdown above to view the data.</p>
                    </div>
                )
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Generate and view detailed reports about your platform's performance
                    </p>
                </div>
                <div className="mt-4 flex space-x-3 md:mt-0">
                    <button
                        type="button"
                        onClick={() => {
                            refetchUserGrowth()
                            refetchRevenue()
                            refetchPlatform()
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Data
                    </button>
                    <button
                        type="button"
                        onClick={handleExport}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 mb-1">
                            Report Type
                        </label>
                        <select
                            id="report-type"
                            value={selectedReport}
                            onChange={(e) => setSelectedReport(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        >
                            <option value="user-growth">User Growth</option>
                            <option value="revenue">Revenue Overview</option>
                            <option value="platform-distribution">Platform Distribution</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                id="start-date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            />
                            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                id="end-date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            />
                            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        type="button"
                        onClick={() => handleGenerateReport(selectedReport)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Chart */}
            {renderChart()}

            {/* Report History */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reports</h3>
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                    Report
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Type
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Generated
                                </th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            <tr>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                    June 2024 Analytics
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    Analytics
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    2024-06-30
                                </td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <button className="text-primary-600 hover:text-primary-900">
                                        View
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                    User Growth Report
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    Users
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    2024-06-15
                                </td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <button className="text-primary-600 hover:text-primary-900">
                                        View
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                    Revenue Summary
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    Revenue
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    2024-06-01
                                </td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <button className="text-primary-600 hover:text-primary-900">
                                        View
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ReportsPage