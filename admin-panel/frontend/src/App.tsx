import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import AdminLayout from './components/layout/AdminLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import OrderManagementPage from './pages/orders/OrderManagementPage'
import TaskApprovalPage from './pages/orders/TaskApprovalPage'
import AnalyticsPage from './pages/analytics/AnalyticsPage'
import AnalyticsDashboardPage from './pages/analytics/AnalyticsDashboardPage'
import FinancialLedgersPage from './pages/analytics/FinancialLedgersPage'
import SettingsPage from './pages/settings/SettingsPage.tsx'
import SystemSettingsPage from './pages/settings/SystemSettingsPage'
import SecurityPage from './pages/security/SecurityPage'
import ReportsPage from './pages/reports/ReportsPage'
import UserManagementPage from './pages/users/UserManagementPage'
import TaskManagementPage from './pages/tasks/TaskManagementPage'
import BalanceManagementPage from './pages/balance/BalanceManagementPage'
import { useAuthStore } from './stores/auth'
import { AdminErrorBoundary, AdminRouteErrorBoundary } from './components/error/AdminErrorBoundary'

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
})

// Placeholder components for routes that haven't been fully implemented yet
const SocialAccountsPage = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold">Social Accounts</h1>
        <p className="text-gray-600 mt-2">Social accounts management will be implemented here.</p>
    </div>
)

const ProfilePage = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Profile management will be implemented here.</p>
    </div>
)

// Test component for toasts
const TestToastsPage = () => {
    const showSuccessToast = () => {
        toast.success('This is a success message!');
    };

    const showErrorToast = () => {
        toast.error('This is an error message!');
    };

    const showInfoToast = () => {
        toast('This is an info message!');
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Test Toast Notifications</h2>
            <div className="space-x-4">
                <button
                    onClick={showSuccessToast}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                    Show Success Toast
                </button>
                <button
                    onClick={showErrorToast}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                    Show Error Toast
                </button>
                <button
                    onClick={showInfoToast}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Show Info Toast
                </button>
            </div>
        </div>
    );
};

