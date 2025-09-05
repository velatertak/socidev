import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRoles?: string[]
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
    const { isAuthenticated, admin, refreshProfile } = useAuthStore()
    const location = useLocation()

    // Try to refresh profile if authenticated but no admin data
    React.useEffect(() => {
        if (isAuthenticated && !admin) {
            refreshProfile().catch(() => {
                // If refresh fails, user will be redirected to login
            })
        }
    }, [isAuthenticated, admin, refreshProfile])

    // Check if user is authenticated
    if (!isAuthenticated || !admin) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Check role permissions if required
    if (requiredRoles && requiredRoles.length > 0) {
        const hasPermission = requiredRoles.includes(admin.role)

        if (!hasPermission) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md mx-auto text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <svg
                                className="h-6 w-6 text-red-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                />
                            </svg>
                        </div>
                        <h2 className="mt-4 text-lg font-medium text-gray-900">
                            Access Denied
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            You don't have permission to access this page.
                        </p>
                        <button
                            onClick={() => window.history.back()}
                            className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            )
        }
    }

    return <>{children}</>
}

export default ProtectedRoute