import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import './ui.css';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        const variants = {
            default: "bg-blue-600/20 text-blue-400 border-blue-500/30",
            secondary: "bg-indigo-600/20 text-indigo-400 border-indigo-500/30",
            outline: "bg-transparent text-zinc-400 border-zinc-700",
            success: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30",
            warning: "bg-amber-600/20 text-amber-400 border-amber-500/30",
            danger: "bg-red-600/20 text-red-400 border-red-500/30",
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2",
                    variants[variant],
                    className
                )}
                {...props}
            />
        );
    }
);
Badge.displayName = "Badge";
