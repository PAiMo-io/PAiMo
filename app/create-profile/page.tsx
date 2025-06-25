'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../components/ui/select';
import PageSkeleton from '../../components/PageSkeleton'
import { useApi } from '../../lib/useApi'
import { useTranslation } from 'react-i18next';


import { Suspense } from 'react';

function CreateProfileClient() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const searchParams = useSearchParams();
  const { request, loading, error: apiError } = useApi();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [nickname, setNickname] = useState('');
  const [wechatId, setWechatId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const { t } = useTranslation('common');

  // Populate email from NextAuth session or query param
  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    } else {
      const param = searchParams.get('email');
      if (param) setEmail(param);
    }
  }, [session, searchParams]);

  const handleSubmit = async () => {
    if (!gender) {
      setError(t('genderRequired'));
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (confirmPasswordError) {
      setError(confirmPasswordError);
      return;
    }
    try {
      await request({
        url: '/api/signup',
        method: 'post',
        data: { email, username, gender, nickname, wechatId, password },
      });
      // login after signup using NextAuth credentials provider
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password
      });
      console.log('Login error:', res);
      if (res?.error) {
        setError('Login failed. Please try again.');
        console.error('Login error:', res.error);
        return;
      }
      await update();
      router.push('/');
    } catch (e: any) {
      setError(t('signupFailed'));
    }
  };

  if (status === 'loading' || loading) {
    return <PageSkeleton />;
  }

  if (apiError) {
    return <div className="p-4">{t('loadFailed')}</div>;
  }

  return (
    <div className="mx-auto max-w-xs py-8">
      <h1 className="text-2xl font-semibold mb-4">{t('profileTitle')}</h1>
      <div className="space-y-4">
        <Input
          placeholder={t('usernamePlaceholder')}
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <Input
          placeholder={t('nicknamePlaceholder')}
          value={nickname}
          onChange={e => setNickname(e.target.value)}
        />
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('genderPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">{t('genderMale')}</SelectItem>
            <SelectItem value="Female">{t('genderFemale')}</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder={t('wechatPlaceholder')}
          value={wechatId}
          onChange={e => setWechatId(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          onBlur={() => {
            if (confirmPassword && password !== confirmPassword) {
              setConfirmPasswordError('Passwords do not match');
            } else {
              setConfirmPasswordError('');
            }
          }}
        />
        {confirmPasswordError && <p className="text-red-500 text-sm">{confirmPasswordError}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button className="w-full" onClick={handleSubmit}>
          {t('saveProfile')}
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/login">{t('backToLogin')}</Link>
        </Button>
      </div>
    </div>
  );
}

export default function CreateProfilePage() {
  return (
    <Suspense>
      <CreateProfileClient />
    </Suspense>
  );
}