import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning';
    children: React.ReactNode;
}

const Badge = ({
    children,
    variant = 'default',
    className,
    ...props
}: BadgeProps) => {
    const variantClasses = {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        success: 'bg-green-500 text-white',
        warning: 'bg-yellow-500 text-black',
    };

    return (
        <div
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                variantClasses[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export { Badge };