function App() {
    const { isAuthenticated } = useAuthStore()

    return (
        <AdminErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <Router>
                    <div className="App">
                        {/* Toast Notifications */}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 8000,
                                style: {
                                    background: '#fff',
                                    color: '#333',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                },
                                success: {
                                    iconTheme: {
                                        primary: '#10b981',
                                        secondary: '#fff',
                                    },
                                    style: {
                                        border: '1px solid #d1fae5',
                                    }
                                },
                                error: {
                                    iconTheme: {
                                        primary: '#ef4444',
                                        secondary: '#fff',
                                    },
                                    style: {
                                        border: '1px solid #fecaca',
                                    }
                                }
                            }}
                        />

                        <Routes>
                            {/* Public Routes */}
                            <Route
                                path="/login"
                                element={
                                    isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
                                }
                            />

                            {/* Protected Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <AdminLayout>
                                            <AdminRouteErrorBoundary>
                                                <DashboardPage />
                                            </AdminRouteErrorBoundary>
                                        </AdminLayout>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Test Toasts Route */}
                            <Route
                                path="/test-toasts"
                                element={
                                    <ProtectedRoute>
                                        <AdminLayout>
                                            <TestToastsPage />
                                        </AdminLayout>
                                    </ProtectedRoute>
                                }
                            />

                            {/* User Management Routes */}
                            <Route
                                path="/users/*"
                                element={
                                    <ProtectedRoute>
                                        <AdminLayout>
                                            <AdminRouteErrorBoundary>
                                                <Routes>
                                                    <Route index element={<UserManagementPage />} />
                                                    <Route path="active" element={<UserManagementPage />} />
                                                    <Route path="inactive" element={<UserManagementPage />} />
                                                    <Route path="task-givers" element={<UserManagementPage />} />
                                                    <Route path="task-doers" element={<UserManagementPage />} />
                                                </Routes>
                                            </AdminRouteErrorBoundary>
                                        </AdminLayout>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Reports Routes */}
                            <Route
                                path="/reports/*"
                                element={
                                    <ProtectedRoute>
                                        <AdminLayout>
                                            <Routes>
                                                <Route index element={<ReportsPage />} />
                                                <Route path="analytics" element={<ReportsPage />} />
                                                <Route path="financial" element={<ReportsPage />} />
                                                <Route path="user" element={<ReportsPage />} />
                                            </Routes>
                                        </AdminLayout>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Order Management Routes */}
                            <Route
                                path="/orders/*"
                                element={
                                    <ProtectedRoute>
                                        <AdminLayout>
                                            <Routes>
                                                <Route index element={<OrderManagementPage />} />
                                                <Route path="pending" element={<OrderManagementPage />} />
                                                <Route path="completed" element={<OrderManagementPage />} />
                                                <Route path="analytics" element={<OrderManagementPage />} />
                                                {/* Task approvals route */}
                                                <Route path="approvals" element={<TaskApprovalPage />} />
                                                {/* Task management route */}
                                                <Route path="tasks" element={<TaskManagementPage />} />
                                            </Routes>
                                        </AdminLayout>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Balance Management Routes */}
                            <Route
                                path="/balance/*"
                                element={
                                    <ProtectedRoute>
                                        <AdminLayout>
                                            <Routes>
                                                <Route index element={<BalanceManagementPage />} />
                                                <Route path="requests" element={<BalanceManagementPage />} />
                                                <Route path="history" element={<BalanceManagementPage />} />
                                            </Routes>
                                        </AdminLayout>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Task Management Routes - REMOVED since tasks are now orders */}

                            {/* Social Accounts Routes */}
                            <Route
                                path="/social-accounts/*"
                                element={
                                    <ProtectedRoute>
                                        <AdminLayout>
                                            <Routes>
                                                <Route index element={<SocialAccountsPage />} />
                                                <Route path="youtube" element={<SocialAccountsPage />} />
                                                <Route path="instagram" element={<SocialAccountsPage />} />
                                                <Route path="twitter" element={<SocialAccountsPage />} />
                                                <Route path="facebook" element={<SocialAccountsPage />} />
                                            </Routes>
                                        </AdminLayout>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Analytics Routes */}
                            <Route
                                path="/analytics/*"
                                element={
                                    <ProtectedRoute>
                                        <AdminLayout>
                                            <Routes>
                                                <Route index element={<AnalyticsDashboardPage />} />
                                                <Route path="dashboard" element={<AnalyticsDashboardPage />} />
                                                <Route path="revenue" element={<AnalyticsPage />} />
                                                <Route path="platforms" element={<AnalyticsPage />} />
                                                <Route path="users" element={<AnalyticsPage />} />
                                                <Route path="export" element={<AnalyticsPage />} />
                                                <Route path="financial" element={<FinancialLedgersPage />} />
                                            </Routes>
                                        </AdminLayout>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Settings Routes */}
                            <Route
                                path="/settings/*"
                                element={
                                    <ProtectedRoute>
                                        <AdminLayout>
                                            <Routes>
                                                <Route index element={<SettingsPage />} />
                                                <Route path="payments" element={<SettingsPage />} />
                                                <Route path="emails" element={<SettingsPage />} />
                                                <Route path="api" element={<SettingsPage />} />
                                                <Route path="system" element={<SystemSettingsPage />} />
                                            </Routes>
                                        </AdminLayout>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Security Routes */}
                            <Route
                                path="/security/*"
                                element={
                                    <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN']}>
                                        <AdminLayout>
                                            <Routes>
                                                <Route index element={<SecurityPage />} />
                                                <Route path="logs" element={<SecurityPage />} />
                                                <Route path="permissions" element={<SecurityPage />} />
                                                <Route path="health" element={<SecurityPage />} />
                                                <Route path="backup" element={<SecurityPage />} />
                                            </Routes>
                                        </AdminLayout>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Profile Route */}
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <AdminLayout>
                                            <ProfilePage />
                                        </AdminLayout>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Default redirect */}
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </div>
                </Router>
            </QueryClientProvider>
        </AdminErrorBoundary>
    )
}

export default App