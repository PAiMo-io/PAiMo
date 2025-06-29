'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../../lib/useApi';
import { useClubData } from '../ClubContext';
import ClubCard from '../../../../components/ClubCard';
import UserCard from '../../../../components/UserCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';

export default function ClubMembersPage() {
  const { t } = useTranslation('common');
  const { clubData } = useClubData();

  if (!clubData) {
    return <div className="p-4">Loading club data...</div>;
  }

  // calculate gender statistics
  const maleCount = clubData.members.filter(m => m.gender === 'male').length;
  const femaleCount = clubData.members.filter(m => m.gender === 'female').length;

  return (
    <div className="p-4">
      <div className="space-y-6">
        <ClubCard
          club={{
            id: clubData.club.id,
            name: clubData.club.name,
            description: clubData.club.description,
            location: clubData.club.location,
            createdBy: clubData.club.createdBy,
            createdAt: clubData.club.createdAt,
            logoUrl: clubData.club.logoUrl,
            eventsCount: clubData.events.length,
            pendingRequestsCount: clubData.club.pendingRequestsCount,
          }}
          isAdmin={clubData.isAdmin}
        />

        <Card>
          <CardHeader>
            <CardTitle>
              {t('membersJoined')} ({clubData.members.length})
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {t('genderStats', { maleCount, femaleCount })}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubData.members.map(member => (
                <UserCard key={member.id} user={member} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}