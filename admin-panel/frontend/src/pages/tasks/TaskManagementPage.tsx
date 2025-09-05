import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    CheckCircle,
    Clock,
    XCircle,
    Search,
    Filter,
    Eye,
    Check,
    X,
    AlertCircle,
    RefreshCw,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import { cn, formatCurrency, formatRelativeTime } from '../../lib/utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { taskApi, Task } from '../../lib/api/tasks'
import toast from 'react-hot-toast'

interface TaskDetailModalProps {
    isOpen: boolean
    onClose: () => void
    task: Task | null
}

const TaskDetailModal = ({ isOpen, onClose, task }: TaskDetailModalProps) => {
    if (!isOpen || !task) return null

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            Task Details
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                {task.description || 'No description provided'}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Platform:</span>
                                    <span className="ml-2 text-gray-900">{task.platform}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Type:</span>
                                    <span className="ml-2 text-gray-900">{task.type}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Quantity:</span>
                                    <span className="ml-2 text-gray-900">{task.quantity}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Remaining:</span>
                                    <span className="ml-2 text-gray-900">{task.remainingQuantity}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Budget:</span>
                                    <span className="ml-2 text-gray-900">{formatCurrency(task.budgetTotal / 100)}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Unit Payout:</span>
                                    <span className="ml-2 text-gray-900">{formatCurrency(task.unitPayoutMinor / 100)}</span>
                                </div>
                            </div>

                            <div className="mt-3">
                                <span className="font-medium text-gray-700">Target URL:</span>
                                <a
                                    href={task.targetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    {task.targetUrl}
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Creator Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Name:</span>
                                    <span className="ml-2 text-gray-900">{task.user.firstName} {task.user.lastName}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Username:</span>
                                    <span className="ml-2 text-gray-900">{task.user.username}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Email:</span>
                                    <span className="ml-2 text-gray-900">{task.user.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Status Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Task Status:</span>
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${task.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {task.status}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Admin Status:</span>
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${task.adminStatus === 'approved' ? 'bg-green-100 text-green-800' : task.adminStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {task.adminStatus}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Created:</span>
                                    <span className="ml-2 text-gray-900">{new Date(task.createdAt).toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Updated:</span>
                                    <span className="ml-2 text-gray-900">{new Date(task.updatedAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {task.instructions && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
                                <p className="text-sm text-gray-600">{task.instructions}</p>
                            </div>
                        )}

                        {task.proofRequired && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Proof Requirements</h4>
                                <p className="text-sm text-gray-600">{task.proofInstructions || 'Proof is required for this task'}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface ApprovalModalProps {
    isOpen: boolean
    onClose: () => void
    task: Task | null
    actionType: 'approve' | 'reject'
    onApprove: (id: string, notes?: string) => void
    onReject: (id: string, reason: string, notes?: string) => void
    isApproving: boolean
    isRejecting: boolean
}

const ApprovalModal = ({ isOpen, onClose, task, actionType, onApprove, onReject, isApproving, isRejecting }: ApprovalModalProps) => {
    const [notes, setNotes] = useState('')
    const [reason, setReason] = useState('')

    useEffect(() => {
        if (!isOpen) {
            setNotes('')
            setReason('')
        }
    }, [isOpen])

    if (!isOpen || !task) return null

    const handleSubmit = () => {
        if (actionType === 'approve') {
            onApprove(task.id, notes)
        } else {
            if (!reason.trim()) {
                toast.error('Rejection reason is required')
                return
            }
            onReject(task.id, reason, notes)
        }
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            {actionType === 'approve' ? 'Approve Task' : 'Reject Task'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                        <p className="text-sm text-gray-600">
                            {task.description || 'No description available'}
                        </p>
                        <a
                            href={task.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2"
                        >
                            {task.targetUrl}
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    {actionType === 'reject' && (
                        <div className="mb-4">
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason *
                            </label>
                            <select
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">Select a reason</option>
                                <option value="Inappropriate content">Inappropriate content</option>
                                <option value="Invalid target">Invalid target</option>
                                <option value="Insufficient details">Insufficient details</option>
                                <option value="Duplicate task">Duplicate task</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    )}

                    <div className="mb-6">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                            {actionType === 'approve' ? 'Approval Notes' : 'Additional Notes'} (Optional)
                        </label>
                        <textarea
                            id="notes"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={actionType === 'approve'
                                ? "Add any notes for the task creator..."
                                : "Add any additional notes..."}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    <div className="flex items-center justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isApproving || isRejecting || (actionType === 'reject' && !reason.trim())}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-medium text-white",
                                actionType === 'approve'
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-red-600 hover:bg-red-700",
                                (isApproving || isRejecting || (actionType === 'reject' && !reason.trim())) && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {isApproving || isRejecting ? (
                                <div className="flex items-center">
                                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                                    {actionType === 'approve' ? 'Approving...' : 'Rejecting...'}
                                </div>
                            ) : (
                                actionType === 'approve' ? 'Approve Task' : 'Reject Task'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const TaskManagementPage = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedPlatform, setSelectedPlatform] = useState('ALL')
    const [selectedType, setSelectedType] = useState('ALL')
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [showTaskDetailModal, setShowTaskDetailModal] = useState(false)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [showApprovalModal, setShowApprovalModal] = useState(false)
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')

    const queryClient = useQueryClient()

    // Get tasks based on filters
    const {
        data: tasksResponse,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['admin-tasks', {
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
            platform: selectedPlatform === 'ALL' ? undefined : selectedPlatform,
            type: selectedType === 'ALL' ? undefined : selectedType,
            adminStatus: activeTab === 'all' ? undefined : activeTab,
            sortBy,
            sortOrder
        }],
        queryFn: () => taskApi.getAllTasks({
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm || undefined,
            platform: selectedPlatform === 'ALL' ? undefined : selectedPlatform,
            type: selectedType === 'ALL' ? undefined : selectedType,
            adminStatus: activeTab === 'all' ? undefined : activeTab,
            sortBy,
            sortOrder
        }),
        refetchInterval: 30000,
        retry: 1,
        staleTime: 10000,
    })

    // Mutations for task actions
    const approveTaskMutation = useMutation({
        mutationFn: ({ id, notes }: { id: string; notes?: string }) => taskApi.approveTask(id, notes),
        onSuccess: () => {
            toast.success('Task approved successfully')
            queryClient.invalidateQueries({ queryKey: ['admin-tasks'] })
            setShowApprovalModal(false)
            setSelectedTask(null)
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to approve task')
        }
    })

    const rejectTaskMutation = useMutation({
        mutationFn: ({ id, reason, notes }: { id: string; reason: string; notes?: string }) =>
            taskApi.rejectTask(id, reason, notes),
        onSuccess: () => {
            toast.success('Task rejected successfully')
            queryClient.invalidateQueries({ queryKey: ['admin-tasks'] })
            setShowApprovalModal(false)
            setSelectedTask(null)
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to reject task')
        }
    })

    const handleRefresh = () => {
        refetch()
    }

    const handleViewDetails = (task: Task) => {
        setSelectedTask(task)
        setShowTaskDetailModal(true)
    }

    const handleApprove = (task: Task) => {
        setSelectedTask(task)
        setActionType('approve')
        setShowApprovalModal(true)
    }

    const handleReject = (task: Task) => {
        setSelectedTask(task)
        setActionType('reject')
        setShowApprovalModal(true)
    }

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('desc')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
            case 'pending_admin_review':
                return 'bg-yellow-100 text-yellow-800'
            case 'approved':
                return 'bg-green-100 text-green-800'
            case 'rejected':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'instagram':
                return '📷'
            case 'youtube':
                return '📺'
            case 'tiktok':
                return '🎵'
            case 'twitter':
                return '🐦'
            case 'facebook':
                return '👥'
            default:
                return '📱'
        }
    }

    const tasks = tasksResponse?.tasks || []
    const totalPages = tasksResponse?.pagination?.totalPages || 1

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
                    <p className="text-gray-600 mt-1">
                        Manage and review tasks created by users
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                    Refresh
                </button>
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
                        All Tasks ({tasksResponse?.pagination?.total || 0})
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('pending')
                            setCurrentPage(1)
                        }}
                        className={cn(
                            "py-2 px-1 border-b-2 font-medium text-sm",
                            activeTab === 'pending'
                                ? "border-primary-500 text-primary-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        Pending ({tasks.filter(t => t.adminStatus === 'pending').length || 0})
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('approved')
                            setCurrentPage(1)
                        }}
                        className={cn(
                            "py-2 px-1 border-b-2 font-medium text-sm",
                            activeTab === 'approved'
                                ? "border-primary-500 text-primary-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        Approved ({tasks.filter(t => t.adminStatus === 'approved').length || 0})
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('rejected')
                            setCurrentPage(1)
                        }}
                        className={cn(
                            "py-2 px-1 border-b-2 font-medium text-sm",
                            activeTab === 'rejected'
                                ? "border-primary-500 text-primary-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        Rejected ({tasks.filter(t => t.adminStatus === 'rejected').length || 0})
                    </button>
                </nav>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search tasks..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-primary-200"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={selectedPlatform}
                                onChange={(e) => setSelectedPlatform(e.target.value)}
                                className="pr-8 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-primary-200"
                            >
                                <option value="ALL">All Platforms</option>
                                <option value="instagram">Instagram</option>
                                <option value="youtube">YouTube</option>
                                <option value="tiktok">TikTok</option>
                                <option value="twitter">Twitter</option>
                                <option value="facebook">Facebook</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="pr-8 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-primary-200"
                            >
                                <option value="ALL">All Types</option>
                                <option value="like">Like</option>
                                <option value="follow">Follow</option>
                                <option value="view">View</option>
                                <option value="subscribe">Subscribe</option>
                                <option value="comment">Comment</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Tasks</h3>
                        <p className="text-red-700 mb-4">
                            There was an error loading tasks. Please try again.
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                ) : tasks.length > 0 ? (
                    <>
                        {/* Table view for larger screens */}
                        <div className="hidden md:block overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSort('title')}
                                            >
                                                <div className="flex items-center">
                                                    Task
                                                    {sortBy === 'title' && (
                                                        sortOrder === 'asc' ?
                                                            <ChevronUp className="ml-1 h-4 w-4" /> :
                                                            <ChevronDown className="ml-1 h-4 w-4" />
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSort('platform')}
                                            >
                                                <div className="flex items-center">
                                                    Platform
                                                    {sortBy === 'platform' && (
                                                        sortOrder === 'asc' ?
                                                            <ChevronUp className="ml-1 h-4 w-4" /> :
                                                            <ChevronDown className="ml-1 h-4 w-4" />
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSort('type')}
                                            >
                                                <div className="flex items-center">
                                                    Type
                                                    {sortBy === 'type' && (
                                                        sortOrder === 'asc' ?
                                                            <ChevronUp className="ml-1 h-4 w-4" /> :
                                                            <ChevronDown className="ml-1 h-4 w-4" />
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSort('quantity')}
                                            >
                                                <div className="flex items-center">
                                                    Quantity
                                                    {sortBy === 'quantity' && (
                                                        sortOrder === 'asc' ?
                                                            <ChevronUp className="ml-1 h-4 w-4" /> :
                                                            <ChevronDown className="ml-1 h-4 w-4" />
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSort('budgetTotal')}
                                            >
                                                <div className="flex items-center">
                                                    Budget
                                                    {sortBy === 'budgetTotal' && (
                                                        sortOrder === 'asc' ?
                                                            <ChevronUp className="ml-1 h-4 w-4" /> :
                                                            <ChevronDown className="ml-1 h-4 w-4" />
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSort('adminStatus')}
                                            >
                                                <div className="flex items-center">
                                                    Status
                                                    {sortBy === 'adminStatus' && (
                                                        sortOrder === 'asc' ?
                                                            <ChevronUp className="ml-1 h-4 w-4" /> :
                                                            <ChevronDown className="ml-1 h-4 w-4" />
                                                    )}
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {tasks.map((task) => (
                                            <tr key={task.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            <span className="text-lg">{getPlatformIcon(task.platform)}</span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{task.title}</div>
                                                            <div className="text-sm text-gray-500 truncate max-w-xs">{task.description || 'No description'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 capitalize">{task.platform}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 capitalize">{task.type}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {task.quantity}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(task.budgetTotal / 100)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.adminStatus)}`}>
                                                        {task.adminStatus.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            onClick={() => handleViewDetails(task)}
                                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                            title="View details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        {task.adminStatus === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(task)}
                                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                                    title="Approve task"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(task)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                                    title="Reject task"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Card view for mobile */}
                        <div className="md:hidden space-y-4">
                            {tasks.map((task) => (
                                <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="text-lg">{getPlatformIcon(task.platform)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                        {task.title}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.adminStatus)}`}>
                                                        {task.adminStatus.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-2 truncate">
                                                    {task.description || 'No description'}
                                                </p>
                                                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                                    <span>{task.platform}</span>
                                                    <span>•</span>
                                                    <span>{task.type}</span>
                                                    <span>•</span>
                                                    <span>Qty: {task.quantity}</span>
                                                    <span>•</span>
                                                    <span>{formatCurrency(task.budgetTotal / 100)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleViewDetails(task)}
                                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                title="View details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            {task.adminStatus === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(task)}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                                                        title="Approve task"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(task)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                                        title="Reject task"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
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
                                                {Math.min(currentPage * itemsPerPage, tasksResponse?.pagination?.total || 0)}
                                            </span>{' '}
                                            of <span className="font-medium">{tasksResponse?.pagination?.total || 0}</span> results
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
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>
                                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                                const pageNum =
                                                    totalPages <= 5
                                                        ? i + 1
                                                        : currentPage <= 3
                                                            ? i + 1
                                                            : currentPage >= totalPages - 2
                                                                ? totalPages - 4 + i
                                                                : currentPage - 2 + i;

                                                if (pageNum > totalPages) return null;

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={cn(
                                                            "relative inline-flex items-center px-4 py-2 text-sm font-semibold",
                                                            currentPage === pageNum
                                                                ? "z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                                                                : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                                                        )}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                            >
                                                <span className="sr-only">Next</span>
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                        <p className="text-gray-500">
                            {activeTab === 'all'
                                ? 'No tasks match your current filters.'
                                : `No ${activeTab} tasks found.`}
                        </p>
                    </div>
                )}
            </div>

            {/* Task Detail Modal */}
            <TaskDetailModal
                isOpen={showTaskDetailModal}
                onClose={() => {
                    setShowTaskDetailModal(false)
                    setSelectedTask(null)
                }}
                task={selectedTask}
            />

            {/* Approval Modal */}
            <ApprovalModal
                isOpen={showApprovalModal}
                onClose={() => {
                    setShowApprovalModal(false)
                    setSelectedTask(null)
                }}
                task={selectedTask}
                actionType={actionType}
                onApprove={(id, notes) => {
                    approveTaskMutation.mutate({ id, notes })
                }}
                onReject={(id, reason, notes) => {
                    rejectTaskMutation.mutate({ id, reason, notes })
                }}
                isApproving={approveTaskMutation.isPending}
                isRejecting={rejectTaskMutation.isPending}
            />
        </div>
    )
}

export default TaskManagementPage