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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import { PLACEMENT_QUESTIONS } from '../constants/placement';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../constants/i18n';

function CreateProfileClient() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const searchParams = useSearchParams();
  const queryEmail = searchParams.get('email');
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
  const [showPlacement, setShowPlacement] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { t, i18n } = useTranslation('common');

  const effectiveEmail = session?.user?.email || queryEmail;

  // Populate email from NextAuth session or query param
  useEffect(() => {
    // Redirect to login if profile is complete or no email
    if (status !== 'loading' && (session?.user?.profileComplete || !(session?.user?.email || queryEmail))) {
      router.replace('/');
      return;
    }
    if (session?.user?.email) {
      setEmail(session.user.email);
    } else if (queryEmail) {
      setEmail(queryEmail);
    } else {
      const param = searchParams.get('email');
      if (param) setEmail(param);
      const lang = searchParams.get('lang');
      if (lang && SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) i18n.changeLanguage(lang);
    }
  }, [session, queryEmail, status, router]);

  if (status !== 'loading' && session?.user?.profileComplete) {
    return <div className="p-4">{t('profileExists')}</div>;
  }

  if (status !== 'loading' && !effectiveEmail) {
    return <div className="p-4">{t('missingEmail')}</div>;
  }

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
    setShowPlacement(true);
  };

  const calculateLevel = () => {
    return PLACEMENT_QUESTIONS.reduce((total, q) => {
      const value = answers[q.key];
      const opt = q.options.find(o => o.value === value);
      return total + (opt?.score || 0);
    }, 0);
  };

  const handlePlacementSubmit = async () => {
    const level = calculateLevel();
    try {
      await request({
        url: '/api/signup',
        method: 'post',
        data: { email, username, gender, nickname, wechatId, password, level, lang: i18n.language },
      });
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
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
          placeholder={t("passwordPlaceholder")}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <Input
          type="password"
          placeholder={t("confirmPasswordPlaceholder")}
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
      <Button variant="outline" className="w-full">
        <Link href="/login" className="block w-full h-full">{t('backToLogin')}</Link>
      </Button>
    </div>
    <Dialog open={showPlacement} onOpenChange={setShowPlacement}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('placementTitle')}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {PLACEMENT_QUESTIONS.map(question => (
            <Select
              key={question.key}
              value={answers[question.key]}
              onValueChange={value =>
                setAnswers(prev => ({ ...prev, [question.key]: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t(question.questionKey)} />
              </SelectTrigger>
              <SelectContent>
                {question.options.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
        <DialogFooter className="pt-4">
          <Button className="w-full" onClick={async () => { setShowPlacement(false); await handlePlacementSubmit(); }}>
            {t('placementSubmit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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