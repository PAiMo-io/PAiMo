'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { useApi } from '@/lib/useApi'
import UserCard from '@/components/UserCard'
import { MatchUI } from '../MatchesScheduleSection'
import ScoreEntryDialog from './ScoreEntryDialog'

interface Player {
  id: string
  username: string
  image?: string | null
}

interface MatchLobbyProps {
  eventId: string
  currentUserId?: string
  quickMatches: MatchUI[]
  onRefresh: () => void
}

export default function MatchLobby({
  eventId,
  currentUserId,
  quickMatches,
  onRefresh
}: MatchLobbyProps) {
  const { t } = useTranslation('common')
  const { request } = useApi()
  const [isCreating, setIsCreating] = useState(false)
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false)
  const [activeMatch, setActiveMatch] = useState<MatchUI | null>(null)

  const handleCreateMatch = async () => {
    if (!currentUserId) return

    setIsCreating(true)
    try {
      await request({
        url: '/api/createEventQuickMatch',
        method: 'post',
        data: { eventId }
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to create match:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinMatch = async (matchId: string) => {
    if (!currentUserId) return

    try {
      await request({
        url: '/api/createEventQuickMatch',
        method: 'put',
        data: { matchId, action: 'join' }
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to join match:', error)
    }
  }

  const handleLeaveMatch = async (matchId: string) => {
    if (!currentUserId) return

    try {
      await request({
        url: '/api/createEventQuickMatch',
        method: 'put',
        data: { matchId, action: 'leave' }
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to leave match:', error)
    }
  }

  const handleStartMatch = async (matchId: string) => {
    try {
      await request({
        url: '/api/createEventQuickMatch',
        method: 'put',
        data: { matchId, action: 'start' }
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to start match:', error)
    }
  }

  const handleRematch = async (originalMatchId: string) => {
    try {
      await request({
        url: '/api/createEventQuickMatch',
        method: 'post',
        data: { eventId, rematchFrom: originalMatchId }
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to create rematch:', error)
    }
  }

  const handleUpdateScore = async (matchId: string, scores: [number, number]) => {
    try {
      await request({
        url: '/api/match',
        method: 'patch',
        data: { matchId, scores }
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to update score:', error)
    }
  }

  const openScoreDialog = (match: MatchUI) => {
    setActiveMatch(match)
    setScoreDialogOpen(true)
  }

  // Helper functions to work with MatchUI structure for quick matches
  const getMatchStatus = (match: MatchUI): 'waiting' | 'playing' | 'completed' => {
    // Check if teams structure exists and has both teams
    if (!match.teams || match.teams.length < 2) return 'waiting'

    // If team 1 is empty, it's waiting
    if (!match.teams[1] || match.teams[1].players.length === 0) return 'waiting'

    // If either team has a score > 0, it's completed
    if ((match.teams[0]?.score > 0) || (match.teams[1]?.score > 0)) return 'completed'

    // Otherwise it's playing
    return 'playing'
  }

  const getAllPlayers = (match: MatchUI): Player[] => {
    // Safety check for teams structure
    if (!match.teams || match.teams.length < 2) return []

    const status = getMatchStatus(match)
    if (status === 'waiting') {
      // In waiting state, all players are in team 0
      return (match.teams[0]?.players || []).map(p => ({
        id: (p as any)._id || (p as any).id || '',
        username: p.username || p.nickname || p.email || 'Unknown',
        image: p.image || null
      }))
    } else {
      // In playing/completed state, players are in both teams
      return [
        ...(match.teams[0]?.players || []).map(p => ({
          id: (p as any)._id || (p as any).id || '',
          username: p.username || p.nickname || p.email || 'Unknown',
          image: p.image || null
        })),
        ...(match.teams[1]?.players || []).map(p => ({
          id: (p as any)._id || (p as any).id || '',
          username: p.username || p.nickname || p.email || 'Unknown',
          image: p.image || null
        }))
      ]
    }
  }

  const isUserInMatch = (match: MatchUI): boolean => {
    const allPlayers = getAllPlayers(match)
    return allPlayers.some(player => player.id === currentUserId)
  }

  const canJoinMatch = (match: MatchUI): boolean => {
    const status = getMatchStatus(match)
    const allPlayers = getAllPlayers(match)
    return status === 'waiting' &&
      allPlayers.length < 4 &&
      !isUserInMatch(match) &&
      !!currentUserId
  }

  const canStartMatch = (match: MatchUI): boolean => {
    const status = getMatchStatus(match)
    const allPlayers = getAllPlayers(match)
    return status === 'waiting' &&
      allPlayers.length === 4 &&
      isUserInMatch(match)
  }

  return (
    <div className="space-y-4">
      <ScoreEntryDialog
        open={scoreDialogOpen}
        matchId={activeMatch?._id || ''}
        initialScores={activeMatch ? [activeMatch.teams[0].score, activeMatch.teams[1].score] : [0, 0]}
        onClose={() => setScoreDialogOpen(false)}
        handleSaveScores={handleUpdateScore}
      />

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t('quickMatches')}</h3>
        <Button
          onClick={handleCreateMatch}
          disabled={isCreating}
          className="bg-green-600 hover:bg-green-700"
        >
          {isCreating ? t('creating') : t('createMatch')}
        </Button>
      </div>

      {quickMatches.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            {t('noQuickMatches')}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quickMatches.map((match) => {
            const status = getMatchStatus(match)
            const allPlayers = getAllPlayers(match)

            return (
              <Card key={match._id} className="p-4">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm">
                      {t('match')} #{match._id?.slice(-6)}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          status === 'waiting' ? 'secondary' :
                            status === 'playing' ? 'default' :
                              'outline'
                        }
                      >
                        {t(status)}
                      </Badge>
                      <Badge variant="outline">
                        {allPlayers.length}/4
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Players Display */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('players')}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: 4 }).map((_, index) => {
                        const player = allPlayers[index]
                        return (
                          <div key={index} className="min-h-[60px] flex items-center">
                            {player ? (
                              <UserCard
                                user={player}
                                width="80%"
                              />
                            ) : (
                              <div className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500 text-sm">
                                {t('emptySlot')}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Match Results for Completed Matches */}
                  {status === 'completed' && match.teams && match.teams.length >= 2 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">{t('result')}</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm font-medium">
                              {(match.teams[0]?.players || []).map(p => p.username || p.nickname || p.email || 'Unknown').join(', ')}
                            </div>
                            <div className="text-lg font-bold">{match.teams[0]?.score || 0}</div>
                          </div>
                          <div className="text-gray-500">vs</div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {(match.teams[1]?.players || []).map(p => p.username || p.nickname || p.email || 'Unknown').join(', ')}
                            </div>
                            <div className="text-lg font-bold">{match.teams[1]?.score || 0}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {status === 'waiting' && (
                      <>
                        {canJoinMatch(match) && (
                          <Button
                            onClick={() => handleJoinMatch(match._id)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {t('joinMatch')}
                          </Button>
                        )}
                        {isUserInMatch(match) && (
                          <Button
                            onClick={() => handleLeaveMatch(match._id)}
                            size="sm"
                            variant="outline"
                          >
                            {t('leaveMatch')}
                          </Button>
                        )}
                        {canStartMatch(match) && (
                          <Button
                            onClick={() => handleStartMatch(match._id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {t('startMatch')}
                          </Button>
                        )}
                      </>
                    )}

                    {status === 'playing' && (
                      <Button
                        onClick={() => openScoreDialog(match)}
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        {t('enterScore')}
                      </Button>
                    )}

                    {status === 'completed' && isUserInMatch(match) && (
                      <Button
                        onClick={() => handleRematch(match._id)}
                        size="sm"
                        variant="outline"
                      >
                        {t('rematch')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}