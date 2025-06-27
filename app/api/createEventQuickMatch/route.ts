import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth';
import connect from '../../../utils/mongoose';
import Match from '../../../models/Match';
import Event from '../../../models/Event';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { eventId, rematchFrom, swapPartners } = await request.json();
  
  if (!eventId) {
    return NextResponse.json({ success: false, error: 'Event ID is required' }, { status: 400 });
  }

  await connect();

  // Verify event exists and user is participant
  const event = await Event.findById(eventId);
  if (!event) {
    return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
  }

  // Check if user is participant in the event
  const isParticipant = event.participants.some((p: any) => p.toString() === session.user.id);
  if (!isParticipant) {
    return NextResponse.json({ success: false, error: 'Must be event participant' }, { status: 403 });
  }

  // Check if user already has a waiting quick match
  const existingMatch = await Match.findOne({
    event: eventId,
    isQuickMatch: true,
    $or: [
      { 'teams.0.players': session.user.id },
      { 'teams.1.players': session.user.id }
    ]
  });

  if (existingMatch && existingMatch.teams.some((team: any) => team.score === 0)) {
    return NextResponse.json({ 
      success: false, 
      error: 'Already in an active match' 
    }, { status: 400 });
  }

  let playersFromRematch: string[] = [];
  if (rematchFrom) {
    // Get players from original match for rematch
    const originalMatch = await Match.findById(rematchFrom);
    if (originalMatch && originalMatch.isQuickMatch) {
      // Get all players from both teams
      let allPlayers = [
        ...originalMatch.teams[0].players,
        ...originalMatch.teams[1].players
      ];
      
      // If swapPartners is true, swap partners
      if (swapPartners && allPlayers.length === 4) {
        // Original teams: [P1, P2] vs [P3, P4]
        // Swap to: [P1, P3] vs [P2, P4]
        allPlayers = [
          allPlayers[0], // P1
          allPlayers[2], // P3
          allPlayers[1], // P2
          allPlayers[3]  // P4
        ];
      }
      
      playersFromRematch = allPlayers;
    }
  }

  // Create new quick match
  // For waiting state, put all players in team 0 until match starts
  const initialPlayers = playersFromRematch.length > 0 ? playersFromRematch : [session.user.id];
  
  const quickMatch = new Match({
    event: eventId,
    round: 0, // Use 0 for quick matches
    court: 0, // Use 0 for quick matches 
    group: 0, // Use 0 for quick matches
    isQuickMatch: true,
    teams: [
      { players: initialPlayers, score: 0 }, // Waiting players go here
      { players: [], score: 0 } // Empty until match starts
    ]
  });

  await quickMatch.save();

  // Populate the response with user details
  await quickMatch.populate('teams.0.players', 'username nickname email image');
  await quickMatch.populate('teams.1.players', 'username nickname email image');

  return NextResponse.json(quickMatch);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { matchId, action } = await request.json();
  
  if (!matchId || !action) {
    return NextResponse.json({ 
      success: false, 
      error: 'Match ID and action are required' 
    }, { status: 400 });
  }

  await connect();

  const quickMatch = await Match.findById(matchId);
  if (!quickMatch || !quickMatch.isQuickMatch) {
    return NextResponse.json({ success: false, error: 'Quick match not found' }, { status: 404 });
  }

  const userId = session.user.id;
  const totalPlayers = quickMatch.teams[0].players.length + quickMatch.teams[1].players.length;
  const isUserInMatch = quickMatch.teams[0].players.some((p: any) => p.toString() === userId) ||
                       quickMatch.teams[1].players.some((p: any) => p.toString() === userId);

  switch (action) {
    case 'join':
      // Check if user can join
      if (totalPlayers >= 4) {
        return NextResponse.json({ 
          success: false, 
          error: 'Match is full' 
        }, { status: 400 });
      }

      if (isUserInMatch) {
        return NextResponse.json({ 
          success: false, 
          error: 'Already in this match' 
        }, { status: 400 });
      }

      // Check if user is already in another active quick match
      const existingMatch = await Match.findOne({
        event: quickMatch.event,
        isQuickMatch: true,
        _id: { $ne: matchId },
        $or: [
          { 'teams.0.players': userId },
          { 'teams.1.players': userId }
        ]
      });

      if (existingMatch && existingMatch.teams.some((team: any) => team.score === 0)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Already in another active match' 
        }, { status: 400 });
      }

      // Add user to waiting team (team 0)
      quickMatch.teams[0].players.push(userId);
      break;

    case 'leave':
      if (!isUserInMatch) {
        return NextResponse.json({ 
          success: false, 
          error: 'Not in this match' 
        }, { status: 400 });
      }

      // Check if match has started (both teams have players)
      if (quickMatch.teams[1].players.length > 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Cannot leave - match already started' 
        }, { status: 400 });
      }

      // Remove user from team 0
      const playerIndex = quickMatch.teams[0].players.findIndex((p: any) => p.toString() === userId);
      if (playerIndex !== -1) {
        quickMatch.teams[0].players.splice(playerIndex, 1);
      }
      
      // If no players left, delete the match
      if (quickMatch.teams[0].players.length === 0) {
        await Match.findByIdAndDelete(matchId);
        return NextResponse.json({ success: true, deleted: true });
      }
      break;

    case 'start':
      if (!isUserInMatch) {
        return NextResponse.json({ 
          success: false, 
          error: 'Not in this match' 
        }, { status: 403 });
      }

      if (quickMatch.teams[1].players.length > 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Match already started' 
        }, { status: 400 });
      }

      if (quickMatch.teams[0].players.length < 4) {
        return NextResponse.json({ 
          success: false, 
          error: 'Need 4 players to start' 
        }, { status: 400 });
      }

      // Randomly assign teams
      const shuffledPlayers = [...quickMatch.teams[0].players].sort(() => Math.random() - 0.5);
      quickMatch.teams[0].players = shuffledPlayers.slice(0, 2);
      quickMatch.teams[1].players = shuffledPlayers.slice(2, 4);
      break;

    case 'complete':
      if (!isUserInMatch) {
        return NextResponse.json({ 
          success: false, 
          error: 'Not in this match' 
        }, { status: 403 });
      }

      if (quickMatch.teams[1].players.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Match not started yet' 
        }, { status: 400 });
      }

      // Mark match as completed
      // If no scores exist, set default completion scores
      if (quickMatch.teams[0].score === 0 && quickMatch.teams[1].score === 0) {
        quickMatch.teams[0].score = 21;
        quickMatch.teams[1].score = 19;
      } else {
        // If scores already exist, ensure at least one team has a winning score
        const team1Score = quickMatch.teams[0].score;
        const team2Score = quickMatch.teams[1].score;
        
        // If neither team has reached 21 points, set the higher scoring team to 21
        if (team1Score < 21 && team2Score < 21) {
          if (team1Score >= team2Score) {
            quickMatch.teams[0].score = Math.max(21, team1Score);
          } else {
            quickMatch.teams[1].score = Math.max(21, team2Score);
          }
        }
      }
      break;

    default:
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid action' 
      }, { status: 400 });
  }

  await quickMatch.save();
  await quickMatch.populate('teams.0.players', 'username nickname email image');
  await quickMatch.populate('teams.1.players', 'username nickname email image');

  return NextResponse.json(quickMatch);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const eventId = url.searchParams.get('eventId');
  
  if (!eventId) {
    return NextResponse.json({ success: false, error: 'Event ID is required' }, { status: 400 });
  }

  await connect();

  const quickMatches = await Match.find({ 
    event: eventId, 
    isQuickMatch: true 
  })
    .populate('teams.0.players', 'username nickname email image')
    .populate('teams.1.players', 'username nickname email image')
    .sort({ createdAt: -1 });

  return NextResponse.json(quickMatches);
}