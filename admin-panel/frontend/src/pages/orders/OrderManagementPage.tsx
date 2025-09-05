import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    ShoppingCart,
    Search,
    Plus,
    Edit,
    Eye,
    Download,
    RefreshCw,
    CheckCircle,
    Clock,
    XCircle,
    DollarSign,
    User,
    Check,
    X,
    AlertCircle,
    Filter,
    AlertTriangle
} from 'lucide-react'
import { cn, formatCurrency, formatRelativeTime } from '../../lib/utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { orderApi, Order } from '../../lib/api/orders'
import toast from 'react-hot-toast'

// Error Boundary Component
class OrderPageErrorBoundary extends React.Component<
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
        console.error('OrderManagementPage error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 text-center mb-4">There was an error loading the order management page.</p>
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

const OrderManagementPageContent = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('ALL')
    const [selectedPlatform, setSelectedPlatform] = useState('ALL')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [selectedOrders, setSelectedOrders] = useState<string[]>([])
    const [showApprovalModal, setShowApprovalModal] = useState(false)
    const [selectedOrderForAction, setSelectedOrderForAction] = useState<Order | null>(null)
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'status'>('approve')
    const [rejectionReason, setRejectionReason] = useState('')
    const [approvalNotes, setApprovalNotes] = useState('')
    const [newStatus, setNewStatus] = useState('')

    const navigate = useNavigate()
    const queryClient = useQueryClient()

    // Get orders with real API
    const {
        data: ordersResponse,
        isLoading: ordersLoading,
        error: ordersError,
        refetch: refetchOrders
    } = useQuery({
        queryKey: ['orders', {
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
            status: selectedStatus === 'ALL' ? undefined : selectedStatus,
            platform: selectedPlatform === 'ALL' ? undefined : selectedPlatform
        }],
        queryFn: () => orderApi.getOrders({
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm || undefined,
            status: selectedStatus === 'ALL' ? undefined : selectedStatus,
            platform: selectedPlatform === 'ALL' ? undefined : selectedPlatform,
            sortBy: 'createdAt',
            sortOrder: 'desc'
        }),
        refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
        retry: 1, // Retry once on failure
        retryDelay: 1000,
        staleTime: 10000, // Consider data stale after 10 seconds
    })

    // Get order statistics
    const {
        data: statisticsResponse,
        isLoading: statsLoading,
        error: statsError
    } = useQuery({
        queryKey: ['order-statistics'],
        queryFn: () => orderApi.getStatistics(),
        refetchInterval: 60000, // Refetch every minute
        retry: 1, // Retry once on failure
        retryDelay: 1000,
        staleTime: 30000, // Consider data stale after 30 seconds
    })

    // Handle authentication errors
    useEffect(() => {
        if (ordersError) {
            console.error('Failed to fetch orders:', ordersError)
            const errorResponse = ordersError as any
            if (errorResponse.response?.status === 401) {
                toast.error('Authentication failed. Please log in again.')
                navigate('/login')
            } else {
                toast.error('Failed to load orders. Please try again.')
            }
        }
    }, [ordersError, navigate])

    // Mutations for order actions
    const approveOrderMutation = useMutation({
        mutationFn: ({ id, notes }: { id: string; notes?: string }) => orderApi.approveOrder(id, notes),
        onSuccess: () => {
            toast.success('Order approved successfully')
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            queryClient.invalidateQueries({ queryKey: ['order-statistics'] })
            setShowApprovalModal(false)
            setSelectedOrderForAction(null)
            setApprovalNotes('')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to approve order')
        }
    })

    const rejectOrderMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => orderApi.rejectOrder(id, reason),
        onSuccess: () => {
            toast.success('Order rejected successfully')
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            queryClient.invalidateQueries({ queryKey: ['order-statistics'] })
            setShowApprovalModal(false)
            setSelectedOrderForAction(null)
            setRejectionReason('')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to reject order')
        }
    })

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
            orderApi.updateOrderStatus(id, { status, reason }),
        onSuccess: () => {
            toast.success('Order status updated successfully')
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            queryClient.invalidateQueries({ queryKey: ['order-statistics'] })
            setShowApprovalModal(false)
            setSelectedOrderForAction(null)
            setNewStatus('')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update order status')
        }
    })

    const bulkActionMutation = useMutation({
        mutationFn: (data: { orderIds: string[]; action: 'approve' | 'reject' | 'cancel'; reason?: string }) =>
            orderApi.bulkAction(data),
        onSuccess: (data) => {
            const successCount = data.data.results.filter(r => r.status !== 'error').length
            const errorCount = data.data.results.filter(r => r.status === 'error').length

            if (successCount > 0) {
                toast.success(`${successCount} orders processed successfully`)
            }
            if (errorCount > 0) {
                toast.error(`${errorCount} orders failed to process`)
            }

            queryClient.invalidateQueries({ queryKey: ['orders'] })
            queryClient.invalidateQueries({ queryKey: ['order-statistics'] })
            setSelectedOrders([])
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Bulk action failed')
        }
    })

    const orders = ordersResponse?.data?.orders || []
    const pagination = ordersResponse?.data?.pagination
    const statistics = statisticsResponse?.data

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, selectedStatus, selectedPlatform])

    // Statistics from API response
    const stats = useMemo(() => {
        if (!statistics) {
            return {
                totalOrders: 0,
                pendingOrders: 0,
                inProgressOrders: 0,
                completedOrders: 0,
                totalRevenue: 0
            }
        }

        // Handle case sensitivity in status keys - database returns lowercase values
        const pendingCount = statistics.ordersByStatus?.pending?.count ||
            statistics.ordersByStatus?.PENDING?.count || 0;
        const processingCount = statistics.ordersByStatus?.processing?.count ||
            statistics.ordersByStatus?.PROCESSING?.count || 0;
        const completedCount = statistics.ordersByStatus?.completed?.count ||
            statistics.ordersByStatus?.COMPLETED?.count || 0;
        const failedCount = statistics.ordersByStatus?.failed?.count ||
            statistics.ordersByStatus?.FAILED?.count || 0;

        return {
            totalOrders: Object.values(statistics.ordersByStatus || {}).reduce((sum: number, status: any) => sum + (status?.count || 0), 0),
            pendingOrders: pendingCount,
            inProgressOrders: processingCount,
            completedOrders: completedCount,
            totalRevenue: statistics.revenue?.total || 0
        }
    }, [statistics])

    const handleSelectOrder = (orderId: string) => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        )
    }

    const handleSelectAll = () => {
        if (selectedOrders.length === orders.length) {
            setSelectedOrders([])
        } else {
            setSelectedOrders(orders.map((order: any) => order.id))
        }
    }

    const handleOrderAction = (order: Order, action: 'approve' | 'reject' | 'status') => {
        setSelectedOrderForAction(order)
        setActionType(action)
        setShowApprovalModal(true)
    }

    const handleConfirmAction = () => {
        if (!selectedOrderForAction) return

        if (actionType === 'approve') {
            approveOrderMutation.mutate({
                id: selectedOrderForAction.id,
                notes: approvalNotes || undefined
            })
        } else if (actionType === 'reject') {
            if (!rejectionReason.trim()) {
                toast.error('Rejection reason is required')
                return
            }
            rejectOrderMutation.mutate({
                id: selectedOrderForAction.id,
                reason: rejectionReason
            })
        } else if (actionType === 'status') {
            if (!newStatus) {
                toast.error('Please select a status')
                return
            }
            updateStatusMutation.mutate({
                id: selectedOrderForAction.id,
                status: newStatus,
                reason: rejectionReason || undefined
            })
        }
    }

    const handleBulkAction = (action: 'approve' | 'reject') => {
        if (selectedOrders.length === 0) {
            toast.error('Please select orders first')
            return
        }

        // For simplicity, we'll assume all selected items are of the same type
        // All items are now orders (formerly tasks)
        if (action === 'reject') {
            const reason = prompt('Enter rejection reason:')
            if (!reason) return

            // All items are now orders (formerly tasks)
            // This is a simplified approach - all items are orders now
            bulkActionMutation.mutate({
                orderIds: selectedOrders,
                action: 'reject',
                reason
            })
        } else {
            bulkActionMutation.mutate({
                orderIds: selectedOrders,
                action: 'approve'
            })
        }
    }

    const refreshData = async () => {
        await refetchOrders()
        queryClient.invalidateQueries({ queryKey: ['order-statistics'] })
        toast.success('Data refreshed')
    }

    const exportData = () => {
        const csvContent = [
            'Order ID,Customer,Platform,Service,Quantity,Amount,Status,Created At',
            ...orders.map((order: any) =>
                `${order.id},"${order.user.firstName} ${order.user.lastName}",${order.platform},${order.service},${order.quantity},${order.amount},${order.status},${order.createdAt}`
            )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'processing': return 'bg-blue-100 text-blue-800'
            case 'completed': return 'bg-green-100 text-green-800'
            case 'failed': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return <Clock className="h-4 w-4" />
            case 'processing': return <RefreshCw className="h-4 w-4" />
            case 'completed': return <CheckCircle className="h-4 w-4" />
            case 'failed': return <XCircle className="h-4 w-4" />
            default: return <Clock className="h-4 w-4" />
        }
    }

    // Debug logging
    console.log('OrderManagementPage render:', {
        ordersLoading,
        ordersError: ordersError?.message,
        statsLoading,
        statsError: statsError?.message,
        ordersCount: orders.length,
        hasStatistics: !!statistics,
        ordersData: ordersResponse,
        statsData: statisticsResponse,
        selectedStatus,
        selectedPlatform
    })

    // Additional debug logging
    console.log('Orders array:', orders)
    console.log('First order:', orders[0])

    // Show loading state - moved to render section to avoid hook order issues
    // Early return for critical error states - moved to render section to avoid hook order issues

    return (
        <div className="space-y-6">
            {/* Show loading state */}
            {ordersLoading && !ordersResponse && (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <LoadingSpinner size="lg" />
                        <div className="mt-4 text-gray-600">Loading orders...</div>
                    </div>
                </div>
            )}

            {/* Show error if there's a critical error */}
            {ordersError && !ordersLoading && !ordersResponse && (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                    <XCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Orders</h2>
                    <p className="text-gray-600 text-center mb-4">
                        {(ordersError as any)?.response?.status === 401
                            ? 'Please log in to access this page.'
                            : 'There was a problem loading the orders. Please try again.'}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => refetchOrders()}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            <RefreshCw className="h-4 w-4 inline mr-2" />
                            Retry
                        </button>
                        {(ordersError as any)?.response?.status === 401 && (
                            <button
                                onClick={() => navigate('/login')}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Go to Login
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Show error if there's a critical error but data exists */}
            {ordersError && ordersResponse && (
                <div className="space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Error loading orders
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    {ordersError.message}
                                </div>
                                <div className="mt-3">
                                    <button
                                        onClick={() => refetchOrders()}
                                        className="bg-red-100 px-3 py-1 rounded text-red-800 hover:bg-red-200"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content - only render if we have data or are not in a critical error state */}
            {(!ordersError || ordersResponse) && (
                <>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <ShoppingCart className="h-7 w-7 text-primary-600" />
                                Order Management
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Monitor and manage all platform orders with real-time updates
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {selectedOrders.length > 0 && (
                                <div className="flex items-center gap-2 mr-4">
                                    <span className="text-sm text-gray-600">
                                        {selectedOrders.length} selected
                                    </span>
                                    <button
                                        onClick={() => handleBulkAction('approve')}
                                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                                    >
                                        <Check className="h-4 w-4 mr-1" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('reject')}
                                        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Reject
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={refreshData}
                                disabled={ordersLoading}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <RefreshCw className={cn("h-4 w-4 mr-2", ordersLoading && "animate-spin")} />
                                Refresh
                            </button>
                            <button
                                onClick={exportData}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </button>
                            <button
                                onClick={() => navigate('/orders/approvals')}
                                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                            >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Pending Approval ({stats.pendingOrders})
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-gray-600">Total Orders</div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {statsLoading ? <LoadingSpinner size="sm" /> : String(stats.totalOrders)}
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
                                    <div className="text-sm font-medium text-gray-600">Pending Approval</div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {statsLoading ? <LoadingSpinner size="sm" /> : stats.pendingOrders}
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-gray-600">In Progress</div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {statsLoading ? <LoadingSpinner size="sm" /> : stats.inProgressOrders}
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <RefreshCw className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-gray-600">Completed</div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {statsLoading ? <LoadingSpinner size="sm" /> : stats.completedOrders}
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-gray-600">Revenue</div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {statsLoading ? <LoadingSpinner size="sm" /> : formatCurrency(stats.totalRevenue)}
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search orders by ID, customer, or URL..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="block px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="pending">Pending Approval</option>
                                    <option value="processing">Processing</option>
                                    <option value="completed">Completed</option>
                                    <option value="failed">Failed</option>
                                </select>
                                <select
                                    value={selectedPlatform}
                                    onChange={(e) => setSelectedPlatform(e.target.value)}
                                    className="block px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
                                >
                                    <option value="ALL">All Platforms</option>
                                    <option value="INSTAGRAM">Instagram</option>
                                    <option value="YOUTUBE">YouTube</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.length > 0 && selectedOrders.length === orders.length}
                                                onChange={handleSelectAll}
                                                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                            />
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Service
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Progress
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {ordersLoading ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-4 text-center">
                                                <LoadingSpinner />
                                            </td>
                                        </tr>
                                    ) : ordersError ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-4 text-center text-red-500">
                                                Failed to load orders
                                            </td>
                                        </tr>
                                    ) : orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                                No orders found
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order: any) => (
                                            <tr key={order.id} className={cn(selectedOrders.includes(order.id) && 'bg-blue-50')}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedOrders.includes(order.id)}
                                                        onChange={() => handleSelectOrder(order.id)}
                                                        className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {order.id}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {formatRelativeTime(order.createdAt)}
                                                        </div>
                                                        {order.description && (
                                                            <div className="text-xs text-gray-400 mt-1 max-w-32 truncate">
                                                                {order.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                                                            <User className="h-4 w-4 text-white" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {order.user.firstName} {order.user.lastName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {order.user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {order.platform} {order.service}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Qty: {order.quantity.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(order.amount)}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {formatCurrency(order.amount / order.quantity)}/unit
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={cn(
                                                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1',
                                                        getStatusColor(order.status)
                                                    )}>
                                                        {getStatusIcon(order.status)}
                                                        {order.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {order.status === 'processing' ? (
                                                        <div className="w-full">
                                                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                                <span>{Math.round((order.startCount / order.quantity) * 100)}%</span>
                                                                <span>{order.quantity} total</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                                    style={{ width: `${(order.startCount / order.quantity) * 100}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">
                                                            {order.status === 'completed' ? '100%' : '-'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        {order.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleOrderAction(order, 'approve')}
                                                                    className="text-green-600 hover:text-green-900 transition-colors"
                                                                    title="Approve Order"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleOrderAction(order, 'reject')}
                                                                    className="text-red-600 hover:text-red-900 transition-colors"
                                                                    title="Reject Order"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => navigate(`/orders/${order.id}`)}
                                                            className="text-primary-600 hover:text-primary-900 transition-colors"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOrderAction(order, 'status')}
                                                            className="text-gray-600 hover:text-gray-900 transition-colors"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={!pagination.hasPrev}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                                        disabled={!pagination.hasNext}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                                            <span className="font-medium">
                                                {Math.min(pagination.page * pagination.limit, pagination.total)}
                                            </span>{' '}
                                            of <span className="font-medium">{pagination.total}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={!pagination.hasPrev}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Previous
                                            </button>

                                            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                                                const page = Math.max(1, Math.min(pagination.page - 2 + i, pagination.totalPages - 4 + i))
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={cn(
                                                            'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                                                            page === pagination.page
                                                                ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        )}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            })}

                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                                                disabled={!pagination.hasNext}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Action Modal */}
                    {showApprovalModal && selectedOrderForAction && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                                <div className="mt-3">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {actionType === 'approve' ? 'Approve Order' :
                                                actionType === 'reject' ? 'Reject Order' : 'Update Status'}
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setShowApprovalModal(false)
                                                setSelectedOrderForAction(null)
                                                setRejectionReason('')
                                                setApprovalNotes('')
                                                setNewStatus('')
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Order ID: <span className="font-medium">{selectedOrderForAction.id}</span></p>
                                        <p className="text-sm text-gray-600">Customer: <span className="font-medium">{selectedOrderForAction.user.firstName} {selectedOrderForAction.user.lastName}</span></p>
                                        <p className="text-sm text-gray-600">Amount: <span className="font-medium">{formatCurrency(selectedOrderForAction.amount)}</span></p>
                                        <p className="text-sm text-gray-600">Service: <span className="font-medium">{selectedOrderForAction.platform} {selectedOrderForAction.service}</span></p>
                                    </div>

                                    {actionType === 'approve' && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Approval Notes (Optional)
                                            </label>
                                            <textarea
                                                value={approvalNotes}
                                                onChange={(e) => setApprovalNotes(e.target.value)}
                                                rows={3}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                                                placeholder="Add any notes about this approval..."
                                            />
                                        </div>
                                    )}

                                    {actionType === 'reject' && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Rejection Reason *
                                            </label>
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                rows={3}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                                                placeholder="Please provide a reason for rejecting this order..."
                                                required
                                            />
                                        </div>
                                    )}

                                    {actionType === 'status' && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                New Status *
                                            </label>
                                            <select
                                                value={newStatus}
                                                onChange={(e) => setNewStatus(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                                                required
                                            >
                                                <option value="">Select status...</option>
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="completed">Completed</option>
                                                <option value="failed">Failed</option>
                                            </select>

                                            {(newStatus === 'failed') && (
                                                <div className="mt-3">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Reason
                                                    </label>
                                                    <textarea
                                                        value={rejectionReason}
                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                        rows={2}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                                                        placeholder="Reason for status change..."
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => {
                                                setShowApprovalModal(false)
                                                setSelectedOrderForAction(null)
                                                setRejectionReason('')
                                                setApprovalNotes('')
                                                setNewStatus('')
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirmAction}
                                            disabled={approveOrderMutation.isPending || rejectOrderMutation.isPending || updateStatusMutation.isPending}
                                            className={cn(
                                                'px-4 py-2 rounded-md text-sm font-medium text-white',
                                                actionType === 'approve'
                                                    ? 'bg-green-600 hover:bg-green-700'
                                                    : actionType === 'reject'
                                                        ? 'bg-red-600 hover:bg-red-700'
                                                        : 'bg-blue-600 hover:bg-blue-700',
                                                'disabled:opacity-50'
                                            )}
                                        >
                                            {(approveOrderMutation.isPending || rejectOrderMutation.isPending || updateStatusMutation.isPending) ? (
                                                <LoadingSpinner size="sm" />
                                            ) : (
                                                actionType === 'approve' ? 'Approve Order' :
                                                    actionType === 'reject' ? 'Reject Order' : 'Update Status'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

const OrderManagementPage = () => {
    return (
        <OrderPageErrorBoundary>
            <OrderManagementPageContent />
        </OrderPageErrorBoundary>
    )
}

export default OrderManagementPage