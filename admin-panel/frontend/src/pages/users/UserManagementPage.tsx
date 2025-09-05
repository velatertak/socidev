import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'

interface User {
    id: string
    email: string
    username: string
    first_name: string
    last_name: string
    phone?: string
    is_active: boolean
    role: string
    user_mode: 'taskGiver' | 'taskDoer'
    balance: number
    created_at: string
    updated_at: string
    last_login_at?: string
    email_verified_at?: string
    _count: {
        orders: number
        tasks: number
        socialAccounts: number
    }
}

interface UserFilters {
    search: string
    userMode: string
    isActive: string
    page: number
    limit: number
}

const UserManagementPage: React.FC = () => {
    const queryClient = useQueryClient()
    const [filters, setFilters] = useState<UserFilters>({
        search: '',
        userMode: '',
        isActive: '',
        page: 1,
        limit: 20
    })
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)

    // Fetch users
    const { data: usersData, isLoading, error } = useQuery({
        queryKey: ['users', filters],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (filters.search) params.append('search', filters.search)
            if (filters.userMode) params.append('userMode', filters.userMode)
            if (filters.isActive) params.append('isActive', filters.isActive)
            params.append('page', filters.page.toString())
            params.append('limit', filters.limit.toString())

            const response = await api.get(`/admin/users?${params}`)
            return response.data.data
        }
    })

    // Delete user mutation
    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            await api.delete(`/admin/users/${userId}`)
        },
        onSuccess: () => {
            toast.success('User deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete user')
        }
    })

    // Create user mutation
    const createUserMutation = useMutation({
        mutationFn: async (userData: any) => {
            const response = await api.post('/admin/users', userData)
            return response.data.data
        },
        onSuccess: () => {
            toast.success('User created successfully')
            queryClient.invalidateQueries({ queryKey: ['users'] })
            setShowCreateModal(false)
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create user')
        }
    })

    // Update user mutation
    const updateUserMutation = useMutation({
        mutationFn: async ({ userId, data }: { userId: string; data: Partial<User> }) => {
            const response = await api.put(`/admin/users/${userId}`, data)
            return response.data.data
        },
        onSuccess: () => {
            toast.success('User updated successfully')
            queryClient.invalidateQueries({ queryKey: ['users'] })
            setShowEditModal(false)
            setSelectedUser(null)
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update user')
        }
    })

    const handleDeleteUser = (user: User) => {
        if (window.confirm(`Are you sure you want to delete user ${user.username}?`)) {
            deleteUserMutation.mutate(user.id)
        }
    }

    const handleEditUser = (user: User) => {
        setSelectedUser(user)
        setShowEditModal(true)
    }

    const handleCreateUser = (userData: any) => {
        createUserMutation.mutate(userData)
    }

    const handleUpdateUser = (data: Partial<User>) => {
        if (selectedUser) {
            updateUserMutation.mutate({ userId: selectedUser.id, data })
        }
    }

    const resetFilters = () => {
        setFilters({
            search: '',
            userMode: '',
            isActive: '',
            page: 1,
            limit: 20
        })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-800">
                    <h3 className="text-lg font-medium">Error loading users</h3>
                    <p className="mt-1">Please try again later.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600">Manage platform users, their roles, and permissions</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Create User
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                            placeholder="Search users..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                        <select
                            value={filters.userMode}
                            onChange={(e) => setFilters({ ...filters, userMode: e.target.value, page: 1 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Types</option>
                            <option value="taskGiver">Task Giver</option>
                            <option value="taskDoer">Task Doer</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filters.isActive}
                            onChange={(e) => setFilters({ ...filters, isActive: e.target.value, page: 1 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Balance
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Activity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {usersData?.users?.map((user: User) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.first_name} {user.last_name}
                                            </div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                            <div className="text-xs text-gray-400">@{user.username}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.user_mode === 'taskGiver'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-green-100 text-green-800'
                                            }`}>
                                            {user.user_mode === 'taskGiver' ? 'Task Giver' : 'Task Doer'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ${user.balance?.toFixed(2) || '0.00'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="text-xs">
                                            <div>Orders: {user._count?.orders || 0}</div>
                                            <div>Tasks: {user._count?.tasks || 0}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user)}
                                                className="text-red-600 hover:text-red-900"
                                                disabled={deleteUserMutation.isPending}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {usersData?.pagination && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                disabled={!usersData.pagination.hasPrev}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                disabled={!usersData.pagination.hasNext}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{((filters.page - 1) * filters.limit) + 1}</span> to{' '}
                                    <span className="font-medium">
                                        {Math.min(filters.page * filters.limit, usersData.pagination.total)}
                                    </span>{' '}
                                    of <span className="font-medium">{usersData.pagination.total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                        disabled={!usersData.pagination.hasPrev}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                        Page {filters.page} of {usersData.pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                        disabled={!usersData.pagination.hasNext}
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

            {/* Create User Modal */}
            {showCreateModal && (
                <CreateUserModal
                    onClose={() => setShowCreateModal(false)}
                    onSave={handleCreateUser}
                    isLoading={createUserMutation.isPending}
                />
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <EditUserModal
                    user={selectedUser}
                    onClose={() => {
                        setShowEditModal(false)
                        setSelectedUser(null)
                    }}
                    onSave={handleUpdateUser}
                    isLoading={updateUserMutation.isPending}
                />
            )}
        </div>
    )
}

// Create User Modal Component
interface CreateUserModalProps {
    onClose: () => void
    onSave: (data: any) => void
    isLoading: boolean
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onSave, isLoading }) => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        password: '',
        phone: '',
        userMode: 'taskDoer' as 'taskGiver' | 'taskDoer'
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username *</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name *</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password *</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                minLength={8}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">User Type</label>
                            <select
                                value={formData.userMode}
                                onChange={(e) => setFormData({ ...formData, userMode: e.target.value as 'taskGiver' | 'taskDoer' })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="taskDoer">Task Doer</option>
                                <option value="taskGiver">Task Giver</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

// Edit User Modal Component
interface EditUserModalProps {
    user: User
    onClose: () => void
    onSave: (data: Partial<User>) => void
    isLoading: boolean
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave, isLoading }) => {
    const [formData, setFormData] = useState({
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone || '',
        userMode: user.user_mode as 'taskGiver' | 'taskDoer',
        isActive: user.is_active
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">User Type</label>
                            <select
                                value={formData.userMode}
                                onChange={(e) => setFormData({ ...formData, userMode: e.target.value as 'taskGiver' | 'taskDoer' })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="taskGiver">Task Giver</option>
                                <option value="taskDoer">Task Doer</option>
                            </select>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                Active User
                            </label>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default UserManagementPage
