'use client';
import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useApi } from '../../lib/useApi';
import PageSkeleton from '../../components/PageSkeleton';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('common');

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

  useEffect(() => {
    if (!token) {
      router.replace('/');
    }
  }, [token, router]);

  if (!token) {
    return <div className="p-4">{t('invalidOrExpiredToken')}</div>;
  }

  if (loading) return <PageSkeleton />;
  if (error) return <div className="p-4">Failed to load.</div>;

  return (
    <div className="mx-auto max-w-xs py-8 space-y-4">
      <h1 className="text-2xl font-semibold mb-4">{t('setNewPassword')}</h1>
      <Input
        type="password"
        placeholder={t('newPassword')}
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      {message && <p className="text-green-500 text-sm">{message}</p>}
      <Button className="w-full" onClick={handleSubmit}>
        {t('resetPassword')}
      </Button>
    </div>
  );
}
