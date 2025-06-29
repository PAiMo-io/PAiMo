'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { useApi } from '@/lib/useApi';
import UserCard from '@/components/UserCard';
import { useClubData } from '../ClubContext';
import ConfirmDialog from '../../../../components/ConfirmDialog';

interface JoinRequest {
  id: string;
  userId: string;
  clubId: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user: {
    id: string;
    username: string;
    nickname?: string;
    image?: string | null;
  };
}

export default function ClubRequestsPage() {
  const { t } = useTranslation('common');
  const { request } = useApi();
  const { clubData, fetchClubData } = useClubData();
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);

  useEffect(() => {
    if (clubData?.isAdmin) {
      fetchJoinRequests();
    }
  }, [clubData]);

  const fetchJoinRequests = async () => {
    if (!clubData?.club.id) return;

    setLoading(true);
    try {
      const res = await request<JoinRequest[]>({
        url: `/api/clubs/${clubData.club.id}/join-requests`,
        method: 'get',
      });
      setJoinRequests(res);
    } catch (error) {
      console.error('Failed to fetch join requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId: string) => {
    try {
      await request({
        url: `/api/clubs/${clubData?.club.id}/join-requests/${requestId}/approve`,
        method: 'post',
      });
      fetchJoinRequests();
      fetchClubData();
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      await request({
        url: `/api/clubs/${clubData?.club.id}/join-requests/${requestId}/reject`,
        method: 'post',
      });
      fetchJoinRequests();
      fetchClubData();
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  if (!clubData?.isAdmin) {
    return (
      <div className="p-4">
        <p className="text-gray-500">{t('noPermission')}</p>
      </div>
    );
  }

  // sort the requests by createdAt
  const sortedRequests = [...joinRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-4">
      {loading ? (
        <p className="text-gray-500">{t('loading')}</p>
      ) : sortedRequests.length === 0 ? (
        <p className="text-gray-500">{t('noPendingRequests')}</p>
      ) : (
        <div className="space-y-4">
          {sortedRequests.map((joinRequest) => (
            <div key={joinRequest.id} className="border rounded-md p-4 space-y-3">
              <div>
                <UserCard user={joinRequest.user} />
              </div>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  {joinRequest.message && (
                    <p className="text-sm text-gray-600">
                      &ldquo;{joinRequest.message}&rdquo;
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(joinRequest.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  {joinRequest.status === 'pending' && <>
                    <Button
                      size="sm"
                      onClick={() => approveRequest(joinRequest.id)}
                      className="bg-black hover:bg-black"
                    >
                      {t('approve')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(joinRequest);
                        setShowRejectDialog(true);
                      }}
                      className="hover:bg-white hover:text-black"
                    >
                      {t('reject')}
                    </Button>
                  </>}
                  {joinRequest.status === 'approved' && <>
                    <Button size="sm" disabled className="bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200">{t('approved')}</Button>
                    <Button size="sm" disabled variant="outline" className="text-gray-400 border-gray-200 cursor-not-allowed hover:bg-white hover:text-gray-400">{t('reject')}</Button>
                  </>}
                  {joinRequest.status === 'rejected' && <>
                    <Button size="sm" disabled variant="outline" className="text-gray-400 border-gray-200 cursor-not-allowed hover:bg-white hover:text-gray-400">{t('approve')}</Button>
                    <Button size="sm" disabled className="bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200">{t('rejected')}</Button>
                  </>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        title={t('rejectRequest')}
        description={t('rejectRequestDescription')}
        onConfirm={() => {
          if (selectedRequest) {
            rejectRequest(selectedRequest.id);
            setSelectedRequest(null);
          }
        }}
      />
    </div>
  );
} 