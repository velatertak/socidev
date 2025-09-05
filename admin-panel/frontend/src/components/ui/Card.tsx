import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const Card = ({ children, className, ...props }: CardProps) => {
    return (
        <div
            className={cn(
                'rounded-lg border bg-white text-card-foreground shadow-sm',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

const CardHeader = ({ children, className, ...props }: CardHeaderProps) => {
    return (
        <div
            className={cn('flex flex-col space-y-1.5 p-6', className)}
            {...props}
        >
            {children}
        </div>
    );
};

const CardTitle = ({ children, className, ...props }: CardTitleProps) => {
    return (
        <h3
            className={cn(
                'text-2xl font-semibold leading-none tracking-tight',
                className
            )}
            {...props}
        >
            {children}
        </h3>
    );
};

const CardContent = ({ children, className, ...props }: CardContentProps) => {
    return (
        <div className={cn('p-6 pt-0', className)} {...props}>
            {children}
        </div>
    );
};

export { Card, CardHeader, CardTitle, CardContent };