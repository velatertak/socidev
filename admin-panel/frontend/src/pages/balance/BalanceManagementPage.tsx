import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DollarSign, CheckCircle, XCircle, Clock, Search, Filter, Eye } from 'lucide-react';
import { financialApi } from '@/lib/api/financial';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Textarea';

interface Transaction {
    id: string;
    userId: string;
    type: 'deposit' | 'withdrawal' | 'order_payment' | 'task_earning';
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    method: string;
    details: Record<string, any>;
    reference?: string;
    createdAt: string;
    updatedAt: string;
    User?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        username: string;
        balance: number;
    };
}

interface BalanceRequestsResponse {
    transactions: Transaction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

const BalanceManagementPage = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [type, setType] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    const queryClient = useQueryClient();

    // Fetch balance requests
    const { data, isLoading, isError, error } = useQuery<BalanceRequestsResponse>({
        queryKey: ['balanceRequests', page, limit, type, status, search],
        queryFn: async () => {
            const params: Record<string, any> = {
                page,
                limit
            };

            if (type) params.type = type;
            if (status) params.status = status;
            if (search) params.search = search;

            const response = await fetch('/api/admin/balance/requests?' + new URLSearchParams(params));
            if (!response.ok) {
                throw new Error('Failed to fetch balance requests');
            }
            return response.json();
        }
    });

