'use client'

import UserCard from '@/components/UserCard'
import { MatchUI } from '@/components/MatchesScheduleSection'

export default function EventRanking({ matches }: { matches: MatchUI[] }) {
  const rankingMap: Record<string, { user: any; margin: number }> = {}

  matches.forEach(match => {
    const [a, b] = match.teams
    if (a.score !== b.score) {
      const winning = a.score > b.score ? a : b
      const margin = Math.abs(a.score - b.score)
      winning.players.forEach((p: any) => {
        const pid = p.id
        if (!rankingMap[pid]) {
          rankingMap[pid] = { user: p, margin: 0 }
        }
        rankingMap[pid].margin += margin
      })
    }
  })

  const ranking = Object.values(rankingMap).sort((x, y) => y.margin - x.margin)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Ranking</h1>
      <div className="space-y-2">
        {ranking.length === 0 ? (
          <p>No results yet.</p>
        ) : (
          ranking.map(r => (
            <div key={r.user.id} className="flex justify-between items-center">
              <UserCard user={r.user} />
              <span className="font-semibold">{r.margin}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
