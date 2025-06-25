'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useApi } from '../../lib/useApi';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordPage() {
  const { t, i18n } = useTranslation('common');
  const { request } = useApi();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    setMessage('');
    try {
      await request({
        url: '/api/request-password-reset',
        method: 'post',
        data: { email, lang: i18n.language },
      });
      setSent(true);
    } catch {
      setMessage('Failed to send reset email');
    }
  };

  return (
    <div className="mx-auto max-w-xs py-8">
      <h1 className="text-2xl font-semibold mb-4">{t('resetPassword')}</h1>
      {sent ? (
        <p>{t('passwordResetEmailSent')}</p>
      ) : (
        <div className="space-y-4">
          <Input
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          {message && <p className="text-red-500 text-sm">{message}</p>}
          <Button className="w-full" onClick={handleSubmit}>
            {t('sendResetEmail')}
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">{t('backToLogin')}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
