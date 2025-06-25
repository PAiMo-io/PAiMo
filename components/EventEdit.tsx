'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'react-i18next'

export default function EventEdit() {
  const router = useRouter()
  const { t } = useTranslation('scheduler')
  const { data: session, status } = useSession()

  const [teamAPlayers, setTeamAPlayers] = useState<string>('')
  const [teamBPlayers, setTeamBPlayers] = useState<string>('')

  const [numCourts, setNumCourts] = useState<number>(6)
  const [maxRounds, setMaxRounds] = useState<number>(10)
  const [schedule, setSchedule] = useState<string[][][]>([])
  const [enableDupPair, setEnableDupPair] = useState<boolean>(false)
  const [scores, setScores] = useState<{ [key: string]: { teamAScore: number; teamBScore: number } }>({})
  const [clearDialogOpen, setClearDialogOpen] = useState<boolean>(false)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    if (session.user?.role !== 'admin' && session.user?.role !== 'super-admin') {
      router.push('/')
      return
    }
    const savedSchedule = localStorage.getItem('schedule')
    const savedScores = localStorage.getItem('scores')
    if (savedSchedule) {
      setSchedule(JSON.parse(savedSchedule))
    }
    if (savedScores) {
      setScores(JSON.parse(savedScores))
    }
  }, [status, session, router])

  const handlePlayerListChange = (team: 'A' | 'B', value: string) => {
    if (team === 'A') {
      setTeamAPlayers(value)
    } else {
      setTeamBPlayers(value)
    }
  }

  const handleScoreChange = (id: string, team: 'A' | 'B', value: number) => {
    setScores(prevScores => {
      const newScores = {
        ...prevScores,
        [id]: {
          ...prevScores[id],
          [`team${team}Score`]: value,
        },
      }
      localStorage.setItem('scores', JSON.stringify(newScores))
      return newScores
    })
  }

  const handleOpenClearDialog = () => {
    setClearDialogOpen(true)
  }

  const handleCloseClearDialog = () => {
    setClearDialogOpen(false)
  }

  const handleSubmit = async () => {
    const teamAList = teamAPlayers.split('\n').filter(name => name.trim() !== '')
    const teamBList = teamBPlayers.split('\n').filter(name => name.trim() !== '')

    if (teamAList.length !== teamBList.length) {
      setError('Both teams must have the same number of players.')
      return
    }

    setError(null)

    try {
      const response = await axios.post('/api/schedule', {
        team_a_players: teamAList,
        team_b_players: teamBList,
        num_courts: numCourts,
        max_rounds: maxRounds,
        enableDupPair: enableDupPair,
      })
      const generatedSchedule = response.data
      setSchedule(generatedSchedule)
      localStorage.setItem('schedule', JSON.stringify(generatedSchedule))
    } catch (error) {
      console.error(error)
    }
  }

  const handleClearSchedule = () => {
    setSchedule([])
    localStorage.removeItem('schedule')
    localStorage.removeItem('scores')
  }

  const teamAPlayerCount = teamAPlayers.split('\n').filter(name => name.trim() !== '').length
  const teamBPlayerCount = teamBPlayers.split('\n').filter(name => name.trim() !== '').length

  const rows = schedule.flatMap((round, roundIndex) =>
    round.map((match, matchIndex) => {
      const id = `${roundIndex}-${matchIndex}`
      return {
        id,
        round: roundIndex + 1,
        court: matchIndex + 1,
        teamA: `${match[0][0]} & ${match[0][1]}`,
        teamB: `${match[1][0]} & ${match[1][1]}`,
        teamAScore: scores[id]?.teamAScore ?? 0,
        teamBScore: scores[id]?.teamBScore ?? 0,
      }
    }),
  )

  const totalTeamAScore = Object.values(scores).reduce((total, score) => total + (score.teamAScore || 0), 0)
  const totalTeamBScore = Object.values(scores).reduce((total, score) => total + (score.teamBScore || 0), 0)
  const teamAscoreDifference = totalTeamAScore - totalTeamBScore
  const teamBscoreDifference = totalTeamBScore - totalTeamAScore

  return (
    <div className="max-w-screen-md mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>
      <div className="grid md:grid-cols-12 gap-4">
        <div className="md:col-span-9 space-y-2">
          <Textarea
            placeholder={t('teamAListPlaceholder')}
            value={teamAPlayers}
            onChange={e => handlePlayerListChange('A', e.target.value)}
            className="min-h-32"
          />
          <p className="text-sm text-muted-foreground">{t('teamACount', { count: teamAPlayerCount })}</p>
          <Textarea
            placeholder={t('teamBListPlaceholder')}
            value={teamBPlayers}
            onChange={e => handlePlayerListChange('B', e.target.value)}
            className="min-h-32"
          />
          <p className="text-sm text-muted-foreground">{t('teamBCount', { count: teamBPlayerCount })}</p>
        </div>
        <div className="md:col-span-3 space-y-2">
          <Input
            type="number"
            placeholder={t('numCourtsPlaceholder')}
            value={numCourts}
            onChange={e => setNumCourts(parseInt(e.target.value, 10))}
          />
          <Input
            type="number"
            placeholder={t('maxRoundsPlaceholder')}
            value={maxRounds}
            onChange={e => setMaxRounds(parseInt(e.target.value, 10))}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center space-x-4">
        <Button onClick={handleSubmit}>{t('generateMatch')}</Button>
        <Button variant="destructive" onClick={handleOpenClearDialog} className="flex items-center">
          <Trash2 className="mr-2 h-4 w-4" /> {t('clearMatch')}
        </Button>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={enableDupPair} onChange={e => setEnableDupPair(e.target.checked)} />
          <span>{t('duplicatePairEnable')}</span>
        </label>
      </div>
      {clearDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 rounded-md space-y-4 w-80">
            <h2 className="text-lg font-medium">{t('confirmClearTitle')}</h2>
            <p>{t('confirmClearMessage')}</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCloseClearDialog}>{t('cancel')}</Button>
              <Button variant="destructive" onClick={handleClearSchedule}>{t('clearMatch')}</Button>
            </div>
          </div>
        </div>
      )}
      <div className="mt-4 max-w-sm">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">{t('scoreType')}</th>
              <th className="p-2">{t('teamA')}</th>
              <th className="p-2">{t('teamB')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">{t('totalScore')}</td>
              <td className="border p-2 text-center">{totalTeamAScore}</td>
              <td className="border p-2 text-center">{totalTeamBScore}</td>
            </tr>
            <tr>
              <td className="border p-2">{t('scoreDiff')}</td>
              <td className="border p-2 text-center">{teamAscoreDifference}</td>
              <td className="border p-2 text-center">{teamBscoreDifference}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4 overflow-x-auto" style={{ height: '600px' }}>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">{t('round')}</th>
              <th className="p-2">{t('court')}</th>
              <th className="p-2">{t('teamA')}</th>
              <th className="p-2">{t('teamB')}</th>
              <th className="p-2">{t('teamAScore')}</th>
              <th className="p-2">{t('teamBScore')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className={row.round % 2 === 1 ? 'round-bg-1' : ''}>
                <td className="border p-2 text-center">{row.round}</td>
                <td className="border p-2 text-center">{row.court}</td>
                <td className="border p-2">{row.teamA}</td>
                <td className="border p-2">{row.teamB}</td>
                <td className="border p-2 text-center">
                  <Input type="number" className="no-outline w-20" value={scores[row.id]?.teamAScore ?? 0} onChange={e => handleScoreChange(row.id, 'A', parseInt(e.target.value, 10))} />
                </td>
                <td className="border p-2 text-center">
                  <Input type="number" className="no-outline w-20" value={scores[row.id]?.teamBScore ?? 0} onChange={e => handleScoreChange(row.id, 'B', parseInt(e.target.value, 10))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

