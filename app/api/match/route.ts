// api/match/route.ts
// app/api/match/route.ts
import { NextResponse } from 'next/server'
import connect from '@/utils/mongoose'
import Match from '@/models/Match'

export async function GET(request: Request) {
    const url = new URL(request.url)
    const eventId = url.searchParams.get('eventId')
    if (!eventId) {
        return NextResponse.json({ error: 'Missing `eventId` query parameter' }, { status: 400 })
    }

    try {
        await connect()
        const matches = await Match.find({ event: eventId })
            .populate({ path: 'teams.players', select: 'username' })
            .sort({ group: 1, round: 1, court: 1 })
        return NextResponse.json({ matches })
    } catch (err: any) {
        console.error('fetch-matches error', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    /**
     * Expected JSON:
     * { matchId: string, scores: [number, number] }
     */
    let body: { matchId?: string; scores?: [number, number] }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { matchId, scores } = body
    if (!matchId || !Array.isArray(scores) || scores.length !== 2) {
        return NextResponse.json(
            { error: 'Required fields: matchId (string), scores (array of 2 numbers)' },
            { status: 400 }
        )
    }

    try {
        await connect()
        await Match.updateOne(
            { _id: matchId },
            {
                'teams.0.score': scores[0],
                'teams.1.score': scores[1]
            }
        )
        const updated = await Match.findById(matchId).populate({ path: 'teams.players', select: 'username' })
        if (!updated) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 })
        }
        return NextResponse.json({ match: updated })
    } catch (err: any) {
        console.error('update-match error', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    /**
     * Expected JSON:
     * { eventId: string }
     */
    let body: { eventId?: string }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { eventId } = body
    if (!eventId) {
        return NextResponse.json({ error: 'Required field: eventId (string)' }, { status: 400 })
    }

    try {
        await connect()
        const { deletedCount } = await Match.deleteMany({ event: eventId })
        return NextResponse.json({ deletedCount })
    } catch (err: any) {
        console.error('delete-matches error', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
