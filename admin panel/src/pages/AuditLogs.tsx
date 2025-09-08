import React, { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender
} from '@tanstack/react-table';
import {
  Search,
  Filter,
  Shield,
  User,
  ShoppingCart,
  ListTodo,
  Settings,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  targetUserId: string | null;
  targetUserName: string | null;
  description: string;
  metadata: {
    ip: string;
    userAgent: string;
    changes?: any;
  };
  createdAt: string;
}

const columnHelper = createColumnHelper<AuditLog>();

export const AuditLogs: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [sorting, setSorting] = useState([]);

  const columns = [
    columnHelper.accessor('createdAt', {
      header: 'Timestamp',
      cell: ({ getValue }) => (
        <div className="text-sm text-gray-900">
          {new Date(getValue()).toLocaleString()}
        </div>
      ),
    }),
    columnHelper.accessor('actorName', {
      header: 'Actor',
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{row.original.actorName}</div>
          <div className="text-sm text-gray-500">{row.original.actorEmail}</div>
        </div>
      ),
    }),
    columnHelper.accessor('action', {
      header: 'Action',
      cell: ({ getValue }) => {
        const action = getValue();
        const actionColors = {
          USER_CREATED: 'bg-green-100 text-green-800',
          USER_UPDATED: 'bg-blue-100 text-blue-800',
          USER_SUSPENDED: 'bg-yellow-100 text-yellow-800',
          USER_BANNED: 'bg-red-100 text-red-800',
          USER_RESTORED: 'bg-green-100 text-green-800',
          ORDER_CREATED: 'bg-purple-100 text-purple-800',
          ORDER_UPDATED: 'bg-blue-100 text-blue-800',
          ORDER_REFUNDED: 'bg-yellow-100 text-yellow-800',
          TASK_APPROVED: 'bg-green-100 text-green-800',
          TASK_REJECTED: 'bg-red-100 text-red-800',
          SETTINGS_UPDATED: 'bg-gray-100 text-gray-800'
        };
        const colorClass = actionColors[action as keyof typeof actionColors] || 'bg-gray-100 text-gray-800';

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {action.replace('_', ' ')}
          </span>
        );
      },
    }),
    columnHelper.accessor('resource', {
      header: 'Resource',
      cell: ({ getValue }) => {
        const resource = getValue();
        const resourceIcons = {
          user: User,
          order: ShoppingCart,
          task: ListTodo,
          settings: Settings
        };
        const Icon = resourceIcons[resource as keyof typeof resourceIcons] || Shield;

        return (
          <div className="flex items-center">
            <Icon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-900 capitalize">{resource}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      cell: ({ getValue }) => (
        <div className="text-sm text-gray-600 max-w-md">
          {getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('targetUserName', {
      header: 'Target',
      cell: ({ getValue }) => (
        <div className="text-sm text-gray-500">
          {getValue() || '-'}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'metadata',
      header: 'Details',
      cell: ({ row }) => (
        <div className="text-xs text-gray-500">
          <div>IP: {row.original.metadata.ip}</div>
          {row.original.metadata.changes && (
            <div className="mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Has Changes
              </span>
            </div>
          )}
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: auditLogs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      globalFilter,
      sorting,
      pagination,
    },
    manualPagination: true,
    pageCount: totalPages,
  });

  const fetchAuditLogs = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
        limit: pagination.pageSize.toString(),
        search: globalFilter,
        action: actionFilter,
        resource: resourceFilter,
        sortBy: sorting[0]?.id || 'createdAt',
        sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
      });

      const response = await fetch(`/api/admin/audit-logs?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.auditLogs);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [pagination, globalFilter, actionFilter, resourceFilter, sorting]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const uniqueActions = Array.from(new Set(auditLogs.map(log => log.action)));
  const uniqueResources = Array.from(new Set(auditLogs.map(log => log.resource)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-600 mt-1">
            Complete log of all administrative actions and system events
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">Immutable Records</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {auditLogs.length}
          </div>
          <div className="text-sm text-gray-600">Total Logs</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {auditLogs.filter(log => log.action.includes('CREATED') || log.action.includes('APPROVED')).length}
          </div>
          <div className="text-sm text-gray-600">Positive Actions</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">
            {auditLogs.filter(log => log.action.includes('UPDATED') || log.action.includes('SUSPENDED')).length}
          </div>
          <div className="text-sm text-gray-600">Modifications</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {auditLogs.filter(log => log.action.includes('BANNED') || log.action.includes('REJECTED')).length}
          </div>
          <div className="text-sm text-gray-600">Restrictive Actions</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search logs..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action.replace('_', ' ')}</option>
            ))}
          </select>

          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Resources</option>
            {uniqueResources.map(resource => (
              <option key={resource} value={resource} className="capitalize">{resource}</option>
            ))}
          </select>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {auditLogs.length} logs found
            </span>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white shadow border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center space-x-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <div className="flex flex-col">
                            <ChevronUp className={`h-3 w-3 ${header.column.getIsSorted() === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} />
                            <ChevronDown className={`h-3 w-3 -mt-1 ${header.column.getIsSorted() === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} />
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                ({auditLogs.length} logs)
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="p-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4 -ml-1" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="p-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4 -ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
