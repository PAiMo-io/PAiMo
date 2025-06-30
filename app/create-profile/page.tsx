'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import PageSkeleton from '../../components/PageSkeleton';
import { useApi } from '../../lib/useApi';
import { useTranslation } from 'react-i18next';

import { Suspense } from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../constants/i18n';

function CreateProfileClient() {
    const router = useRouter();
    const { data: session, status } = useSession();
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
    const [genderError, setGenderError] = useState('');
    const { t, i18n } = useTranslation('common');

    const effectiveEmail = session?.user?.email || queryEmail;

    // Validate form
    const isFormValid = gender && password && !confirmPasswordError;

    // Clear gender error when gender is selected
    useEffect(() => {
        if (gender) {
            setGenderError('');
        }
    }, [gender]);

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
        return <div className='p-4'>{t('profileExists')}</div>;
    }

    if (status !== 'loading' && !effectiveEmail) {
        return <div className='p-4'>{t('missingEmail')}</div>;
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
        try {
            const res = await request<{ user: { email: string } }>({
                url: '/api/complete-profile',
                method: 'post',
                data: { email, username, gender, nickname, wechatId, password, lang: i18n.language },
            });

            await signIn('credentials', {
                email: res.user.email,
                redirect: true,
                callbackUrl: '/dashboard',
            });
        } catch (e: any) {
            setError(t('signupFailed'));
        }
    };

    if (status === 'loading' || loading) {
        return <PageSkeleton />;
    }

    if (apiError) {
        return <div className='p-4'>{t('loadFailed')}</div>;
    }

    return (
        <div className='mx-auto max-w-xs py-8'>
            <h1 className='text-2xl font-semibold mb-4'>{t('profileTitle')}</h1>
            <div className='space-y-4'>
                <Input
                    placeholder={t('usernamePlaceholder')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                    placeholder={t('nicknamePlaceholder')}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />
                <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className='w-full'>
                        <SelectValue placeholder={t('genderPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='male'>{t('genderMale')}</SelectItem>
                        <SelectItem value='female'>{t('genderFemale')}</SelectItem>
                    </SelectContent>
                </Select>
                <Input
                    placeholder={t('wechatPlaceholder')}
                    value={wechatId}
                    onChange={(e) => setWechatId(e.target.value)}
                />
                <Input
                    type='password'
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                    type='password'
                    placeholder={t('confirmPasswordPlaceholder')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => {
                        if (confirmPassword && password !== confirmPassword) {
                            setConfirmPasswordError('Passwords do not match');
                        } else {
                            setConfirmPasswordError('');
                        }
                    }}
                />
                {confirmPasswordError && <p className='text-red-500 text-sm'>{confirmPasswordError}</p>}
                {error && <p className='text-red-500 text-sm'>{error}</p>}
                <Button className='w-full' onClick={handleSubmit}>
                    {t('saveProfile')}
                </Button>
                <Button variant='outline' className='w-full'>
                    <Link href='/login' className='block w-full h-full'>
                        {t('backToLogin')}
                    </Link>
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
