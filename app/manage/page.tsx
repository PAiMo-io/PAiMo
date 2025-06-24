'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PageSkeleton from '../../components/PageSkeleton'
import { useApi } from '../../lib/useApi'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import ClubCard from '../../components/ClubCard';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface User {
  username: string;
  role: string;
}

interface ClubOption {
  id: string;
  name: string;
  description?: string;
  location?: string;
  createdBy?: string;
  createdAt?: string;
  logoUrl?: string;
}

export default function ManagePage() {
  const { t } = useTranslation('common')
  const router = useRouter();
  const { data: session, status } = useSession();
  const { request, loading, error } = useApi();
  const [users, setUsers] = useState<User[]>([]);
  const [clubName, setClubName] = useState('');
  const [eventName, setEventName] = useState('');
  const [clubs, setClubs] = useState<ClubOption[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>('');

  const fetchUsers = useCallback(async () => {
    const res = await request<{ users: User[] }>({ url: '/api/users', method: 'get' });
    setUsers(res.users);
  }, [request]);

  const handleRoleChange = async (username: string, newRole: string) => {
    await request({
      url: '/api/users',
      method: 'put',
      data: { username, role: newRole },
    });
    setUsers(prev => prev.map(u => (u.username === username ? { ...u, role: newRole } : u)));
  };

  const handleCreateClub = async () => {
    await request({ url: '/api/clubs', method: 'post', data: { name: clubName } });
    setClubName('');
    fetchClubs();
  };

  const fetchClubs = useCallback(async () => {
    const res = await request<{ clubs: any[] }>({ url: '/api/clubs', method: 'get' });
    setClubs(
      res.clubs.map((c: any) => ({
        id: c._id || c.id,
        name: c.name,
        description: c.description,
        location: c.location,
        logoUrl: c.logoUrl,
        createdBy: c.createdBy,
        createdAt: c.createdAt,
      }))
    );
  }, [request]);

  const handleCreateEvent = async () => {
    if (!selectedClub) return;
    await request({
      url: '/api/events',
      method: 'post',
      data: { name: eventName, clubId: selectedClub },
    });
    setEventName('');
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    if (session.user?.role !== 'super-admin') {
      router.push('/');
      return;
    }
    fetchUsers();
    fetchClubs();
  }, [status, session, router, fetchUsers, fetchClubs]);

  if (status === 'loading' || loading) {
    return <PageSkeleton />
  }

  if (error) {
    return <div className="p-4">Failed to load.</div>
  }

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-xl font-semibold mb-4">{t('roleManagement')}</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">{t('username')}</th>
              <th className="border p-2 text-left">{t('role')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.username} className="odd:bg-white even:bg-gray-50">
                <td className="border p-2">{u.username}</td>
                <td className="border p-2">
                  <Select
                    value={u.role}
                    onValueChange={value => handleRoleChange(u.username, value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super-admin">{t('superAdmin')}</SelectItem>
                      <SelectItem value="admin">{t('admin')}</SelectItem>
                      <SelectItem value="member">{t('member')}</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8 space-y-4">
        <div className="flex items-center space-x-2">
          <Input placeholder={t('newClubName')} value={clubName} onChange={e => setClubName(e.target.value)} />
          <Button onClick={handleCreateClub}>{t('createClub')}</Button>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            placeholder={t('newEventName')}
            value={eventName}
            onChange={e => setEventName(e.target.value)}
          />
          <Select value={selectedClub} onValueChange={setSelectedClub}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('selectClub')} />
            </SelectTrigger>
            <SelectContent>
              {clubs.map((c, idx) => (
                <SelectItem key={idx} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleCreateEvent}>{t('createEvent')}</Button>
        </div>
        <div>
          <h2 className="text-lg font-semibold mt-4">{t('allClubs')}</h2>
          <div className="space-y-2">
            {clubs.map(c => (
              <Link key={c.id} href={`/clubs/${c.id}`}> 
                <ClubCard club={c} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
