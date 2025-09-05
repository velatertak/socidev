import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank,
    Receipt,
    Filter,
    Search,
    Download,
    Eye
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '../../lib/utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { financialApi } from '../../lib/api/financial'
import toast from 'react-hot-toast'

interface LedgerEntry {
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

interface FinancialSummary {
    totalEscrow: number
    totalEarnings: number
    totalRevenue: number
    pendingTransactions: number
    completedTransactions: number
}

const FinancialLedgersPage = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'escrow' | 'earnings' | 'revenue'>('all')
    const [dateRange, setDateRange] = useState('30d')
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(20)

    // Get financial data
    const {
        data: financialData,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['financial-ledgers', activeTab, dateRange, searchTerm, currentPage],
        queryFn: () => financialApi.getLedgerData({
            type: activeTab === 'all' ? undefined : activeTab,
            range: dateRange,
            search: searchTerm || undefined,
            page: currentPage,
            limit: itemsPerPage
        }),
        refetchInterval: 60000, // Refetch every minute
        retry: 1,
        staleTime: 30000, // Consider data stale after 30 seconds
    })

    const handleRefresh = () => {
        refetch()
    }

    const handleExport = () => {
        toast.success('Ledger exported successfully')
        // In a real implementation, this would download a CSV report
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'escrow':
                return Wallet
            case 'earning':
                return PiggyBank
            case 'revenue':
                return Receipt
            default:
                return DollarSign
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'escrow':
                return 'bg-blue-100 text-blue-800'
            case 'earning':
                return 'bg-green-100 text-green-800'
            case 'revenue':
                return 'bg-purple-100 text-purple-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const ledgerEntries: LedgerEntry[] = financialData?.entries || []
    const summary: FinancialSummary = financialData?.summary || {
        totalEscrow: 0,
        totalEarnings: 0,
        totalRevenue: 0,
        pendingTransactions: 0,
        completedTransactions: 0
    }
    const totalPages = financialData?.pagination?.totalPages || 1

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Financial Ledgers</h1>
                    <p className="text-gray-600 mt-1">
                        Track all financial transactions across the platform
                    </p>
                </div>
                <div className="flex items-center space-x-3">
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
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total in Escrow</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {formatCurrency(summary.totalEscrow)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Wallet className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                            Funds reserved for active tasks
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Worker Earnings</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {formatCurrency(summary.totalEarnings)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                            <PiggyBank className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                            Credited to worker accounts
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Platform Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {formatCurrency(summary.totalRevenue)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Receipt className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                            40% platform fee from completed tasks
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending Transactions</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {summary.pendingTransactions}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                            Awaiting approval or processing
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search transactions..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-primary-200"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
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
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={activeTab}
                                onChange={(e) => {
                                    setActiveTab(e.target.value as any)
                                    setCurrentPage(1)
                                }}
                                className="pr-8 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-primary-200"
                            >
                                <option value="all">All Transactions</option>
                                <option value="escrow">Escrow</option>
                                <option value="earnings">Earnings</option>
                                <option value="revenue">Revenue</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => {
                            setActiveTab('all')
                            setCurrentPage(1)
                        }}
                        className={cn(
                            "py-2 px-1 border-b-2 font-medium text-sm",
                            activeTab === 'all'
                                ? "border-primary-500 text-primary-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        All Transactions
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('escrow')
                            setCurrentPage(1)
                        }}
                        className={cn(
                            "py-2 px-1 border-b-2 font-medium text-sm",
                            activeTab === 'escrow'
                                ? "border-primary-500 text-primary-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        Escrow
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('earnings')
                            setCurrentPage(1)
                        }}
                        className={cn(
                            "py-2 px-1 border-b-2 font-medium text-sm",
                            activeTab === 'earnings'
                                ? "border-primary-500 text-primary-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        Worker Earnings
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('revenue')
                            setCurrentPage(1)
                        }}
                        className={cn(
                            "py-2 px-1 border-b-2 font-medium text-sm",
                            activeTab === 'revenue'
                                ? "border-primary-500 text-primary-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        Platform Revenue
                    </button>
                </nav>
            </div>

            {/* Ledger Entries Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : error ? (
                    <div className="p-12 text-center">
                        <div className="flex justify-center mb-4">
                            <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
                        <p className="text-gray-500 mb-6">
                            There was an error loading the financial ledger data.
                        </p>
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            Try Again
                        </button>
                    </div>
                ) : ledgerEntries.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Transaction
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {ledgerEntries.map((entry) => {
                                        const Icon = getTypeIcon(entry.type)
                                        return (
                                            <tr key={entry.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {entry.description}
                                                    </div>
                                                    {entry.taskId && (
                                                        <div className="text-sm text-gray-500">
                                                            Task ID: {entry.taskId.substring(0, 8)}...
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(entry.type)}`}>
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <div className="ml-2">
                                                            <div className="text-sm font-medium text-gray-900 capitalize">
                                                                {entry.type}
                                                            </div>
                                                            {entry.direction === 'in' ? (
                                                                <TrendingUp className="h-3 w-3 text-green-500 inline mr-1" />
                                                            ) : (
                                                                <TrendingDown className="h-3 w-3 text-red-500 inline mr-1" />
                                                            )}
                                                            <span className="text-xs text-gray-500 capitalize">
                                                                {entry.direction}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`text-sm font-medium ${entry.direction === 'in' ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {entry.direction === 'in' ? '+' : '-'}{formatCurrency(entry.amount)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(entry.processedAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                                                        {entry.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button className="text-primary-600 hover:text-primary-900">
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                            <span className="font-medium">
                                                {Math.min(currentPage * itemsPerPage, financialData?.pagination?.total || 0)}
                                            </span>{' '}
                                            of <span className="font-medium">{financialData?.pagination?.total || 0}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                            >
                                                <span className="sr-only">Previous</span>
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() => setCurrentPage(i + 1)}
                                                    className={cn(
                                                        "relative inline-flex items-center px-4 py-2 text-sm font-semibold",
                                                        currentPage === i + 1
                                                            ? "z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                                                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                                                    )}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                            >
                                                <span className="sr-only">Next</span>
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="p-12 text-center">
                        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                        <p className="text-gray-500">
                            There are no financial transactions matching your current filters.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default FinancialLedgersPage