    // Handle approval
    const handleApprove = async () => {
        if (!selectedTransaction) return;

        try {
            const response = await fetch(`/api/admin/balance/requests/${selectedTransaction.id}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ adminNotes })
            });

            if (!response.ok) {
                throw new Error('Failed to approve transaction');
            }

            toast.success('Transaction approved successfully');
            queryClient.invalidateQueries({ queryKey: ['balanceRequests'] });
            setIsApproveDialogOpen(false);
            setAdminNotes('');
        } catch (error) {
            toast.error('Failed to approve transaction');
            console.error('Error approving transaction:', error);
        }
    };

    // Handle rejection
    const handleReject = async () => {
        if (!selectedTransaction) return;

        try {
            const response = await fetch(`/api/admin/balance/requests/${selectedTransaction.id}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rejectionReason, adminNotes })
            });

            if (!response.ok) {
                throw new Error('Failed to reject transaction');
            }

            toast.success('Transaction rejected successfully');
            queryClient.invalidateQueries({ queryKey: ['balanceRequests'] });
            setIsRejectDialogOpen(false);
            setRejectionReason('');
            setAdminNotes('');
        } catch (error) {
            toast.error('Failed to reject transaction');
            console.error('Error rejecting transaction:', error);
        }
    };

    // Reset pagination when filters change
    useEffect(() => {
        setPage(1);
    }, [type, status, search]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="warning">{status}</Badge>;
            case 'completed':
                return <Badge variant="success">{status}</Badge>;
            case 'failed':
                return <Badge variant="destructive">{status}</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'deposit':
                return <Badge>Add Balance</Badge>;
            case 'withdrawal':
                return <Badge variant="destructive">Withdraw</Badge>;
            default:
                return <Badge>{type}</Badge>;
        }
    };

    if (isError) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-medium">Error loading balance requests</h3>
                    <p className="text-red-600 mt-1">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Balance Management</h1>
                    <p className="text-gray-600 mt-1">Manage user balance requests and transactions</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search by user info..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Types</SelectItem>
                                    <SelectItem value="deposit">Deposit</SelectItem>
                                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Items per page</label>
                            <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Balance Requests
                        {data && (
                            <span className="text-sm font-normal text-gray-500">
                                ({data.pagination.total} total)
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : data?.transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No balance requests</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                No balance requests match your current filters.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Method
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {data?.transactions.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {transaction.User?.firstName} {transaction.User?.lastName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {transaction.User?.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getTypeBadge(transaction.type)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {transaction.type === 'withdrawal' ? '-' : ''}₺{Math.abs(transaction.amount).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {transaction.method}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(transaction.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setSelectedTransaction(transaction)}
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-2xl">
                                                                <DialogHeader>
                                                                    <DialogTitle>Transaction Details</DialogTitle>
                                                                </DialogHeader>
                                                                {selectedTransaction && (
                                                                    <div className="space-y-6">
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            <div>
                                                                                <h4 className="text-sm font-medium text-gray-500">User</h4>
                                                                                <p className="mt-1 text-sm text-gray-900">
                                                                                    {selectedTransaction.User?.firstName} {selectedTransaction.User?.lastName}
                                                                                </p>
                                                                                <p className="text-sm text-gray-500">
                                                                                    {selectedTransaction.User?.email}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="text-sm font-medium text-gray-500">Current Balance</h4>
                                                                                <p className="mt-1 text-sm text-gray-900">
                                                                                    ₺{selectedTransaction.User?.balance.toFixed(2)}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                            <div>
                                                                                <h4 className="text-sm font-medium text-gray-500">Type</h4>
                                                                                <p className="mt-1 text-sm text-gray-900">
                                                                                    {getTypeBadge(selectedTransaction.type)}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="text-sm font-medium text-gray-500">Amount</h4>
                                                                                <p className="mt-1 text-sm text-gray-900">
                                                                                    {selectedTransaction.type === 'withdrawal' ? '-' : ''}₺{Math.abs(selectedTransaction.amount).toFixed(2)}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="text-sm font-medium text-gray-500">Method</h4>
                                                                                <p className="mt-1 text-sm text-gray-900">
                                                                                    {selectedTransaction.method}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                            <div>
                                                                                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                                                                <p className="mt-1 text-sm text-gray-900">
                                                                                    {getStatusBadge(selectedTransaction.status)}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="text-sm font-medium text-gray-500">Created</h4>
                                                                                <p className="mt-1 text-sm text-gray-900">
                                                                                    {format(new Date(selectedTransaction.createdAt), 'MMM dd, yyyy HH:mm')}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="text-sm font-medium text-gray-500">Updated</h4>
                                                                                <p className="mt-1 text-sm text-gray-900">
                                                                                    {format(new Date(selectedTransaction.updatedAt), 'MMM dd, yyyy HH:mm')}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        {selectedTransaction.details && Object.keys(selectedTransaction.details).length > 0 && (
                                                                            <div>
                                                                                <h4 className="text-sm font-medium text-gray-500">Details</h4>
                                                                                <div className="mt-1 bg-gray-50 rounded-md p-3">
                                                                                    <pre className="text-xs text-gray-700 overflow-auto">
                                                                                        {JSON.stringify(selectedTransaction.details, null, 2)}
                                                                                    </pre>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {transaction.status === 'pending' && (
                                                                            <div className="flex gap-3 pt-4">
                                                                                <Button
                                                                                    onClick={() => {
                                                                                        setSelectedTransaction(transaction);
                                                                                        setIsApproveDialogOpen(true);
                                                                                    }}
                                                                                    className="bg-green-600 hover:bg-green-700"
                                                                                >
                                                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                                                    Approve
                                                                                </Button>
                                                                                <Button
                                                                                    variant="destructive"
                                                                                    onClick={() => {
                                                                                        setSelectedTransaction(transaction);
                                                                                        setIsRejectDialogOpen(true);
                                                                                    }}
                                                                                >
                                                                                    <XCircle className="w-4 h-4 mr-2" />
                                                                                    Reject
                                                                                </Button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {data && data.pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
                                    <div className="flex flex-1 justify-between sm:hidden">
                                        <Button
                                            onClick={() => setPage(page - 1)}
                                            disabled={page === 1}
                                            variant="outline"
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            onClick={() => setPage(page + 1)}
                                            disabled={page === data.pagination.totalPages}
                                            variant="outline"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                                                <span className="font-medium">
                                                    {Math.min(page * limit, data.pagination.total)}
                                                </span>{' '}
                                                of <span className="font-medium">{data.pagination.total}</span> results
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                <Button
                                                    onClick={() => setPage(page - 1)}
                                                    disabled={page === 1}
                                                    variant="outline"
                                                    className="relative inline-flex items-center rounded-l-md px-2 py-2"
                                                >
                                                    Previous
                                                </Button>
                                                {[...Array(data.pagination.totalPages)].map((_, i) => {
                                                    const pageNum = i + 1;
                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            onClick={() => setPage(pageNum)}
                                                            variant={page === pageNum ? "default" : "outline"}
                                                            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold"
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    );
                                                })}
                                                <Button
                                                    onClick={() => setPage(page + 1)}
                                                    disabled={page === data.pagination.totalPages}
                                                    variant="outline"
                                                    className="relative inline-flex items-center rounded-r-md px-2 py-2"
                                                >
                                                    Next
                                                </Button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Approve Dialog */}
            <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Transaction</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>Are you sure you want to approve this transaction?</p>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Admin Notes (Optional)</label>
                            <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add any notes about this approval..."
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsApproveDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleApprove}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Approve Transaction
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Transaction</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>Are you sure you want to reject this transaction?</p>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Rejection Reason *</label>
                            <Textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Enter the reason for rejection..."
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Admin Notes (Optional)</label>
                            <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add any additional notes..."
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsRejectDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleReject}
                                variant="destructive"
                                disabled={!rejectionReason.trim()}
                            >
                                Reject Transaction
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BalanceManagementPage;