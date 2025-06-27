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
  nickname?: string;
  role?: string;
  image?: string | null;
  clubs?: string[];
  avatarUpdatedAt?: string;
}

function getAvatarUrl(image?: string | null, avatarUpdatedAt?: string | number | null) {
  if (!image) return '';
  return avatarUpdatedAt
    ? `${image}?v=${new Date(avatarUpdatedAt).getTime()}`
    : image;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { request, loading, error } = useApi();
  const [data, setData] = useState<ProfileData | null>(null);
  const [usernameEdit, setUsernameEdit] = useState('');
  const [nicknameEdit, setNicknameEdit] = useState('');
  const [message, setMessage] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
      setUsernameEdit(res.username || '');
      setNicknameEdit(res.nickname || '');
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
          src={getAvatarUrl(data.image, data.avatarUpdatedAt)}
          alt="Profile picture"
          width={96}
          height={96}
          className="rounded-full"
          unoptimized
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
      <p>
        <strong>{t('nickname')}:</strong> {data.nickname ? data.nickname : <span className="text-gray-500">Not set</span>}
      </p>
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
        <h2 className="text-xl">{t('updateAvatar')}</h2>
        <Input
          type="file"
          accept="image/*"
          onChange={e => setAvatarFile(e.target.files ? e.target.files[0] : null)}
        />
        <Button
          onClick={async () => {
            if (!avatarFile) return;
            setMessage('');
            const form = new FormData();
            form.append('avatar', avatarFile);
            try {
              const res = await request<{ url: string; avatarUpdatedAt: string }>({
                url: '/api/profile/avatar',
                method: 'post',
                data: form,
                headers: { 'Content-Type': 'multipart/form-data' },
              });
              setData(prev =>
                prev
                  ? { ...prev, image: res.url, avatarUpdatedAt: res.avatarUpdatedAt }
                  : prev
              );
              setAvatarFile(null);
              setMessage(t('avatarUpdated'));
            } catch {
              setMessage(t('failedToUpdateAvatar'));
            }
          }}
        >
          {t('saveAvatar')}
        </Button>
      </div>
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
              setMessage(t('usernameUpdated'));
            } catch {
              setMessage(t('failedToUpdateUsername'));
            }
          }}
        >
          {t('saveUsername')}
        </Button>
      </div>
      <div className="space-y-2 pt-4">
        <h2 className="text-xl">{t('updateNickname') || 'Update Nickname'}</h2>
        <Input
          placeholder={t('newNickname') || 'New Nickname'}
          value={nicknameEdit}
          onChange={e => setNicknameEdit(e.target.value)}
        />
        <Button
          onClick={async () => {
            setMessage('');
            try {
              await request({
                url: '/api/profile',
                method: 'put',
                data: { nickname: nicknameEdit },
              });
              setData(prev =>
                prev ? { ...prev, nickname: nicknameEdit } : prev
              );
              setMessage(t('nicknameUpdated'));
            } catch {
              setMessage(t('failedToUpdateNickname'));
            }
          }}
        >
          {t('saveNickname')}
        </Button>
      </div>
      <div className="space-y-2 pt-4">
        <h2 className="text-xl">{t('resetPassword')}</h2>
        <Button
          onClick={async () => {
            setMessage('');
            try {
              await request({
                url: '/api/request-password-reset',
                method: 'post',
              });
              setMessage(t('passwordResetEmailSent'));
            } catch {
              setMessage(t('failedToSendResetEmail'));
            }
          }}
        >
          {t('sendResetEmail')}
        </Button>
      </div>
      {message && <p className="text-green-500">{t(message)}</p>}
    </div>
  );
}
