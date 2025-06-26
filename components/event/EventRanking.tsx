'use client'

import { useEffect, useState } from 'react'
import UserCard from '@/components/UserCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { useApi } from '@/lib/useApi'

interface RankingData {
  user: {
    id: string
    username: string
    email: string
    image?: string
  }
  wins: number
  losses: number
  totalScore: number
  totalScoreMargin: number
  matchesPlayed: number
  winRate: number
  averageScore: number
}

interface EventRankingProps {
  eventId: string
}

export default function EventRanking({ eventId }: EventRankingProps) {
  const { t } = useTranslation('common')
  const { request } = useApi()
  const [rankings, setRankings] = useState<RankingData[]>([])
  const [loading, setLoading] = useState(true)
  const [eventInfo, setEventInfo] = useState<{
    eventName: string
    totalParticipants: number
    totalMatches: number
  } | null>(null)

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true)
        const response = await request<{
          rankings: RankingData[]
          eventName: string
          totalParticipants: number
          totalMatches: number
        }>({
          url: `/api/eventRanking?eventId=${eventId}`,
          method: 'get'
        })
        
        setRankings(response.rankings)
        setEventInfo({
          eventName: response.eventName,
          totalParticipants: response.totalParticipants,
          totalMatches: response.totalMatches
        })
      } catch (error) {
        console.error('Failed to fetch event ranking:', error)
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchRankings()
    }
  }, [eventId, request])

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">{t('ranking')}</h1>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">{t('ranking')}</h1>
        {eventInfo && (
          <div className="flex gap-2">
            <Badge variant="outline">{eventInfo.totalParticipants} {t('participants')}</Badge>
            <Badge variant="outline">{eventInfo.totalMatches} {t('matches')}</Badge>
          </div>
        )}
      </div>

      {rankings.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            {t('noResultsYet')}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rankings.map((ranking, index) => (
            <Card key={ranking.user.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-sm">
                    #{index + 1}
                  </div>
                  <UserCard user={ranking.user} />
                </div>
                
                <div className="flex items-center space-x-6 text-sm">
                  {ranking.matchesPlayed > 0 ? (
                    <>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{ranking.wins}W</div>
                        <div className="text-xs text-gray-500">{t('wins')}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-semibold text-red-600">{ranking.losses}L</div>
                        <div className="text-xs text-gray-500">{t('losses')}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-semibold">{ranking.winRate.toFixed(1)}%</div>
                        <div className="text-xs text-gray-500">{t('winRate')}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-semibold">{ranking.totalScore}</div>
                        <div className="text-xs text-gray-500">{t('totalScore')}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-semibold">{ranking.totalScoreMargin}</div>
                        <div className="text-xs text-gray-500">{t('scoreMargin')}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-semibold">{ranking.averageScore.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">{t('avgScore')}</div>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500 text-sm">{t('noMatchesPlayed')}</div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
