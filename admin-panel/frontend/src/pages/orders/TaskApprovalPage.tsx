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
    ExternalLink
} from 'lucide-react'
import { cn, formatCurrency, formatRelativeTime } from '../../lib/utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { taskApi, Task, TaskSubmission } from '../../lib/api/tasks'
import toast from 'react-hot-toast'

// Type guard functions
const isTask = (item: Task | TaskSubmission): item is Task => {
    return 'adminStatus' in item && !('task' in item)
}

const isTaskSubmission = (item: Task | TaskSubmission): item is TaskSubmission => {
    return 'task' in item && 'doer' in item
}

interface ApprovalModalProps {
    isOpen: boolean
    onClose: () => void
    task: Task | TaskSubmission | null
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

    // Get task title based on type
    const getTaskTitle = () => {
        if (isTask(task)) {
            return task.title || task.serviceType || 'Untitled Task'
        } else if (isTaskSubmission(task)) {
            return task.task.title || task.task.serviceType || 'Untitled Task'
        }
        return 'Task Submission'
    }

    // Get task description based on type
    const getTaskDescription = () => {
        if (isTask(task)) {
            return task.description || 'No description provided'
        } else if (isTaskSubmission(task)) {
            return task.task.description || 'No description provided'
        }
        return 'No description available'
    }

