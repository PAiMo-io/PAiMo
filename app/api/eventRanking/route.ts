import { NextResponse } from 'next/server';
import connect from '../../../utils/mongoose';
import Event from '../../../models/Event';
import Match from '../../../models/Match';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const eventId = url.searchParams.get('eventId');
  
  if (!eventId) {
    return NextResponse.json({ success: false, error: 'Event ID is required' }, { status: 400 });
  }

  await connect();

  try {
    // Get event with participants
    const event = await Event.findById(eventId).populate('participants', 'username email image avatarUpdatedAt');
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    // Get all matches for this event (both regular and quick matches)
    const matches = await Match.find({ event: eventId })
      .populate('teams.0.players', 'username email image avatarUpdatedAt')
      .populate('teams.1.players', 'username email image avatarUpdatedAt');

    // Calculate ranking for each participant
    const rankingMap: Record<string, {
      user: any;
      wins: number;
      losses: number;
      totalScore: number;
      totalScoreMargin: number;
      matchesPlayed: number;
    }> = {};

    // Initialize all participants
    event.participants.forEach((participant: any) => {
      const userId = participant._id.toString();
      rankingMap[userId] = {
        user: {
          id: userId,
          username: participant.username || participant.email,
          email: participant.email,
          image: participant.image,
          avatarUpdatedAt: participant.avatarUpdatedAt
        },
        wins: 0,
        losses: 0,
        totalScore: 0,
        totalScoreMargin: 0,
        matchesPlayed: 0
      };
    });

    // Process matches to calculate stats
    matches.forEach(match => {
      const [team1, team2] = match.teams;
      
      // Only process completed matches (where at least one team has scored)
      if (team1.score > 0 || team2.score > 0) {
        const scoreMargin = Math.abs(team1.score - team2.score);
        
        // Process team 1 players
        team1.players.forEach((player: any) => {
          const userId = player._id.toString();
          if (rankingMap[userId]) {
            rankingMap[userId].totalScore += team1.score;
            rankingMap[userId].matchesPlayed += 1;
            
            if (team1.score > team2.score) {
              rankingMap[userId].wins += 1;
              rankingMap[userId].totalScoreMargin += scoreMargin;
            } else if (team1.score < team2.score) {
              rankingMap[userId].losses += 1;
            }
          }
        });

        // Process team 2 players
        team2.players.forEach((player: any) => {
          const userId = player._id.toString();
          if (rankingMap[userId]) {
            rankingMap[userId].totalScore += team2.score;
            rankingMap[userId].matchesPlayed += 1;
            
            if (team2.score > team1.score) {
              rankingMap[userId].wins += 1;
              rankingMap[userId].totalScoreMargin += scoreMargin;
            } else if (team2.score < team1.score) {
              rankingMap[userId].losses += 1;
            }
          }
        });
      }
    });

    // Convert to array and sort by ranking criteria
    const rankings = Object.values(rankingMap).map(stats => ({
      ...stats,
      winRate: stats.matchesPlayed > 0 ? (stats.wins / stats.matchesPlayed) * 100 : 0,
      averageScore: stats.matchesPlayed > 0 ? stats.totalScore / stats.matchesPlayed : 0
    }));

    // Sort by: 1) Win rate, 2) Total score margin, 3) Total score, 4) Matches played
    rankings.sort((a, b) => {
      if (a.winRate !== b.winRate) return b.winRate - a.winRate;
      if (a.totalScoreMargin !== b.totalScoreMargin) return b.totalScoreMargin - a.totalScoreMargin;
      if (a.totalScore !== b.totalScore) return b.totalScore - a.totalScore;
      return b.matchesPlayed - a.matchesPlayed;
    });

    return NextResponse.json({ 
      success: true, 
      rankings,
      eventName: event.name,
      totalParticipants: event.participants.length,
      totalMatches: matches.length
    });

  } catch (error) {
    console.error('Error fetching event ranking:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch event ranking' 
    }, { status: 500 });
  }
}