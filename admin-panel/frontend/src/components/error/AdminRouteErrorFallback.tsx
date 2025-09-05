import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Shield, RefreshCw } from "lucide-react";

interface AdminRouteErrorFallbackProps {
    error?: Error;
    resetError?: () => void;
}

export const AdminRouteErrorFallback: React.FC<AdminRouteErrorFallbackProps> = ({
    error,
    resetError,
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleGoBack = () => {
        if (resetError) resetError();
        navigate(-1);
    };

    const handleGoToDashboard = () => {
        if (resetError) resetError();
        navigate("/dashboard");
    };

    const handleRefresh = () => {
        if (resetError) resetError();
        window.location.reload();
    };

    return (
        <div className="min-h-[400px] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-6">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Admin Page Error
                </h2>

                <p className="text-gray-600 mb-6">
                    {error?.message || "Something went wrong while loading this admin page."}
                </p>

                {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && error && (
                    <details className="mb-6 text-left">
                        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-2">
                            Error Details (Development)
                        </summary>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm font-medium text-red-800 mb-1">
                                Admin Route: {location.pathname}
                            </p>
                            <p className="text-xs text-red-700 font-mono break-all">
                                {error.stack}
                            </p>
                        </div>
                    </details>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>

                    <button
                        onClick={handleGoBack}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </button>

                    <button
                        onClick={handleGoToDashboard}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Shield className="h-4 w-4" />
                        Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

// Admin 404 Error component
export const AdminNotFoundFallback: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="min-h-[400px] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-6">
                    <h1 className="text-6xl font-bold text-gray-300">404</h1>
                </div>

                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Admin Page Not Found
                </h2>

                <p className="text-gray-600 mb-6">
                    The admin page you're looking for doesn't exist or you don't have permission to access it.
                </p>

                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">
                        Requested URL: <code className="text-gray-700">{location.pathname}</code>
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <Shield className="h-4 w-4" />
                        Admin Dashboard
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};