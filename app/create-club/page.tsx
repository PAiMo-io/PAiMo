'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../components/ui/select';
import { useApi } from '../../lib/useApi';
import { useTranslation } from 'react-i18next';
import PageSkeleton from '../../components/PageSkeleton';

export default function CreateClubPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { data: session, status } = useSession();
  const { request, loading } = useApi();
  const [clubName, setClubName] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [clubLocation, setClubLocation] = useState('');
  const [clubVisibility, setClubVisibility] = useState<'private' | 'public'>('public');
  const [message, setMessage] = useState('');

  const handleCreateClub = async () => {
    if (!clubName.trim()) {
      setMessage(t('clubNameRequired') || 'Club name is required');
      return;
    }

    setMessage('');
    try {
      await request({
        url: '/api/clubs',
        method: 'post',
        data: { 
          name: clubName, 
          description: clubDescription,
          location: clubLocation, 
          visibility: clubVisibility 
        },
      });
      setMessage(t('clubCreated') || 'Club created successfully!');
      // 清空表单
      setClubName('');
      setClubDescription('');
      setClubLocation('');
      setClubVisibility('private');
      // 延迟跳转到我的俱乐部页面
      setTimeout(() => {
        router.push('/myclub');
      }, 1500);
    } catch (error) {
      setMessage(t('failedToCreateClub') || 'Failed to create club');
    }
  };

  if (status === 'loading') {
    return <PageSkeleton />;
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">{t('createClub')}</h1>
      
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-2">{t('clubName')}</label>
          <Input
            value={clubName}
            onChange={e => setClubName(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('clubDescription')}</label>
          <Input
            value={clubDescription}
            onChange={e => setClubDescription(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('clubLocation')}</label>
          <Input
            value={clubLocation}
            onChange={e => setClubLocation(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('clubVisibility')}</label>
          <Select
            value={clubVisibility}
            onValueChange={value => setClubVisibility(value as 'private' | 'public')}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">{t('private')}</SelectItem>
              <SelectItem value="public">{t('public')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/myclub')}
            className="flex-1"
          >
            {t('cancel') || 'Cancel'}
          </Button>
          <Button 
            onClick={handleCreateClub} 
            disabled={loading || !clubName.trim()}
            className="flex-1"
          >
            {loading ? t('creating') || 'Creating...' : t('create') || 'Create'}
          </Button>
        </div>

        {message && (
          <p className={`text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
} 