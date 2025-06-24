import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { IUser } from '@/models/User'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import ScoreEntryDialog from './event/ScoreEntryDialog'

interface Team {
    players: IUser[]
    score: number
}

export interface MatchUI {
    _id: string
    group: number
    round: number
    court: number
    teams: [Team, Team]
}

interface MatchesScheduleSectionProps {
    matches: MatchUI[],
    onScoreUpdated?: (matchId: string, score: [number, number]) => void
}

export default function MatchesScheduleSection({ matches, onScoreUpdated }: MatchesScheduleSectionProps) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [activeMatch, setActiveMatch] = useState<MatchUI | null>(null)

    // Group matches by group index
    const groupsMap: Record<number, MatchUI[]> = {}
    matches.forEach(match => {
        const { group } = match
        if (!groupsMap[group]) groupsMap[group] = []
        groupsMap[group].push(match)
    })

    const sortedGroupKeys = Object.keys(groupsMap)
        .map(k => Number(k))
        .sort((a, b) => a - b)

    // active tab state
    const [activeTab, setActiveTab] = useState<string>(String(sortedGroupKeys[0] || '0'))

    const openDialog = (match: MatchUI) => {
        if (!onScoreUpdated) return
        setActiveMatch(match)
        setDialogOpen(true)
    }

    const handleSaveScores = (matchId: string, scores: [number, number]) => {
        if (!activeMatch || !onScoreUpdated) return
        // update local state by emitting updated match
        onScoreUpdated(matchId, scores)
    }

    return (
        <div>

            <ScoreEntryDialog
                open={dialogOpen}
                matchId={activeMatch?._id || ''}
                initialScores={activeMatch ? [activeMatch.teams[0].score, activeMatch.teams[1].score] : [0, 0]}
                onClose={() => setDialogOpen(false)}
                handleSaveScores={handleSaveScores}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    {sortedGroupKeys.map(groupIdx => (
                        <TabsTrigger key={groupIdx} value={String(groupIdx)}>
                            Group {String.fromCharCode(65 + groupIdx)}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {sortedGroupKeys.map(groupIdx => {
                    const groupMatches = groupsMap[groupIdx].sort((a, b) => {
                        if (a.round !== b.round) return a.round - b.round
                        return a.court - b.court
                    })
                    return (
                        <TabsContent key={groupIdx} value={String(groupIdx)}>
                            <div className="grid grid-cols-1 gap-4">
                                {groupMatches.map(match => (
                                    <Card key={match._id} className="overflow-visible"
                                        onClick={() => openDialog(match)}>
                                        <CardHeader>
                                            <CardTitle>Round {match.round} — Court {match.court + 1}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between">
                                                <div className='flex-col items-start max-w-[40%]'>
                                                    <div className="font-medium">
                                                        {match.teams[0].players
                                                            .map(p => p.username || p.nickname || p.email)
                                                            .join(' & ')}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Score: {match.teams[0].score}</div>
                                                </div>
                                                <div className="self-center text-sm font-semibold">vs</div>
                                                <div className='flex-col items-start max-w-[40%]'>
                                                    <div className="font-medium">
                                                        {match.teams[1].players
                                                            .map(p => p.username || p.nickname || p.email)
                                                            .join(' & ')}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Score: {match.teams[1].score}</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    )
                })}
            </Tabs>
        </div >
    )
}
