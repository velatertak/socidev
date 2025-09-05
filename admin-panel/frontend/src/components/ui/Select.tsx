import React from 'react';
import { cn } from '../../lib/utils';

interface SelectProps {
    children: React.ReactNode;
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
    children: React.ReactNode;
}

interface SelectValueProps {
    placeholder?: string;
}

const Select = ({ children }: SelectProps) => {
    return <div className="relative">{children}</div>;
};

const SelectTrigger = ({ children, className, ...props }: SelectTriggerProps) => {
    return (
        <button
            className={cn(
                'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

const SelectContent = ({ children, className, ...props }: SelectContentProps) => {
    return (
        <div
            className={cn(
                'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

const SelectItem = ({ children, className, ...props }: SelectItemProps) => {
    return (
        <div
            className={cn(
                'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

const SelectValue = ({ placeholder }: SelectValueProps) => {
    return <span className="text-muted-foreground">{placeholder}</span>;
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };