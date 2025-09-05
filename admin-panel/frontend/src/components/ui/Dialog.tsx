import React from 'react';
import { cn } from '../../lib/utils';

interface DialogProps {
    children: React.ReactNode;
}

interface DialogTriggerProps {
    children: React.ReactNode;
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
}

const Dialog = ({ children }: DialogProps) => {
    return <div>{children}</div>;
};

const DialogTrigger = ({ children }: DialogTriggerProps) => {
    return <>{children}</>;
};

const DialogContent = ({ children, className, ...props }: DialogContentProps) => {
    return (
        <div
            className={cn(
                'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

const DialogHeader = ({ children, className, ...props }: DialogHeaderProps) => {
    return (
        <div
            className={cn(
                'flex flex-col space-y-1.5 text-center sm:text-left',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

const DialogTitle = ({ children, className, ...props }: DialogTitleProps) => {
    return (
        <h2
            className={cn(
                'text-lg font-semibold leading-none tracking-tight',
                className
            )}
            {...props}
        >
            {children}
        </h2>
    );
};

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };