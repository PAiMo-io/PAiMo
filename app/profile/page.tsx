"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Avatar from "boring-avatars";
import PageSkeleton from "../../components/PageSkeleton";
import { useApi } from "../../lib/useApi";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

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
  const [message, setMessage] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
    return <div className="p-4">Failed to load.</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl mb-4">Profile</h1>
      {data.image ? (
        <Image
          src={data.image}
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
        <strong>Email:</strong> {data.email}
      </p>
      {data.username && (
        <p>
          <strong>Username:</strong> {data.username}
        </p>
      )}
      {data.role && (
        <p>
          <strong>Role:</strong> {data.role}
        </p>
      )}
      {data.clubs && data.clubs.length > 0 && (
        <p>
          <strong>Clubs:</strong> {data.clubs.join(', ')}
        </p>
      )}
      <div className="space-y-2 pt-4">
        <h2 className="text-xl">Update Avatar</h2>
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
              const res = await request<{ url: string }>({
                url: '/api/profile/avatar',
                method: 'post',
                data: form,
                headers: { 'Content-Type': 'multipart/form-data' },
              });
              setData(prev => (prev ? { ...prev, image: res.url } : prev));
              setAvatarFile(null);
              setMessage('Avatar updated');
            } catch {
              setMessage('Failed to update avatar');
            }
          }}
        >
          Save Avatar
        </Button>
      </div>
      <div className="space-y-2 pt-4">
        <h2 className="text-xl">Update Username</h2>
        <Input
          placeholder="New username"
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
          Save Username
        </Button>
      </div>
      <div className="space-y-2 pt-4">
        <h2 className="text-xl">Reset Password</h2>
        <Button
          onClick={async () => {
            setMessage('');
            try {
              await request({
                url: '/api/request-password-reset',
                method: 'post',
              });
              setMessage('Password reset email sent');
            } catch {
              setMessage('Failed to send reset email');
            }
          }}
        >
          Send Reset Email
        </Button>
      </div>
      {message && <p className="text-green-500">{message}</p>}
    </div>
  );
}
