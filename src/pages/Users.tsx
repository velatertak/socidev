import React, { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, MoreHorizontal, UserCheck, UserX, Shield, Plus } from 'lucide-react';
import { User, FilterParams, Order, Transaction, WithdrawalRequest, SocialAccount, Task, Device } from '../types';
import { usersAPI, ordersAPI } from '../services/api';
import { useAppDispatch } from '../store';
import { addNotification } from '../store/slices/notificationSlice';
import { usePermissions } from '../hooks/usePermissions';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { cn } from '../utils/cn';

const Users: React.FC = () => {
  const dispatch = useAppDispatch();
  const { canAccess } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    pageCount: 0,
  });

  // User detail tabs
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for user details
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [userWithdrawals, setUserWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [userSocialAccounts, setUserSocialAccounts] = useState<SocialAccount[]>([]);
  const [userDevices, setUserDevices] = useState<Device[]>([]);
  const [userTasks, setUserTasks] = useState<Task[]>([]);

  // New state for add user form
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    role: 'readonly' as 'admin' | 'manager' | 'moderator' | 'readonly',
    status: 'active' as 'active' | 'suspended' | 'banned' | 'pending',
    balance: 0,
  });

  // New state for edit user form
  const [editUser, setEditUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    role: 'readonly' as 'admin' | 'manager' | 'moderator' | 'readonly',
    status: 'active' as 'active' | 'suspended' | 'banned' | 'pending',
    balance: 0,
  });

  const fetchUsers = async (params: FilterParams = {}) => {
    try {
      setLoading(true);
      const response = await usersAPI.getUsers({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...params,
      });
      setUsers(response.data);
      setPagination(prev => ({
        ...prev,
        pageCount: response.pagination.totalPages,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch users',
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.pageIndex, pagination.pageSize]);

  // Fetch user details when a user is selected
  useEffect(() => {
    if (selectedUser) {
      // Mock data for user details
      setUserOrders([
        {
          id: 'order-1',
          userId: selectedUser.id,
          userName: `${selectedUser.firstName} ${selectedUser.lastName}`,
          amount: 50.00,
          status: 'completed',
          paymentMethod: 'credit_card',
          platform: 'instagram',
          service: 'followers',
          targetUrl: 'https://instagram.com/example',
          quantity: 1000,
          completed: 1000,
          createdAt: '2023-06-15T10:30:00Z',
          updatedAt: '2023-06-15T11:45:00Z',
        },
        {
          id: 'order-2',
          userId: selectedUser.id,
          userName: `${selectedUser.firstName} ${selectedUser.lastName}`,
          amount: 25.00,
          status: 'processing',
          paymentMethod: 'paypal',
          platform: 'youtube',
          service: 'views',
          targetUrl: 'https://youtube.com/watch?v=example',
          quantity: 5000,
          completed: 3500,
          createdAt: '2023-06-16T14:20:00Z',
          updatedAt: '2023-06-16T15:30:00Z',
        },
      ]);

      setUserTransactions([
        {
          id: 'txn-1',
          userId: selectedUser.id,
          userName: `${selectedUser.firstName} ${selectedUser.lastName}`,
          type: 'deposit',
          amount: 100.00,
          status: 'completed',
          description: 'Initial deposit',
          createdAt: '2023-06-10T09:15:00Z',
        },
        {
          id: 'txn-2',
          userId: selectedUser.id,
          userName: `${selectedUser.firstName} ${selectedUser.lastName}`,
          type: 'order',
          amount: -50.00,
          status: 'completed',
          description: 'Order #order-1',
          createdAt: '2023-06-15T11:45:00Z',
        },
        {
          id: 'txn-3',
          userId: selectedUser.id,
          userName: `${selectedUser.firstName} ${selectedUser.lastName}`,
          type: 'order',
          amount: -25.00,
          status: 'completed',
          description: 'Order #order-2',
          createdAt: '2023-06-16T15:30:00Z',
        },
      ]);

      setUserWithdrawals([
        {
          id: 'withdrawal-1',
          userId: selectedUser.id,
          userName: `${selectedUser.firstName} ${selectedUser.lastName}`,
          amount: 50.00,
          method: {
            id: 'paypal-1',
            name: 'PayPal',
            type: 'paypal',
            isActive: true,
            minAmount: 10,
            maxAmount: 10000,
            processingTime: '1-3 business days',
          },
          status: 'approved',
          requestedAt: '2023-06-12T14:30:00Z',
          processedAt: '2023-06-13T10:15:00Z',
          processedBy: 'Admin',
        },
      ]);

      setUserSocialAccounts([
        {
          id: 'social-1',
          userId: selectedUser.id,
          platform: 'instagram',
          username: 'example_user',
          status: 'active',
          followers: 15000,
          lastActivity: '2023-06-16T16:00:00Z',
          healthScore: 95,
          errors: [],
        },
        {
          id: 'social-2',
          userId: selectedUser.id,
          platform: 'youtube',
          username: 'example_channel',
          status: 'active',
          followers: 5000,
          lastActivity: '2023-06-16T15:30:00Z',
          healthScore: 88,
          errors: [],
        },
      ]);

      setUserDevices([
        {
          id: 'device-1',
          name: 'iPhone 12',
          type: 'mobile',
          status: 'online',
          userId: selectedUser.id,
          lastSeen: '2023-06-16T16:00:00Z',
          version: '1.2.3',
          location: 'New York, USA',
          usage: {
            tasksCompleted: 1250,
            uptime: 95,
            quotaUsed: 850,
            quotaLimit: 1000,
          },
          configuration: {
            autoUpdate: true,
            maxConcurrentTasks: 5,
            workingHours: {
              start: '09:00',
              end: '17:00',
            },
          },
        },
      ]);

      setUserTasks([
        {
          id: 'task-1',
          title: 'Instagram Followers',
          description: 'Deliver 1000 followers to @example_user',
          type: 'follow',
          status: 'completed',
          createdBy: 'Admin',
          priority: 'high',
          createdAt: '2023-06-15T10:00:00Z',
          updatedAt: '2023-06-15T11:45:00Z',
          analytics: {
            totalAssigned: 1000,
            completed: 1000,
            failed: 0,
            averageCompletionTime: 120,
            successRate: 100,
          },
        },
        {
          id: 'task-2',
          title: 'YouTube Views',
          description: 'Deliver 5000 views to example video',
          type: 'view',
          status: 'active',
          assignedTo: selectedUser.id,
          createdBy: 'Admin',
          priority: 'medium',
          createdAt: '2023-06-16T14:00:00Z',
          updatedAt: '2023-06-16T15:30:00Z',
          analytics: {
            totalAssigned: 5000,
            completed: 3500,
            failed: 50,
            averageCompletionTime: 180,
            successRate: 98,
          },
        },
      ]);
    }
  }, [selectedUser]);

  const handleUserAction = async (userId: string, action: 'activate' | 'suspend' | 'ban') => {
    try {
      const statusMap = {
        activate: 'active',
        suspend: 'suspended',
        ban: 'banned',
      };

      await usersAPI.updateUser(userId, { status: statusMap[action] as any });

      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: `User ${action}d successfully`,
      }));

      fetchUsers();
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: `Failed to ${action} user`,
      }));
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setActiveTab('overview');
    setShowUserModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      banned: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };

    return (
      <span className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusConfig[status as keyof typeof statusConfig]
      )}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      moderator: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      readonly: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };

    return (
      <span className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        roleConfig[role as keyof typeof roleConfig]
      )}>
        <Shield className="h-3 w-3 mr-1" />
        {role}
      </span>
    );
  };

  const getOrderStatusBadge = (status: string) => {
    const statusConfig = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };

    return (
      <span className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusConfig[status as keyof typeof statusConfig]
      )}>
        {status}
      </span>
    );
  };

  const getTransactionTypeBadge = (type: string) => {
    const typeConfig = {
      deposit: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      withdrawal: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      order: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      refund: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      adjustment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    };

    return (
      <span className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        typeConfig[type as keyof typeof typeConfig]
      )}>
        {type}
      </span>
    );
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'firstName',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {row.original.firstName[0]}{row.original.lastName[0]}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {row.original.firstName} {row.original.lastName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              @{row.original.username}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ getValue }) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {getValue() as string}
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ getValue }) => getRoleBadge(getValue() as string),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => getStatusBadge(getValue() as string),
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ getValue }) => (
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          ${(getValue() as number).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ getValue }) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(getValue() as string).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewUser(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {canAccess('users', 'edit') && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUserAction(row.original.id, 'activate')}
                disabled={row.original.status === 'active'}
              >
                <UserCheck className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUserAction(row.original.id, 'suspend')}
                disabled={row.original.status === 'suspended'}
              >
                <UserX className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Handle add user form changes
  const handleAddUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: name === 'balance' ? Number(value) : value
    }));
  };

  // Handle edit user form changes
  const handleEditUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditUser(prev => ({
      ...prev,
      [name]: name === 'balance' ? Number(value) : value
    }));
  };

  // Handle add user form submission
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create a new user object
      const userToAdd = {
        ...newUser,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: [],
      };

      // In a real app, you would call an API to add the user
      // For now, we'll just add it to the local state
      setUsers(prev => [userToAdd as User, ...prev]);

      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'User added successfully',
      }));

      // Reset form and close modal
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        role: 'readonly',
        status: 'active',
        balance: 0,
      });
      setShowAddUserModal(false);
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add user',
      }));
    }
  };

  // Handle edit user form submission
  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      // Update user
      const updatedUser = await usersAPI.updateUser(selectedUser.id, editUser);

      // Update local state
      setUsers(prev =>
        prev.map(user => user.id === selectedUser.id ? updatedUser : user)
      );

      // If we're editing the currently selected user, update that too
      if (selectedUser.id === selectedUser?.id) {
        setSelectedUser(updatedUser);
      }

      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'User updated successfully',
      }));

      // Close modal
      setShowEditUserModal(false);
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update user',
      }));
    }
  };

  // Open edit user modal with user data
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
      balance: user.balance,
    });
    setShowUserModal(false);
    setShowEditUserModal(true);
  };

  // Tab content components
  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Personal Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Full Name</span>
              <span className="text-gray-900 dark:text-white">{selectedUser?.firstName} {selectedUser?.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Username</span>
              <span className="text-gray-900 dark:text-white">@{selectedUser?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Email</span>
              <span className="text-gray-900 dark:text-white">{selectedUser?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Role</span>
              <span className="text-gray-900 dark:text-white">{selectedUser?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status</span>
              <span className="text-gray-900 dark:text-white">{selectedUser?.status}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Account Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Account Balance</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${selectedUser?.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Joined Date</span>
              <span className="text-gray-900 dark:text-white">
                {selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Login</span>
              <span className="text-gray-900 dark:text-white">
                {selectedUser?.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Recent Activity</h3>
        <div className="space-y-3">
          {userTransactions.slice(0, 5).map(transaction => (
            <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{transaction.description}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(transaction.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                </div>
                {getTransactionTypeBadge(transaction.type)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Platform</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {userOrders.map(order => (
            <tr key={order.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                #{order.id.substring(0, 8)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {order.service}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <span className="capitalize">{order.platform}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                ${order.amount.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getOrderStatusBadge(order.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderBalanceHistoryTab = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaction ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {userTransactions.map(transaction => (
            <tr key={transaction.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                #{transaction.id.substring(0, 8)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {transaction.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getTransactionTypeBadge(transaction.type)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {new Date(transaction.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {transaction.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderWithdrawalsTab = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Request ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requested</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Processed</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {userWithdrawals.map(withdrawal => (
            <tr key={withdrawal.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                #{withdrawal.id.substring(0, 8)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                ${withdrawal.amount.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {withdrawal.method.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${withdrawal.status === 'approved'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : withdrawal.status === 'rejected'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                  {withdrawal.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {new Date(withdrawal.requestedAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {withdrawal.processedAt ? new Date(withdrawal.processedAt).toLocaleDateString() : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSocialMediaTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {userSocialAccounts.map(account => (
        <div key={account.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${account.platform === 'instagram' ? 'bg-pink-500' : 'bg-red-500'
                }`}>
                <span className="text-white font-bold">{account.platform.charAt(0).toUpperCase()}</span>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">{account.username}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{account.platform}</p>
              </div>
            </div>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${account.status === 'active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
              {account.status}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Followers</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{account.followers.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Health Score</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{account.healthScore}%</p>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Last activity: {new Date(account.lastActivity).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );

  const renderDevicesTab = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Device</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Seen</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tasks Completed</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {userDevices.map(device => (
            <tr key={device.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {device.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                {device.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${device.status === 'online'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                  {device.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {new Date(device.lastSeen).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {device.usage.tasksCompleted}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTasksTab = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Success Rate</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {userTasks.map(task => (
            <tr key={task.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{task.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                {task.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${task.status === 'completed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : task.status === 'active'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                  {task.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${task.priority === 'high'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                  {task.priority}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {task.analytics && (
                  <div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {task.analytics.completed}/{task.analytics.totalAssigned}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(task.analytics.completed / task.analytics.totalAssigned) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {task.analytics?.successRate}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Orders</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{userOrders.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Spent</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${userTransactions
                .filter(t => t.type === 'order')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                .toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Success Rate</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {userTasks.length > 0
                ? Math.round(userTasks.reduce((sum, t) => sum + (t.analytics?.successRate || 0), 0) / userTasks.length)
                : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Users Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        {canAccess('users', 'edit') && (
          <Button onClick={() => setShowAddUserModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        )}
      </div>

      <DataTable
        data={users}
        columns={columns}
        searchPlaceholder="Search users..."
        loading={loading}
        onRowClick={handleViewUser}
        pagination={{
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          pageCount: pagination.pageCount,
          onPaginationChange: setPagination,
        }}
      />

      {/* User Detail Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="User Details"
        size="xl"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-xl font-medium text-white">
                  {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  @{selectedUser.username}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  {getRoleBadge(selectedUser.role)}
                  {getStatusBadge(selectedUser.status)}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', name: 'Overview' },
                  { id: 'orders', name: 'Orders' },
                  { id: 'balance', name: 'Balance History' },
                  { id: 'withdrawals', name: 'Withdrawals' },
                  { id: 'social', name: 'Social Media' },
                  { id: 'devices', name: 'Devices' },
                  { id: 'tasks', name: 'Tasks' },
                  { id: 'analytics', name: 'Analytics' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    )}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="py-4">
              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'orders' && renderOrdersTab()}
              {activeTab === 'balance' && renderBalanceHistoryTab()}
              {activeTab === 'withdrawals' && renderWithdrawalsTab()}
              {activeTab === 'social' && renderSocialMediaTab()}
              {activeTab === 'devices' && renderDevicesTab()}
              {activeTab === 'tasks' && renderTasksTab()}
              {activeTab === 'analytics' && renderAnalyticsTab()}
            </div>

            {canAccess('users', 'edit') && (
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => handleEditUser(selectedUser)}>
                  Edit User
                </Button>
                <Button variant="danger">
                  Suspend User
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title="Add New User"
        size="lg"
      >
        <form onSubmit={handleAddUserSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={newUser.firstName}
                onChange={handleAddUserChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={newUser.lastName}
                onChange={handleAddUserChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={newUser.username}
                onChange={handleAddUserChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleAddUserChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                name="role"
                value={newUser.role}
                onChange={handleAddUserChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="moderator">Moderator</option>
                <option value="readonly">Read Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={newUser.status}
                onChange={handleAddUserChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Balance
              </label>
              <input
                type="number"
                name="balance"
                value={newUser.balance}
                onChange={handleAddUserChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddUserModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Add User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditUserModal}
        onClose={() => setShowEditUserModal(false)}
        title="Edit User"
        size="lg"
      >
        <form onSubmit={handleEditUserSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={editUser.firstName}
                onChange={handleEditUserChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={editUser.lastName}
                onChange={handleEditUserChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={editUser.username}
                onChange={handleEditUserChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={editUser.email}
                onChange={handleEditUserChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                name="role"
                value={editUser.role}
                onChange={handleEditUserChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="moderator">Moderator</option>
                <option value="readonly">Read Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={editUser.status}
                onChange={handleEditUserChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Balance
              </label>
              <input
                type="number"
                name="balance"
                value={editUser.balance}
                onChange={handleEditUserChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditUserModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;