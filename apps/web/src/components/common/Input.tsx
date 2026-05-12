'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type = 'text', label, error, helperText, ...props }, ref) => (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {props.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                type={type}
                className={clsx(
                    'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
                    'placeholder:text-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200',
                    error && 'border-red-500 focus:ring-red-500',
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            {helperText && !error && <p className="text-gray-500 text-sm mt-1">{helperText}</p>}
        </div>
    )
);

Input.displayName = 'Input';

export { Input };