    // Get target URL based on type
    const getTargetUrl = () => {
        if (isTask(task)) {
            return task.targetUrl
        } else if (isTaskSubmission(task)) {
            return task.task.targetUrl
        }
        return null
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
                        <h4 className="font-medium text-gray-900 mb-2">{getTaskTitle()}</h4>
                        <p className="text-sm text-gray-600">
                            {getTaskDescription()}
                        </p>
                        {getTargetUrl() && (
                            <a
                                href={getTargetUrl()!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2"
                            >
                                {getTargetUrl()}
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
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

const TaskApprovalPage = () => {
    const [activeTab, setActiveTab] = useState<'tasks' | 'submissions'>('tasks')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedPlatform, setSelectedPlatform] = useState('ALL')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [showApprovalModal, setShowApprovalModal] = useState(false)
    const [selectedItemForAction, setSelectedItemForAction] = useState<Task | TaskSubmission | null>(null)
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')

    const queryClient = useQueryClient()

    // Get pending tasks
    const {
        data: tasksResponse,
        isLoading: tasksLoading,
        error: tasksError,
        refetch: refetchTasks
    } = useQuery({
        queryKey: ['pending-tasks', {
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
            platform: selectedPlatform === 'ALL' ? undefined : selectedPlatform,
            adminStatus: 'pending'
        }],
        queryFn: () => taskApi.getPendingTasks({
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm || undefined,
            platform: selectedPlatform === 'ALL' ? undefined : selectedPlatform
        }),
        refetchInterval: 30000,
        retry: 1,
        staleTime: 10000,
    })

    // Get pending submissions
    const {
        data: submissionsResponse,
        isLoading: submissionsLoading,
        error: submissionsError,
        refetch: refetchSubmissions
    } = useQuery({
        queryKey: ['pending-submissions', {
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
            status: 'submitted'
        }],
        queryFn: () => taskApi.getPendingSubmissions({
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm || undefined
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
            queryClient.invalidateQueries({ queryKey: ['pending-tasks'] })
            setShowApprovalModal(false)
            setSelectedItemForAction(null)
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
            queryClient.invalidateQueries({ queryKey: ['pending-tasks'] })
            setShowApprovalModal(false)
            setSelectedItemForAction(null)
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to reject task')
        }
    })

    // Mutations for submission actions
    const approveSubmissionMutation = useMutation({
        mutationFn: ({ id, notes }: { id: string; notes?: string }) => taskApi.approveSubmission(id, notes),
        onSuccess: () => {
            toast.success('Submission approved successfully')
            queryClient.invalidateQueries({ queryKey: ['pending-submissions'] })
            setShowApprovalModal(false)
            setSelectedItemForAction(null)
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to approve submission')
        }
    })

    const rejectSubmissionMutation = useMutation({
        mutationFn: ({ id, reason, notes }: { id: string; reason: string; notes?: string }) =>
            taskApi.rejectSubmission(id, reason, notes),
        onSuccess: () => {
            toast.success('Submission rejected successfully')
            queryClient.invalidateQueries({ queryKey: ['pending-submissions'] })
            setShowApprovalModal(false)
            setSelectedItemForAction(null)
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to reject submission')
        }
    })

    const handleRefresh = () => {
        if (activeTab === 'tasks') {
            refetchTasks()
        } else {
            refetchSubmissions()
        }
    }

    const handleApprove = (item: Task | TaskSubmission) => {
        setSelectedItemForAction(item)
        setActionType('approve')
        setShowApprovalModal(true)
    }

    const handleReject = (item: Task | TaskSubmission) => {
        setSelectedItemForAction(item)
        setActionType('reject')
        setShowApprovalModal(true)
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
            case 'pending_admin_review':
                return 'bg-yellow-100 text-yellow-800'
            case 'approved':
                return 'bg-green-100 text-green-800'
            case 'rejected':
                return 'bg-red-100 text-red-800'
            case 'submitted':
                return 'bg-blue-100 text-blue-800'
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
    const submissions = submissionsResponse?.submissions || []
    const totalPages = activeTab === 'tasks'
        ? tasksResponse?.pagination?.totalPages || 1
        : submissionsResponse?.pagination?.totalPages || 1

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Task Approvals</h1>
                    <p className="text-gray-600 mt-1">
                        Review and approve pending tasks and submissions
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={tasksLoading || submissionsLoading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={cn("h-4 w-4 mr-2", (tasksLoading || submissionsLoading) && "animate-spin")} />
                    Refresh
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => {
                            setActiveTab('tasks')
                            setCurrentPage(1)
                        }}
                        className={cn(
                            "py-2 px-1 border-b-2 font-medium text-sm",
                            activeTab === 'tasks'
                                ? "border-primary-500 text-primary-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        Pending Tasks ({tasksResponse?.pagination?.total || 0})
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('submissions')
                            setCurrentPage(1)
                        }}
                        className={cn(
                            "py-2 px-1 border-b-2 font-medium text-sm",
                            activeTab === 'submissions'
                                ? "border-primary-500 text-primary-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        Pending Submissions ({submissionsResponse?.pagination?.total || 0})
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
                    </div>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'tasks' ? (
                <div className="space-y-4">
                    {tasksLoading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : tasksError ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Tasks</h3>
                            <p className="text-red-700 mb-4">
                                There was an error loading pending tasks. Please try again.
                            </p>
                            <button
                                onClick={() => refetchTasks()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : tasks.length > 0 ? (
                        <>
                            {tasks.map((task) => (
                                <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <span className="text-lg">{getPlatformIcon(task.platform)}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {task.title || task.serviceType || 'Untitled Task'}
                                                    </h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.adminStatus || task.status)}`}>
                                                        <Clock className="w-3 h-3 inline mr-1" />
                                                        {(task.adminStatus || task.status).replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {task.description || 'No description provided'}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>Platform: {task.platform}</span>
                                                    <span>Type: {task.type || task.serviceType}</span>
                                                    <span>Quantity: {task.quantity}</span>
                                                    <span>Budget: {formatCurrency((task.budgetTotal || (task.reward * task.quantity)) / 100)}</span>
                                                </div>
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
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleApprove(task)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                title="Approve task"
                                            >
                                                <Check className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleReject(task)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Reject task"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // View task details
                                                }}
                                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                                title="View details"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

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
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending tasks</h3>
                            <p className="text-gray-500">All tasks have been reviewed. Check back later for new submissions.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {submissionsLoading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : submissionsError ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Submissions</h3>
                            <p className="text-red-700 mb-4">
                                There was an error loading pending submissions. Please try again.
                            </p>
                            <button
                                onClick={() => refetchSubmissions()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : submissions.length > 0 ? (
                        <>
                            {submissions.map((submission) => (
                                <div key={submission.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <span className="text-lg">{getPlatformIcon(submission.task.platform)}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {submission.task.title || submission.task.serviceType || 'Untitled Task'}
                                                    </h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                                                        <Clock className="w-3 h-3 inline mr-1" />
                                                        {submission.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Submitted by: {submission.doer.firstName} {submission.doer.lastName}
                                                </p>
                                                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                                    <p className="text-sm text-gray-800">
                                                        <strong>Proof:</strong> {submission.proofText || 'No text proof provided'}
                                                    </p>
                                                    {submission.proofUrls && submission.proofUrls.length > 0 && (
                                                        <div className="mt-2">
                                                            <p className="text-sm text-gray-700">Proof URLs:</p>
                                                            <ul className="list-disc list-inside text-sm text-blue-600">
                                                                {submission.proofUrls.map((url, idx) => (
                                                                    <li key={idx}>
                                                                        <a href={url} target="_blank" rel="noopener noreferrer">
                                                                            {url}
                                                                        </a>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>Platform: {submission.task.platform}</span>
                                                    <span>Type: {submission.task.type || submission.task.serviceType}</span>
                                                    <span>Payout: {formatCurrency(submission.payoutAmount / 100)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleApprove(submission)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                title="Approve submission"
                                            >
                                                <Check className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleReject(submission)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Reject submission"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // View submission details
                                                }}
                                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                                title="View details"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

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
                                                    {Math.min(currentPage * itemsPerPage, submissionsResponse?.pagination?.total || 0)}
                                                </span>{' '}
                                                of <span className="font-medium">{submissionsResponse?.pagination?.total || 0}</span> results
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
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending submissions</h3>
                            <p className="text-gray-500">All submissions have been reviewed. Check back later for new submissions.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Approval Modal */}
            <ApprovalModal
                isOpen={showApprovalModal}
                onClose={() => {
                    setShowApprovalModal(false)
                    setSelectedItemForAction(null)
                }}
                task={selectedItemForAction}
                actionType={actionType}
                onApprove={(id, notes) => {
                    if (activeTab === 'tasks') {
                        approveTaskMutation.mutate({ id, notes })
                    } else {
                        approveSubmissionMutation.mutate({ id, notes })
                    }
                }}
                onReject={(id, reason, notes) => {
                    if (activeTab === 'tasks') {
                        rejectTaskMutation.mutate({ id, reason, notes })
                    } else {
                        rejectSubmissionMutation.mutate({ id, reason, notes })
                    }
                }}
                isApproving={approveTaskMutation.isPending || approveSubmissionMutation.isPending}
                isRejecting={rejectTaskMutation.isPending || rejectSubmissionMutation.isPending}
            />
        </div>
    )
}

export default TaskApprovalPage