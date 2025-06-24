'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useApi } from '../../lib/useApi';
import PageSkeleton from '../../components/PageSkeleton';

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordClient />
    </Suspense>
  );
}

function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { request, loading, error } = useApi();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  const handleSubmit = async () => {
    setMessage('');
    try {
      await request({
        url: '/api/reset-password',
        method: 'post',
        data: { token, password },
      });
      setMessage('Password reset successfully');
      router.push('/login');
    } catch {
      setMessage('Failed to reset password');
    }
  };

  if (!token) {
    return <div className="p-4">Invalid or expired token.</div>;
  }

  if (loading) return <PageSkeleton />;
  if (error) return <div className="p-4">Failed to load.</div>;

  return (
    <div className="mx-auto max-w-xs py-8 space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Set New Password</h1>
      <Input
        type="password"
        placeholder="New password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      {message && <p className="text-green-500 text-sm">{message}</p>}
      <Button className="w-full" onClick={handleSubmit}>
        Reset Password
      </Button>
    </div>
  );
}
