'use client';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';

export default function VerifyEmailErrorPage() {
  return (
    <div className="p-4 space-y-4 text-center">
      <h1 className="text-2xl font-semibold">Verification Error</h1>
      <p>Invalid or missing verification token.</p>
      <Button asChild className="mt-4">
        <Link href="/signup">Back to Sign Up</Link>
      </Button>
    </div>
  );
}
