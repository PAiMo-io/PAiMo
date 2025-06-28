'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { useApi } from '@/lib/useApi';
import ClubCard from '@/components/ClubCard';
import ClubMap from '@/components/club/ClubMap';
import EventCard from '@/components/EventCard';
import UserCard from '@/components/UserCard';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import ConfirmLeaveDialog from '@/components/club/ConfirmLeaveDialog';
import { useClubData } from '../ClubContext';

export default function ClubHomePage() {
  const { t } = useTranslation('common');
  const { data: session, update } = useSession();
  const { request } = useApi();
  const { clubData, fetchClubData } = useClubData();
  const [newEventName, setNewEventName] = useState('');
  const [clubLocation, setClubLocation] = useState('');
  const [clubVisibility, setClubVisibility] = useState('private');
  const [savingLocation, setSavingLocation] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const currentUserRole = clubData?.members.find(m => m.id === session?.user?.id)?.role;

  // Update local state when clubData changes
  useEffect(() => {
    if (clubData) {
      setClubLocation(clubData.club.location || '');
      setClubVisibility(clubData.club.visibility || 'private');
    }
  }, [clubData]);

  if (!clubData) {
    return <div className="p-4">Loading club data...</div>;
  }

  const joinClub = async () => {
    await request({ url: `/api/clubs/${clubData.club.id}`, method: 'post' });
    update();
    fetchClubData();
  };

  const leaveClub = async () => {
    await request({ url: `/api/clubs/${clubData.club.id}/leave`, method: 'delete' });
    fetchClubData();
  };

  const createEvent = async () => {
    if (!newEventName) return;
    await request({
      url: '/api/events',
      method: 'post',
      data: { 
        name: newEventName, 
        clubId: clubData.club.id, 
        status: 'preparing', 
        visibility: 'private' 
      },
    });
    setNewEventName('');
    fetchClubData();
  };

  const updateLocation = async () => {
    setSavingLocation(true);
    await request({
      url: `/api/clubs/${clubData.club.id}`,
      method: 'put',
      data: { location: clubLocation },
    });
    setSavingLocation(false);
    fetchClubData();
  };

  const updateVisibility = async (newVisibility: string) => {
    setSavingVisibility(true);
    setClubVisibility(newVisibility);
    await request({
      url: `/api/clubs/${clubData.club.id}`,
      method: 'put',
      data: { visibility: newVisibility },
    });
    setSavingVisibility(false);
    fetchClubData();
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    await request({
      url: `/api/clubs/${clubData.club.id}/role`,
      method: 'put',
      data: { memberId, role },
    });
    fetchClubData();
  };

  // Filter ongoing events (not ended)
  const ongoingEvents = clubData.events.filter(event => event.status !== 'ended');
  
  // Get admin users from club's adminList
  const adminUsers = clubData.adminList;

  return (
    <div className="p-4">
      <div className="space-y-6">
      {/* Club Card */}
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
        }}
      />

      {/* Club Location */}
      {clubData.club.location && (
        <Card>
          <CardHeader>
            <CardTitle>{t('location')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ClubMap locations={[clubData.club.location]} />
          </CardContent>
        </Card>
      )}

      {/* Admin Controls */}
      {clubData.isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Location Update */}
            <div>
              <label className="text-sm font-medium mb-2 block">Club Location</label>
              <div className="flex gap-2">
                <LocationAutocomplete
                  placeholder="Club location"
                  value={clubLocation}
                  onChange={setClubLocation}
                />
                <Button 
                  onClick={updateLocation} 
                  disabled={savingLocation}
                  size="sm"
                >
                  {savingLocation ? t('saving') : t('save')}
                </Button>
              </div>
            </div>

            {/* Visibility Control */}
            <div>
              <label className="text-sm font-medium mb-2 block">Club Visibility</label>
              <Select 
                value={clubVisibility} 
                onValueChange={updateVisibility}
                disabled={savingVisibility}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">{t('private')}</SelectItem>
                  <SelectItem value="publicView">{t('publicView')}</SelectItem>
                  <SelectItem value="publicJoin">{t('publicJoin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Create Event */}
            <div>
              <label className="text-sm font-medium mb-2 block">Create New Event</label>
              <div className="flex gap-2">
                <Input
                  value={newEventName}
                  onChange={e => setNewEventName(e.target.value)}
                  placeholder={t('newEventName')}
                  className="flex-1"
                />
                <Button onClick={createEvent} disabled={!newEventName}>
                  {t('createEvent')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ongoing Events */}
      {(clubData.isAdmin || clubData.isMember) && (
        <Card>
          <CardHeader>
            <CardTitle>{t('ongoingEvents')} ({ongoingEvents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {ongoingEvents.length === 0 ? (
              <p className="text-gray-500">{t('noEvents')}</p>
            ) : (
              <div className="space-y-3">
                {ongoingEvents
                  .filter(event => clubData.isMember || event.visibility !== 'private')
                  .map(event => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <EventCard event={event} />
                    </Link>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin Users */}
      {clubData.isAdmin && adminUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Users ({adminUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {adminUsers.map(admin => (
                <UserCard key={admin.id} user={admin} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {clubData.isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>{t('manageRoles')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {clubData.members.map(member => (
              <div key={member.id} className="flex items-center justify-between">
                <UserCard user={member} />
                <Select
                  value={member.role || 'member'}
                  onValueChange={value => handleRoleChange(member.id, value)}
                  disabled={
                    member.role === 'president' &&
                    currentUserRole !== 'president' &&
                    session?.user?.role !== 'super-admin'
                  }
                >
                  <SelectTrigger className="w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="president">{t('president')}</SelectItem>
                    <SelectItem value="vice">{t('vicePresident')}</SelectItem>
                    <SelectItem value="member">{t('member')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Join/Leave Club */}
      <div className="flex gap-2">
        {!clubData.isMember && (
          <Button onClick={joinClub} className="bg-green-600 hover:bg-green-700">
            {t('joinClub')}
          </Button>
        )}
        {clubData.isMember && (
          <Button variant="destructive" onClick={() => setShowLeave(true)}>
            {t('leaveClub')}
          </Button>
        )}
      </div>

      <ConfirmLeaveDialog
        open={showLeave}
        onClose={() => setShowLeave(false)}
        onConfirm={leaveClub}
      />
      </div>
    </div>
  );
}