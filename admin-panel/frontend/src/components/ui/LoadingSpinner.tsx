import { cn } from '../../lib/utils'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
    color?: 'primary' | 'white' | 'gray'
}

const LoadingSpinner = ({
    size = 'md',
    className,
    color = 'primary'
}: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8'
    }

    const colorClasses = {
        primary: 'text-primary-600',
        white: 'text-white',
        gray: 'text-gray-400'
    }

    return (
        <div
            className={cn(
                'animate-spin rounded-full border-2 border-current border-t-transparent',
                sizeClasses[size],
                colorClasses[color],
                className
            )}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    )
}

export default LoadingSpinner