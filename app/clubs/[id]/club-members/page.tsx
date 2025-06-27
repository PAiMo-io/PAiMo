'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import UserCard from '@/components/UserCard';
import PageSkeleton from '@/components/PageSkeleton';
import { useApi } from '@/lib/useApi';

interface Member {
  id: string;
  username: string;
  nickname?: string;
  gender?: string;
  image?: string | null;
}

interface EventItem {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  participantCount?: number;
  visibility: string;
  registrationEndTime?: string;
  location?: string;
  clubName?: string | null;
}

interface Club {
  id: string;
  name: string;
  description?: string;
  location?: string;
  createdBy?: string;
  createdAt?: string;
  logoUrl?: string;
  visibility?: string;
}

interface ClubData {
  club: Club;
  members: Member[];
  events: EventItem[];
  isMember: boolean;
  isAdmin: boolean;
}

export default function ClubMembersPage({ params }: { params: { id: string } }) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { data: session, status } = useSession();
  const { request, loading, error } = useApi();
  const [clubData, setClubData] = useState<ClubData | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    fetchClubData();
  }, [status, session, router, params.id, request]);

  const fetchClubData = async () => {
    try {
      const res = await request<{ club: any; members: Member[]; events: EventItem[] }>({
        url: `/api/clubs/${params.id}`,
        method: 'get',
      });
      
      const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'super-admin';
      const isMember = res.members.some((m: Member) => m.id === session?.user?.id);

      setClubData({
        club: {
          id: params.id,
          name: res.club.name,
          description: res.club.description || '',
          location: res.club.location || '',
          createdBy: res.club.createdBy || '',
          createdAt: res.club.createdAt || '',
          logoUrl: res.club.logoUrl || '',
          visibility: res.club.visibility || 'private',
        },
        members: res.members,
        events: res.events.map(e => ({ ...e, clubName: res.club.name })),
        isMember,
        isAdmin,
      });
    } catch (err) {
      console.error('Failed to fetch club data:', err);
    }
  };

  if (status === 'loading' || loading) {
    return <PageSkeleton />;
  }

  if (error || !clubData) {
    return <div className="p-4">Failed to load club data.</div>;
  }

  // Calculate gender statistics
  const maleCount = clubData.members.filter(m => 
    m.gender === 'male' || m.gender === 'Male'
  ).length;
  
  const femaleCount = clubData.members.filter(m => 
    m.gender === 'female' || m.gender === 'Female'
  ).length;
  
  const unknownCount = clubData.members.filter(m => 
    !m.gender || (m.gender !== 'male' && m.gender !== 'Male' && m.gender !== 'female' && m.gender !== 'Female')
  ).length;

  return (
    <div className="p-4">
      <div className="space-y-6">
      {/* Member Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('membersJoined')}</span>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {clubData.members.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{maleCount}</div>
              <div className="text-sm text-gray-500">{t('male')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-600">{femaleCount}</div>
              <div className="text-sm text-gray-500">{t('female')}</div>
            </div>
            {unknownCount > 0 && (
              <div>
                <div className="text-2xl font-bold text-gray-600">{unknownCount}</div>
                <div className="text-sm text-gray-500">Unknown</div>
              </div>
            )}
          </div>
          
          {/* Gender ratio */}
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600 text-center">
              {t('genderStats', { maleCount, femaleCount })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>All Members</CardTitle>
        </CardHeader>
        <CardContent>
          {clubData.members.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No members yet.</p>
          ) : (
            <div className="space-y-3">
              {clubData.members.map(member => (
                <div key={member.id} className="flex items-center justify-between">
                  <UserCard user={member} />
                  <div className="flex items-center gap-2">
                    {member.gender && (
                      <Badge 
                        variant="outline" 
                        className={
                          member.gender === 'male' || member.gender === 'Male' 
                            ? 'border-blue-200 text-blue-600' 
                            : member.gender === 'female' || member.gender === 'Female'
                            ? 'border-pink-200 text-pink-600'
                            : 'border-gray-200 text-gray-600'
                        }
                      >
                        {member.gender === 'male' || member.gender === 'Male' 
                          ? t('male') 
                          : member.gender === 'female' || member.gender === 'Female'
                          ? t('female')
                          : member.gender
                        }
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Breakdown by Gender (Visual) */}
      {clubData.members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Male members */}
              {maleCount > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600">{t('male')}</span>
                    <span className="text-sm text-gray-500">{maleCount}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(maleCount / clubData.members.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Female members */}
              {femaleCount > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-pink-600">{t('female')}</span>
                    <span className="text-sm text-gray-500">{femaleCount}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-pink-500 rounded-full"
                      style={{ width: `${(femaleCount / clubData.members.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Unknown gender */}
              {unknownCount > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Unknown</span>
                    <span className="text-sm text-gray-500">{unknownCount}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-500 rounded-full"
                      style={{ width: `${(unknownCount / clubData.members.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}