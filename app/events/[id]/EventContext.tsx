'use client';
import { createContext, useContext } from 'react';

export interface EventContextData {
  session: any;
  event: any;
  groups: any[];
  matches: any[];
  quickMatches: any[];
  isAdmin: boolean;
  isParticipant: boolean;
  canRegister: boolean;
  canUnregister: boolean;
  actions: {
    fetchEvent: () => Promise<void>;
    joinEvent: () => Promise<void>;
    leaveEvent: () => Promise<void>;
    updateInfo: (data: any) => Promise<void>;
    removeParticipant: (participantId: string) => Promise<void>;
    nextStep: () => Promise<void>;
    prevStep: () => Promise<void>;
    deleteAllMatches: () => Promise<void>;
    saveGroups: (groups: any[]) => Promise<void>;
    generateGroups: () => Promise<void>;
    generateMatches: () => Promise<void>;
    updateMatchScore: (matchId: string, scoreData: any) => Promise<void>;
    fetchQuickMatches: () => Promise<void>;
  };
}

const EventContext = createContext<EventContextData | null>(null);

export const useEventData = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventData must be used within EventDataProvider');
  }
  return context;
};

export default EventContext;