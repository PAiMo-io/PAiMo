"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Avatar from "boring-avatars";
import PageSkeleton from "../../components/PageSkeleton";
import { useApi } from "../../lib/useApi";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useTranslation } from "react-i18next"; 

interface ProfileData {
  email: string;
  username?: string;
  role?: string;
  image?: string | null;
  clubs?: string[];
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { request, loading, error } = useApi();
  const [data, setData] = useState<ProfileData | null>(null);
  const [usernameEdit, setUsernameEdit] = useState('');
  const [passwordEdit, setPasswordEdit] = useState('');
  const [message, setMessage] = useState('');
  const { t } = useTranslation('profile');
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.email) return;
      const res = await request<ProfileData>({
        url: '/api/profile',
        method: 'post',
        data: { email: session.user.email },
      });
      setData(res);
    };
    fetchProfile();
  }, [session, request]);

  if (loading || !data) {
    return <PageSkeleton />;
  }

  if (error) {
    return <div className="p-4">{t('failedToLoad')}</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl mb-4">{t('profile')}</h1>
      {data.image ? (
        <Image
          src={data.image}
          alt="Profile picture"
          width={96}
          height={96}
          className="rounded-full"
          priority
        />
      ) : (
        <Avatar size={96} name={data.username || data.email} variant="beam" />
      )}
      <p>
        <strong>{t('email')}:</strong> {data.email}
      </p>
      {data.username && (
        <p>
          <strong>{t('username')}:</strong> {data.username}
        </p>
      )}
      {data.role && (
        <p>
          <strong>{t('role')}:</strong> {data.role}
        </p>
      )}
      {data.clubs && data.clubs.length > 0 && (
        <p>
          <strong>{t('clubs')}:</strong> {data.clubs.join(', ')}
        </p>
      )}
      <div className="space-y-2 pt-4">
        <h2 className="text-xl">{t('updateUsername')}</h2>
        <Input
          placeholder={t('newUsername')}
          value={usernameEdit}
          onChange={e => setUsernameEdit(e.target.value)}
        />
        <Button
          onClick={async () => {
            setMessage('');
            try {
              await request({
                url: '/api/profile',
                method: 'put',
                data: { username: usernameEdit },
              });
              setData(prev =>
                prev ? { ...prev, username: usernameEdit } : prev
              );
              setUsernameEdit('');
              setMessage('Username updated');
            } catch {
              setMessage('Failed to update username');
            }
          }}
        >
          {t('saveUsername')}
        </Button>
      </div>
      <div className="space-y-2 pt-4">
        <h2 className="text-xl">{t('changePassword')}</h2>
        <Input
          type="password"
          placeholder={t('newPassword')}
          value={passwordEdit}
          onChange={e => setPasswordEdit(e.target.value)}
        />
        <Button
          onClick={async () => {
            setMessage('');
            try {
              await request({
                url: '/api/profile',
                method: 'put',
                data: { password: passwordEdit },
              });
              setPasswordEdit('');
              setMessage('Password updated');
            } catch {
              setMessage('Failed to update password');
            }
          }}
        >
          {t('savePassword')}
        </Button>
      </div>
      {message && <p className="text-green-500">{t(message)}</p>}
    </div>
  );
}
