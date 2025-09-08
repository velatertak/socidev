import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { usePermissions } from '../hooks/usePermissions';
import Modal from '../components/ui/Modal';
import { usersAPI } from '../services/api';
import { User, Transaction } from '../types';
import toast from 'react-hot-toast';
import { Search, FileText } from 'lucide-react';

interface BalanceEntry {
    id: string;
    userId: string;
    userName: string;
    amount: number;
    type: 'deposit' | 'withdrawal' | 'adjustment';
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    description: string;
    notes?: string;
    createdAt: string;
    processedAt?: string;
    processedBy?: string;
}

const Balance: React.FC = () => {
    const { hasPermission } = usePermissions();
    const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<BalanceEntry | null>(null);
    const [selectedEntry, setSelectedEntry] = useState<BalanceEntry | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock data for balance entries
    const [balanceEntries, setBalanceEntries] = useState<BalanceEntry[]>([
        {
            id: '1',
            userId: 'user-1',
            userName: 'John Doe',
            amount: 500.00,
            type: 'deposit',
            status: 'completed',
            description: 'Initial deposit',
            notes: 'Welcome bonus for new user',
            createdAt: '2023-06-15',
        },
        {
            id: '2',
            userId: 'user-2',
            userName: 'Jane Smith',
            amount: -250.00,
            type: 'withdrawal',
            status: 'pending',
            description: 'Withdrawal request',
            notes: 'Requested via support ticket #12345',
            createdAt: '2023-06-14',
        },
        {
            id: '3',
            userId: 'user-3',
            userName: 'Bob Johnson',
            amount: 1000.00,
            type: 'deposit',
            status: 'pending',
            description: 'Balance request',
            notes: 'Manual verification required',
            createdAt: '2023-06-16',
        },
    ]);

    // State for add balance form
    const [newBalanceEntry, setNewBalanceEntry] = useState({
        userId: '',
        userName: '',
        amount: 0,
        type: 'deposit' as 'deposit' | 'withdrawal' | 'adjustment',
        description: '',
        notes: '',
    });

    // State for request action
    const [requestAction, setRequestAction] = useState<'approve' | 'reject'>('approve');
    const [requestNotes, setRequestNotes] = useState('');

    // Fetch users for the dropdown
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await usersAPI.getUsers({ limit: 100 });
                setUsers(response.data);
                setFilteredUsers(response.data);
            } catch (error) {
                console.error('Failed to fetch users:', error);
                toast.error('Failed to load users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Handle user search
    const handleUserSearch = (searchTerm: string) => {
        if (!searchTerm) {
            setFilteredUsers(users);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = users.filter(user =>
            user.firstName.toLowerCase().includes(term) ||
            user.lastName.toLowerCase().includes(term) ||
            user.username.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term)
        );

        setFilteredUsers(filtered);
    };

    // Handle add balance form changes
    const handleAddBalanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewBalanceEntry(prev => ({
            ...prev,
            [name]: name === 'amount' ? Number(value) : value
        }));
    };

    // Handle user selection in add balance form
    const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = e.target.value;
        const user = users.find(u => u.id === userId);
        if (user) {
            setNewBalanceEntry(prev => ({
                ...prev,
                userId: user.id,
                userName: `${user.firstName} ${user.lastName}`
            }));
        }
    };

    // Handle add balance form submission
    const handleAddBalanceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // In a real app, you would call an API to add the balance
            const newEntry: BalanceEntry = {
                ...newBalanceEntry,
                id: `entry-${Date.now()}`,
                status: newBalanceEntry.type === 'deposit' ? 'completed' : 'pending',
                createdAt: new Date().toISOString().split('T')[0],
            };

            setBalanceEntries(prev => [newEntry, ...prev]);

            // Update user balance in mock data
            if (newBalanceEntry.type === 'deposit') {
                const userIndex = users.findIndex(u => u.id === newBalanceEntry.userId);
                if (userIndex !== -1) {
                    const updatedUsers = [...users];
                    updatedUsers[userIndex] = {
                        ...updatedUsers[userIndex],
                        balance: updatedUsers[userIndex].balance + newBalanceEntry.amount
                    };
                    setUsers(updatedUsers);
                    setFilteredUsers(updatedUsers);
                }
            }

            toast.success('Balance entry added successfully');

            setNewBalanceEntry({
                userId: '',
                userName: '',
                amount: 0,
                type: 'deposit',
                description: '',
                notes: '',
            });
            setShowAddBalanceModal(false);
        } catch (error) {
            console.error('Failed to add balance entry:', error);
            toast.error('Failed to add balance entry');
        }
    };

    // Handle request action
    const handleRequestAction = (entry: BalanceEntry, action: 'approve' | 'reject') => {
        setSelectedRequest(entry);
        setRequestAction(action);
        setRequestNotes(entry.notes || '');
        setShowRequestModal(true);
    };

    // View notes for an entry
    const handleViewNotes = (entry: BalanceEntry) => {
        setSelectedEntry(entry);
        setShowNotesModal(true);
    };

    // Submit request action
    const submitRequestAction = async () => {
        if (!selectedRequest) return;

        try {
            setBalanceEntries(prev =>
                prev.map(entry =>
                    entry.id === selectedRequest.id
                        ? {
                            ...entry,
                            status: requestAction === 'approve' ? 'approved' : 'rejected',
                            processedAt: new Date().toISOString().split('T')[0],
                            processedBy: 'Admin',
                            notes: requestNotes
                        }
                        : entry
                )
            );

            // If approving a deposit request, update user balance
            if (requestAction === 'approve' && selectedRequest.type === 'deposit') {
                const userIndex = users.findIndex(u => u.id === selectedRequest.userId);
                if (userIndex !== -1) {
                    const updatedUsers = [...users];
                    updatedUsers[userIndex] = {
                        ...updatedUsers[userIndex],
                        balance: updatedUsers[userIndex].balance + selectedRequest.amount
                    };
                    setUsers(updatedUsers);
                    setFilteredUsers(updatedUsers);
                }
            }

            toast.success(`Balance request ${requestAction}d successfully`);
            setShowRequestModal(false);
            setSelectedRequest(null);
        } catch (error) {
            console.error('Failed to process request:', error);
            toast.error(`Failed to ${requestAction} request`);
        }
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        };

        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig[status as keyof typeof statusConfig]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    // Get user balance history
    const getUserBalanceHistory = (userId: string) => {
        return balanceEntries.filter(entry => entry.userId === userId);
    };

    return (
        <div className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Balance Management</h1>
                {hasPermission('users.edit') && (
                    <Button onClick={() => setShowAddBalanceModal(true)}>Add Balance Entry</Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Balance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Total Balance</h3>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">$24,560.00</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Pending</h3>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">$3,200.00</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">Reserved</h3>
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">$1,800.00</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Balance Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                                {balanceEntries.map((entry) => (
                                    <tr key={entry.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{entry.userName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <span className={entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                {entry.amount >= 0 ? '+' : ''}{entry.amount.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{entry.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {entry.notes ? (
                                                <button
                                                    onClick={() => handleViewNotes(entry)}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                                                >
                                                    <FileText className="h-4 w-4 mr-1" />
                                                    View
                                                </button>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{entry.createdAt}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(entry.status)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {entry.status === 'pending' && (
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRequestAction(entry, 'approve')}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleRequestAction(entry, 'reject')}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Add Balance Modal */}
            <Modal
                isOpen={showAddBalanceModal}
                onClose={() => setShowAddBalanceModal(false)}
                title="Add Balance Entry"
                size="lg"
            >
                <form onSubmit={handleAddBalanceSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                User
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    onChange={(e) => handleUserSearch(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <select
                                name="userId"
                                value={newBalanceEntry.userId}
                                onChange={handleUserSelect}
                                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            >
                                <option value="">Select a user</option>
                                {filteredUsers.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.firstName} {user.lastName} (@{user.username}) - ${user.balance.toFixed(2)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Amount
                            </label>
                            <input
                                type="number"
                                name="amount"
                                value={newBalanceEntry.amount}
                                onChange={handleAddBalanceChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Type
                            </label>
                            <select
                                name="type"
                                value={newBalanceEntry.type}
                                onChange={handleAddBalanceChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="deposit">Deposit</option>
                                <option value="withdrawal">Withdrawal</option>
                                <option value="adjustment">Adjustment</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={newBalanceEntry.description}
                                onChange={handleAddBalanceChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                rows={3}
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Notes
                            </label>
                            <textarea
                                name="notes"
                                value={newBalanceEntry.notes}
                                onChange={handleAddBalanceChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                rows={3}
                                placeholder="Add any additional notes..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddBalanceModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            Add Entry
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Request Action Modal */}
            <Modal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
                title={`${requestAction === 'approve' ? 'Approve' : 'Reject'} Balance Request`}
                size="md"
            >
                <div className="space-y-4">
                    {selectedRequest && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="font-medium">User:</div>
                                <div>{selectedRequest.userName}</div>
                                <div className="font-medium">Amount:</div>
                                <div className={selectedRequest.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {selectedRequest.amount >= 0 ? '+' : ''}{selectedRequest.amount.toFixed(2)}
                                </div>
                                <div className="font-medium">Type:</div>
                                <div>{selectedRequest.type.charAt(0).toUpperCase() + selectedRequest.type.slice(1)}</div>
                                <div className="font-medium">Description:</div>
                                <div>{selectedRequest.description}</div>
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notes
                        </label>
                        <textarea
                            value={requestNotes}
                            onChange={(e) => setRequestNotes(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            rows={3}
                            placeholder={`Reason for ${requestAction === 'approve' ? 'approval' : 'rejection'}...`}
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowRequestModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={requestAction === 'approve' ? 'default' : 'danger'}
                            onClick={submitRequestAction}
                        >
                            {requestAction === 'approve' ? 'Approve Request' : 'Reject Request'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Notes Modal */}
            <Modal
                isOpen={showNotesModal}
                onClose={() => setShowNotesModal(false)}
                title="Entry Notes"
                size="md"
            >
                <div className="space-y-4">
                    {selectedEntry && (
                        <div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="font-medium">User:</div>
                                    <div>{selectedEntry.userName}</div>
                                    <div className="font-medium">Amount:</div>
                                    <div className={selectedEntry.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        {selectedEntry.amount >= 0 ? '+' : ''}{selectedEntry.amount.toFixed(2)}
                                    </div>
                                    <div className="font-medium">Type:</div>
                                    <div>{selectedEntry.type.charAt(0).toUpperCase() + selectedEntry.type.slice(1)}</div>
                                    <div className="font-medium">Description:</div>
                                    <div>{selectedEntry.description}</div>
                                    <div className="font-medium">Date:</div>
                                    <div>{selectedEntry.createdAt}</div>
                                    <div className="font-medium">Status:</div>
                                    <div>{getStatusBadge(selectedEntry.status)}</div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Notes
                                </label>
                                <div className="min-h-[100px] p-3 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600">
                                    {selectedEntry.notes || <span className="text-gray-400 italic">No notes available</span>}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowNotesModal(false)}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Balance;