'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useApi } from '../../lib/useApi';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const router = useRouter();
  const { request } = useApi();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
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
        data: { email },
      });
      setSent(true);
    } catch {
      setError(t('signupFailed'));
    }
  };
  
  const handleGoogle = async () => {
    await signIn('google');
  };

  return (
    <div className="mx-auto max-w-xs py-8">
      <h1 className="text-2xl font-semibold mb-4">{t('signupTitle')}</h1>
      {sent ? (
        <p>{t('signupSent')}</p>
      ) : (
        <div className="space-y-4">
          <Input
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={handleEmailBlur}
          />
          {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
          <Button className="bg-white text-black w-full" onClick={handleSubmit}>{t('signupButton')}</Button>
          <Button className="black w-full flex items-center justify-center gap-2" onClick={handleGoogle}>
            <Image src="/google-logo.svg" alt="Google" width={20} height={20} />
            {t('signupWithGoogle')}
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">{t('backToLogin')}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
