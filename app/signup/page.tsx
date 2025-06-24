'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useApi } from '../../lib/useApi';

export default function SignupPage() {
  const router = useRouter();
  const { request } = useApi();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleEmailBlur = async () => {
    const valid = /\S+@\S+\.\S+/.test(email);
    if (!valid) {
      setEmailError('Invalid email');
      return;
    }
    try {
      const res = await request<{ exists: boolean }>({
        url: `/api/check-email?email=${encodeURIComponent(email)}`,
        method: 'get',
      });
      if (res.exists) {
        setEmailError('Email already registered');
      } else {
        setEmailError('');
      }
    } catch {
      setEmailError('Error checking email');
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
      setError('Signup failed.');
    }
  };

  return (
    <div className="mx-auto max-w-xs py-8">
      <h1 className="text-2xl font-semibold mb-4">Sign Up</h1>
      {sent ? (
        <p>Please check your email to verify your account.</p>
      ) : (
        <div className="space-y-4">
          <Input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={handleEmailBlur}
          />
          {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
          <Button className="w-full" onClick={handleSubmit}>Sign Up</Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
