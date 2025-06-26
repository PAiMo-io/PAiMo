'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailLogin = async () => {
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    if (res?.error) {
      setError(t('invalidCredentials'));
    } else {
      router.push('/myclub');
    }
  };

  const handleGoogle = async () => {
    await signIn('google');
  };

  return (
    <div className="mx-auto max-w-xs py-8">
      <h1 className="text-2xl font-semibold mb-4">{t('loginTitle')}</h1>
      <div className="space-y-4">
        <Input
          placeholder={t('emailPlaceholder')}
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder={t('passwordPlaceholder')}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button className="bg-white text-black w-full" onClick={handleEmailLogin}>{t('loginButton')}</Button>
        <Button className="black w-full flex items-center justify-center gap-2" onClick={handleGoogle}>
          <Image src="/google-logo.svg" alt="Google" width={20} height={20} />
          {t('loginWithGoogle')}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {t('googleLoginSuggestion')}
        </p>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/signup">{t('signupLink')}</Link>
        </Button>
        <Button variant="link" className="w-full p-0" asChild>
          <Link href="/forgot-password">Forgot Password?</Link>
        </Button>
      </div>
    </div>
  );
}
