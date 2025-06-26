// /hooks/useEventPage.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/lib/useApi';
import dayjs from 'dayjs';
import { IUser } from '@/models/User';
import { MatchUI } from '@/components/MatchesScheduleSection';
import { EVENT_STEPS, EventStep } from '@/components/StepIndicator';

const steps: EventStep[] = [...EVENT_STEPS];

export function useEventPage(eventId: string) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { request } = useApi();

    const [event, setEvent] = useState<any>(null);
    const [groups, setGroups] = useState<IUser[][]>([]);
    const [matches, setMatches] = useState<MatchUI[]>([]);

    const [numCourts, setNumCourts] = useState<number>(
        event?.courtCount ?? 1
    );

    // Derived flags
    const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'super-admin';
    const isParticipant = !!(event?.participants || []).find((p: any) => p.id === session?.user?.id);
    const canRegister =
        !isParticipant &&
        event?.status === 'registration' &&
        (!event?.registrationEndTime || dayjs(event.registrationEndTime).isAfter(dayjs())) &&
        (
            event?.visibility === 'public-join' ||
            session?.user?.role === 'super-admin' ||
            session?.user?.role === 'admin' ||
            (session?.user?.clubs && event?.club && session.user.clubs.includes(event.club))
        );

    const canUnregister =
        isParticipant &&
        event?.status === 'registration' &&
        (!event?.registrationEndTime || dayjs(event.registrationEndTime).isAfter(dayjs()));

    const fetchEvent = useCallback(async () => {
        const { event: e } = await request<{ event: any }>({
            url: `/api/events/${eventId}`,
            method: 'get'
        });

        setEvent(e);
    }, [eventId, request]);

    const fetchMatches = useCallback(async () => {
        const { matches: m } = await request<{ matches: MatchUI[] }>({
            url: `/api/match?eventId=${eventId}`,
            method: 'get'
        });
        setMatches(m);
    }, [eventId, request]);

    // initial load / auth guard
    useEffect(() => {
        if (status === 'loading') return;
        if (!session) { router.push('/login'); return; }
        fetchEvent();
        fetchMatches();
    }, [status, session, router]); // Remove fetchEvent and fetchMatches dependencies to prevent loop

    // All your action functions:
    const joinEvent = async () => { await request({ url: `/api/events/${eventId}`, method: 'post' }); fetchEvent() };
    const leaveEvent = async () => { await request({ url: `/api/events/${eventId}/leave`, method: 'delete', }); fetchEvent(); };
    const removeParticipant = async (pid: string) => {
        await request({
            url: `/api/events/${eventId}?participantId=${pid}`,
            method: 'delete',
        });
        fetchEvent();
    };
    const saveInfo = async (data: any) => {
        await request({
            url: `/api/events/${eventId}`,
            method: 'put',
            data: {
                name: event.editingName,
                visibility: event.editingVisibility,
                gameStyle: event.editingGameStyle,
                registrationEndTime: event.editingRegEnd || undefined,
                location: event.editingLocation,
                maxPoint: event.editingMaxPoint ? Number(event.editingMaxPoint) : undefined,
                courtCount: event.editingCourtCount ? Number(event.editingCourtCount) : undefined,
            },
        });
        fetchEvent();
    };
    const updateInfo = async (info: any) => {
        await request({
            url: `/api/events/${eventId}`,
            method: 'put',
            data: info,
        });
        // Don't refetch - the form already has the updated data
        // This prevents the infinite loop
    };
    const nextStep = async () => {
        const idx = steps.indexOf(event.status);
        if (idx < steps.length - 1) {
            const newStatus = steps[idx + 1];
            await request({ url: `/api/events/${eventId}`, method: 'put', data: { status: newStatus }, }); fetchEvent();
        }
    };
    const prevStep = async () => {
        const idx = steps.indexOf(event.status);
        if (idx > 0) {
            const newStatus = steps[idx - 1];
            await request({
                url: `/api/events/${eventId}`,
                method: 'put',
                data: { status: newStatus },
            });
            fetchEvent();
        }
    };
    const generateGroups = async () => {
        const groupResp = await request({
            url: `/api/create-group`,
            method: 'post',
            data: {
                eventId: eventId,
                numCourts: event.courtCount,
            },
        }) as { groups?: IUser[][] };
        setGroups(groupResp.groups || []);
    };
    const saveGroups = (g: IUser[][]) => setGroups(g);
    const generateMatches = async () => {
        const matchResp = await request({
            url: `/api/create-matches`,
            method: 'post',
            data: {
                eventId: eventId,
                groups: groups,
                matchesPerUser: 5,
                courtsPerGroup: 2,
            },
        }) as { matches?: any[] };
        setGroups([]);
        setMatches(matchResp.matches || []);
    };

    const deleteAllMatches = async () => { await request({ url: '/api/match', method: 'delete', data: { eventId: event.id } }); fetchMatches(); };

    const updateCourtCount = useCallback(
        async (newCount: number) => {
            setNumCourts(newCount);

            await request({
                url: `/api/events/${eventId}`,
                method: 'put',
                data: { courtCount: newCount },
            });

            await fetchEvent();
        },
        [eventId, request, fetchEvent]
    );

    const updateMatchScore = async (matchId: string, scores: [number, number]) => {
        await request({
            url: `/api/match`,
            method: 'patch',
            data: { matchId, scores },
        });
        await fetchMatches();
    };

    return {
        session, event,
        groups, matches,
        isAdmin, isParticipant,
        canRegister, canUnregister,
        actions: {
            fetchEvent, joinEvent, leaveEvent,
            removeParticipant,
            saveInfo, updateInfo, nextStep, prevStep,
            generateGroups, saveGroups,
            generateMatches, deleteAllMatches,
            updateCourtCount, updateMatchScore,
        }
    };
}