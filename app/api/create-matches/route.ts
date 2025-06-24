// app/api/create-matches/route.ts
import { NextResponse } from 'next/server'
import connect from '@/utils/mongoose'
import Match from '@/models/Match'
import { DrawUser, ScheduledMatch, scheduleDrawsForGroup, UserDoc } from '@/utils/createDraws'


/**
 * Expected request payload:
 * {
 *   eventId: string,
 *   groups: IUser[][],
 *   matchesPerUser: number,
 *   courtsPerGroup?: number
 * }
 */
export async function POST(request: Request) {
    try {
        const {
            eventId,
            groups,
            matchesPerUser,
            courtsPerGroup,
        }: {
            eventId: string
            groups: DrawUser[][]
            matchesPerUser: number
            courtsPerGroup?: number
        } = await request.json()

        if (!eventId || !Array.isArray(groups) || typeof matchesPerUser !== 'number') {
            return NextResponse.json(
                {
                    error:
                        'Required fields: eventId (string), groups (array of user arrays), matchesPerUser (number)',
                },
                { status: 400 }
            )
        }

        await connect()

        const created: any[] = []

        // For each group of DrawUser, generate and persist matches
        for (let gi = 0; gi < groups.length; gi++) {
            const groupUsers: DrawUser[] = groups[gi]
            const schedule: ScheduledMatch[] = scheduleDrawsForGroup(
                groupUsers,
                matchesPerUser,
                courtsPerGroup
            )

            for (const m of schedule) {
                // m: { round, court, teams: [ { players, score }, { players, score } ] }
                let matchDoc = await Match.create({
                    event: eventId,
                    round: m.round,
                    group: gi,
                    court: m.court,
                    teams: m.teams,
                })

                matchDoc = await matchDoc.populate({
                    path: 'teams.players',
                    select: 'username',
                })

                created.push(matchDoc)
            }
        }

        return NextResponse.json({ matches: created })
    } catch (err: any) {
        console.error('create-matches error', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
