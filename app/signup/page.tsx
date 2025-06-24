'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useApi } from '../../lib/useApi';
import { useTranslation } from 'react-i18next';

export default function SignupPage() {
  const router = useRouter();
  const { request } = useApi();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslation('common');

  const handleEmailBlur = async () => {
    const valid = /\S+@\S+\.\S+/.test(email);
    if (!valid) {
      setEmailError(t('invalidEmail'));
      return;
    }
    try {
      const res = await request<{ exists: boolean }>({
        url: `/api/check-email?email=${encodeURIComponent(email)}`,
        method: 'get',
      });
      if (res.exists) {
        setEmailError(t('emailTaken'));
      } else {
        setEmailError('');
      }
    } catch {
      setEmailError(t('emailCheckError'));
    }
  };

  const handleSubmit = async () => {
    if (emailError) return;
    try {
      await request({
        url: '/api/register',
        method: 'post',
        data: { email, password },
      });
      router.push(`/create-profile?email=${encodeURIComponent(email)}`);
    } catch {
      setError(t('signupFailed'));
    }
  };

  return (
    <div className="mx-auto max-w-xs py-8">
      <h1 className="text-2xl font-semibold mb-4">{t('title')}</h1>
      <div className="space-y-4">
        <Input
          placeholder={t('emailPlaceholder')}
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={handleEmailBlur}
        />
        {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
        <Input
          type="password"
          placeholder={t('passwordPlaceholder')}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button className="w-full" onClick={handleSubmit}>{t('signupButton')}</Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/login">{t('backToLogin')}</Link>
        </Button>
      </div>
    </div>
  );
}
