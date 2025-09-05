import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../stores/auth'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const loginSchema = yup.object().shape({
    email: yup
        .string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    password: yup
        .string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
    rememberMe: yup.boolean()
})

type LoginFormData = yup.InferType<typeof loginSchema>

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useAuthStore()

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false
        }
    })

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true)
        try {
            const success = await login(data.email, data.password)
            if (success) {
                toast.success('Login successful! Welcome back.')
                // Navigation will be handled by the app router based on auth state
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.'
            toast.error(errorMessage)

            if (error.response?.status === 401) {
                setError('password', {
                    type: 'manual',
                    message: 'Invalid email or password'
                })
            } else if (error.response?.status === 403) {
                setError('email', {
                    type: 'manual',
                    message: 'Account is disabled or does not have admin access'
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Admin Panel
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to access the Social Developer management dashboard
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className={cn(
                                        'h-5 w-5',
                                        errors.email ? 'text-red-400' : 'text-gray-400'
                                    )} />
                                </div>
                                <input
                                    {...register('email')}
                                    type="email"
                                    autoComplete="email"
                                    className={cn(
                                        'block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-colors',
                                        errors.email
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                                    )}
                                    placeholder="Enter your email"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && (
                                <div className="mt-1 flex items-center text-sm text-red-600">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {errors.email.message}
                                </div>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className={cn(
                                        'h-5 w-5',
                                        errors.password ? 'text-red-400' : 'text-gray-400'
                                    )} />
                                </div>
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    className={cn(
                                        'block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-colors',
                                        errors.password
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                                    )}
                                    placeholder="Enter your password"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <div className="mt-1 flex items-center text-sm text-red-600">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {errors.password.message}
                                </div>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    {...register('rememberMe')}
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    disabled={isLoading}
                                />
                                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                'group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-200',
                                isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                            )}
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <LoadingSpinner size="sm" color="white" className="mr-2" />
                                    Signing in...
                                </div>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    {/* Security Notice */}
                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start">
                            <Shield className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div className="text-sm text-amber-800">
                                <strong>Security Notice:</strong> This is a secure admin area. All login attempts are monitored and logged.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        © 2024 Social Developer. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginPage