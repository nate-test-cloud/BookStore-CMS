'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@/hooks';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/Card';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const loginMutation = useLogin();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    React.useEffect(() => {
        if (user) {
            router.push('/admin/dashboard');
        }
    }, [user, router]);

    const onSubmit = async (data: LoginFormData) => {
        try {
            await loginMutation.mutateAsync(data);
            router.push('/admin/dashboard');
        } catch (error) {
            // Error handled by mutation
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>
                        Enter your credentials to access BookStore CMS
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="admin@bookstore.com"
                            error={errors.email?.message}
                            {...register('email')}
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            error={errors.password?.message}
                            {...register('password')}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={loginMutation.isPending}
                        >
                            Sign In
                        </Button>

                        <div className="text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-blue-600 hover:underline">
                                Sign up
                            </Link>
                        </div>
                    </form>

                    {/* Test Credentials */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Test Accounts:</p>
                        <div className="space-y-1 text-xs text-gray-600">
                            <div>
                                <strong>Admin:</strong> admin@bookstore.com / Admin@123
                            </div>
                            <div>
                                <strong>Manager:</strong> manager@bookstore.com / Manager@123
                            </div>
                            <div>
                                <strong>Cashier:</strong> cashier@bookstore.com / Cashier@123
                            </div>
                            <div>
                                <strong>Customer:</strong> customer@bookstore.com / Customer@123
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
