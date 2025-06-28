'use client';
import { createContext, useContext } from 'react';

interface Member {
  id: string;
  username: string;
  nickname?: string;
  gender?: string;
  image?: string | null;
}

interface AdminUser {
  id: string;
  username: string;
  nickname?: string;
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
  placementRequired?: boolean;
}

export interface ClubData {
  club: Club;
  members: Member[];
  events: EventItem[];
  adminList: AdminUser[];
  isMember: boolean;
  isAdmin: boolean;
}

const ClubDataContext = createContext<{
  clubData: ClubData | null;
  fetchClubData: () => Promise<void>;
  setClubData: (data: ClubData) => void;
  loading: boolean;
} | null>(null);

export const useClubData = () => {
  const context = useContext(ClubDataContext);
  if (!context) {
    throw new Error('useClubData must be used within ClubDataProvider');
  }
  return context;
};

export default ClubDataContext;