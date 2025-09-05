import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Mail, Shield } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class AdminErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo,
        });

        // Log error to console for development
        console.error("AdminErrorBoundary caught an error:", error, errorInfo);

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // In production, you might want to send error to logging service
        const isDevelopment = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (!isDevelopment) {
            // Example: sendErrorToAdminLoggingService(error, errorInfo);
        }
    }

    handleRefresh = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    handleGoToDashboard = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        if (typeof window !== 'undefined') {
            window.location.href = "/dashboard";
        }
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default admin error UI
            return (
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8 text-center">
                        <div>
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                                Admin Panel Error
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                The admin panel encountered an unexpected error. Please try refreshing the page.
                            </p>
                        </div>

                        {/* Error details (only in development) */}
                        {(typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) && this.state.error && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                                    Error Details (Development Only)
                                </summary>
                                <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm font-medium text-red-800 mb-2">
                                        {this.state.error.name}: {this.state.error.message}
                                    </p>
                                    <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto">
                                        {this.state.error.stack}
                                    </pre>
                                    {this.state.errorInfo && (
                                        <div className="mt-2">
                                            <p className="text-sm font-medium text-red-800 mb-1">
                                                Component Stack:
                                            </p>
                                            <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-x-auto max-h-32 overflow-y-auto">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleRefresh}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Refresh Page
                            </button>
                            <button
                                onClick={this.handleGoToDashboard}
                                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Shield className="h-4 w-4" />
                                Admin Dashboard
                            </button>
                        </div>

                        <div className="text-sm text-gray-500">
                            <p>If this problem persists, please contact the system administrator:</p>
                            <a
                                href="mailto:admin@socialdev.com"
                                className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 mt-1"
                            >
                                <Mail className="h-4 w-4" />
                                admin@socialdev.com
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Higher-order component for easy usage
export function withAdminErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode,
    onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
    const WrappedComponent = (props: P) => (
        <AdminErrorBoundary fallback={fallback} onError={onError}>
            <Component {...props} />
        </AdminErrorBoundary>
    );

    WrappedComponent.displayName = `withAdminErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
}

// Route-level error boundary for admin pages
export const AdminRouteErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
    <AdminErrorBoundary
        fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Page Error</h2>
                    <p className="text-gray-600 mb-6">This admin page encountered an error and couldn't load properly.</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => typeof window !== 'undefined' && window.location.reload()}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            Reload Page
                        </button>
                        <button
                            onClick={() => typeof window !== 'undefined' && window.history.back()}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        }
    >
        {children}
    </AdminErrorBoundary>
);

// Component-level error boundary for admin components
export const AdminComponentErrorBoundary: React.FC<{
    children: ReactNode;
    componentName?: string
}> = ({ children, componentName = "Component" }) => (
    <AdminErrorBoundary
        fallback={
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">{componentName} Error</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                    This component failed to load. Please refresh the page or contact support.
                </p>
            </div>
        }
    >
        {children}
    </AdminErrorBoundary>
);

// Page section error boundary for specific admin sections
export const AdminSectionErrorBoundary: React.FC<{
    children: ReactNode;
    sectionName: string;
}> = ({ children, sectionName }) => (
    <AdminErrorBoundary
        fallback={
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
                <div className="text-center">
                    <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {sectionName} Unavailable
                    </h3>
                    <p className="text-gray-600 mb-4">
                        This section is temporarily unavailable due to an error.
                    </p>
                    <button
                        onClick={() => typeof window !== 'undefined' && window.location.reload()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        }
    >
        {children}
    </AdminErrorBoundary>
);