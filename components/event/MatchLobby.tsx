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
import { Shuffle } from 'lucide-react'
import UserMiniCard from '../UserMiniCard'

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
	disabled?: boolean
}

export default function MatchLobby({
	eventId,
	currentUserId,
	quickMatches,
	onRefresh,
	disabled = false
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

	const handleCompleteMatch = async (matchId: string) => {
		try {
			await request({
				url: '/api/createEventQuickMatch',
				method: 'put',
				data: { matchId, action: 'complete' }
			})
			onRefresh()
		} catch (error) {
			console.error('Failed to complete match:', error)
		}
	}

	const handleSwapAndRematch = async (originalMatchId: string) => {
		try {
			await request({
				url: '/api/createEventQuickMatch',
				method: 'post',
				data: { eventId, rematchFrom: originalMatchId, swapPartners: true }
			})
			onRefresh()
		} catch (error) {
			console.error('Failed to create swap rematch:', error)
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

		// Check if match is manually completed
		const team1Score = match.teams[0]?.score || 0
		const team2Score = match.teams[1]?.score || 0

		// Consider completed if:
		// 1. Default API completion scores (21-19 or 19-21)
		// 2. Both teams have scores and one team has reached a winning score (21+)
		// 3. Both teams have scores and there's a significant point difference (10+ points)
		if ((team1Score === 21 && team2Score === 19) || (team1Score === 19 && team2Score === 21)) {
			return 'completed'
		}

		// Also consider completed if either team has 21+ points (standard badminton win)
		if (team1Score >= 21 || team2Score >= 21) {
			return 'completed'
		}

		// Or if both teams have scores and there's a large gap (indicates manual completion)
		if ((team1Score > 0 || team2Score > 0) && Math.abs(team1Score - team2Score) >= 10) {
			return 'completed'
		}

		// If both teams have players but not completed, it's playing
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
				image: p.image || null,
				avatarUpdatedAt: (p as any).avatarUpdatedAt || null
			}))
		} else {
			// In playing/completed state, players are in both teams
			return [
				...(match.teams[0]?.players || []).map(p => ({
					id: (p as any)._id || (p as any).id || '',
					username: p.username || p.nickname || p.email || 'Unknown',
					image: p.image || null,
					avatarUpdatedAt: (p as any).avatarUpdatedAt || null
				})),
				...(match.teams[1]?.players || []).map(p => ({
					id: (p as any)._id || (p as any).id || '',
					username: p.username || p.nickname || p.email || 'Unknown',
					image: p.image || null,
					avatarUpdatedAt: (p as any).avatarUpdatedAt || null
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

	// Check if user is already in an incomplete match
	const isUserInIncompleteMatch = (): boolean => {
		if (!currentUserId) return false
		
		return quickMatches.some(match => {
			const status = getMatchStatus(match)
			const isInMatch = isUserInMatch(match)
			return isInMatch && status !== 'completed'
		})
	}

	console.log('MatchLobby', {
		eventId,
		currentUserId,
		quickMatches,
		isCreating,
		scoreDialogOpen,
		activeMatch,
		disabled,
		isUserInIncompleteMatch: isUserInIncompleteMatch()
	})

	return (
		<div className="space-y-4">
			<ScoreEntryDialog
				open={scoreDialogOpen}
				matchId={activeMatch?._id || ''}
				initialScores={activeMatch ? [activeMatch.teams[0].score, activeMatch.teams[1].score] : [0, 0]}
				teams={activeMatch?.teams as [any, any] | undefined}
				onClose={() => setScoreDialogOpen(false)}
				handleSaveScores={handleUpdateScore}
			/>

			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold">{t('quickMatches')}</h3>
				<Button
					onClick={handleCreateMatch}
					disabled={isCreating || disabled || isUserInIncompleteMatch()}
					className="bg-green-600"
				>
					{t('createMatch')}
				</Button>
			</div>

			{quickMatches.length === 0 ? (
				<Card>
					<CardContent className="p-6 text-center text-gray-500">
						{t('noQuickMatches')}
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 w-full">
					{quickMatches.map((match) => {
						const status = getMatchStatus(match)
						const allPlayers = getAllPlayers(match)

						return (
							<Card key={match._id} className="p-1">
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

								<CardContent className="space-y-4 w-full">
									{/* Teams Display */}
									<div className='w-full'>
										<h4 className="text-sm font-medium mb-2">{t('players')}</h4>
										{status === 'waiting' ? (
											<div className="grid grid-cols-2 gap-2 w-full">
												{Array.from({ length: 4 }).map((_, index) => {
													const player = allPlayers[index]
													return (
														<div key={index} className="flex-1 items-center">
															{player ? (
																<UserMiniCard
																	user={player}
																/>
															) : (
																<div className="w-full h-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500 text-sm">
																	{t('emptySlot')}
																</div>
															)}
														</div>
													)
												})}
											</div>
										) : (
											<div className="flex w-full gap-2">
												{/* Team 1 */}
												<div className="flex flex-col gap-2 flex-1 min-w-0 overflow-hidden">
													{(match.teams?.[0]?.players || []).map((player, index) => (
														<UserMiniCard
															key={index}
															user={{
																id: (player as any)._id || (player as any).id || '',
																username: player.username || player.nickname || player.email || 'Unknown',
																image: player.image || null,
																avatarUpdatedAt: (player as any).avatarUpdatedAt || null
															}}
														/>
													))}
													{/* Team 1 Score */}
													<div className="text-center mt-2">
														<div className="text-xl font-bold">{match.teams?.[0]?.score || 0}</div>
													</div>
												</div>

												{/* VS Separator */}
												<div className="flex-col items-center justify-center px-1 flex-shrink-0">
													<div className="text-sm font-bold text-gray-500">VS</div>
												</div>

												{/* Team 2 */}
												<div className="flex flex-col gap-2 flex-1 min-w-0 overflow-hidden">
													{(match.teams?.[1]?.players || []).map((player, index) => (
														<UserMiniCard
															key={index}
															user={{
																id: (player as any)._id || (player as any).id || '',
																username: player.username || player.nickname || player.email || 'Unknown',
																image: player.image || null,
																avatarUpdatedAt: (player as any).avatarUpdatedAt || null
															}}
															className="w-full max-w-full"
														/>
													))}
													{/* Team 2 Score */}
													<div className="text-center mt-2">
														<div className="text-xl font-bold">{match.teams?.[1]?.score || 0}</div>
													</div>
												</div>
											</div>
										)}
									</div>

									{/* Action Buttons */}
									<div className="flex flex-wrap gap-2">
										{status === 'waiting' && (
											<>
												{canJoinMatch(match) && (
													<Button
														onClick={() => handleJoinMatch(match._id)}
														size="sm"
														className="bg-blue-600 hover:bg-blue-700"
														disabled={disabled}
													>
														{t('joinMatch')}
													</Button>
												)}
												{isUserInMatch(match) && (
													<Button
														onClick={() => handleLeaveMatch(match._id)}
														size="sm"
														variant="outline"
														disabled={disabled}
													>
														{t('leaveMatch')}
													</Button>
												)}
												{canStartMatch(match) && (
													<Button
														onClick={() => handleStartMatch(match._id)}
														size="sm"
														className="bg-green-600 hover:bg-green-700"
														disabled={disabled}
													>
														{t('startMatch')}
													</Button>
												)}
											</>
										)}

										{status === 'playing' && (
											<>
												<Button
													onClick={() => openScoreDialog(match)}
													size="sm"
													className="bg-orange-600 hover:bg-orange-700"
													disabled={disabled}
												>
													{t('enterScore')}
												</Button>
												{isUserInMatch(match) && (
													<Button
														onClick={() => handleCompleteMatch(match._id)}
														size="sm"
														className="bg-green-600 hover:bg-green-700"
														disabled={disabled}
													>
														{t('completeMatch')}
													</Button>
												)}
											</>
										)}

										{status === 'completed' && isUserInMatch(match) && (
											<>
												<Button
													onClick={() => handleRematch(match._id)}
													size="sm"
													variant="outline"
													disabled={disabled}
												>
													{t('rematch')}
												</Button>
												<Button
													onClick={() => handleSwapAndRematch(match._id)}
													size="sm"
													variant="outline"
													className="flex flex-row items-center gap-1"
													disabled={disabled}
												>
													<Shuffle size={14} className="inline-block mr-2" />
													<span className="inline-block">{t('swapRematch')}</span>
												</Button>
											</>
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