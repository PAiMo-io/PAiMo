import _ from 'lodash';
import { IUser } from '@/models/User';
import { Document, HydratedDocument, Types } from 'mongoose';
import { IMatch } from '@/models/Match';


export type UserDoc = HydratedDocument<IUser>;

/**
 * Doubles match between two teams of two users.
 */
export interface Match {
    group?: number;
    round: number;
    courtInGroup: number;
    team1: [UserDoc, UserDoc];
    team2: [UserDoc, UserDoc];
}

/**
 * Extracts a stable string ID from a user document.
 */
function getId(user: UserDoc): string {
    return user._id.toString();
}

/**
 * Bucket users by level into numCourts buckets of size 6 or 7.
 */
export function bucketUsers(
    users: UserDoc[],
    numCourts: number
): UserDoc[][] {
    const sorted = _.orderBy(users, ['level'], ['desc']);
    const n = sorted.length;
    const baseSize = Math.floor(n / numCourts);
    const extras = n % numCourts;

    if (baseSize < 6 || baseSize > 7 || baseSize + (extras ? 1 : 0) > 7) {
        throw new Error(
            `Cannot create ${numCourts} buckets of size 6 or 7 from ${n} users.`
        );
    }

    const buckets: UserDoc[][] = [];
    let idx = 0;
    for (let i = 0; i < numCourts; i++) {
        const size = baseSize + (i < extras ? 1 : 0);
        buckets.push(sorted.slice(idx, idx + size));
        idx += size;
    }
    return buckets;
}

/**
 * Merge every two buckets into one group.
 */
export function groupBuckets(buckets: UserDoc[][]): UserDoc[][] {
    const groups: UserDoc[][] = [];
    for (let i = 0; i < buckets.length; i += 2) {
        groups.push([...(buckets[i] ?? []), ...(buckets[i + 1] ?? [])]);
    }
    return groups;
}


export interface DrawUser extends IUser {
    _id: string
}

/**
 * A scheduled match matching the Mongoose schema (teams array with players & scores).
 */
export interface ScheduledMatch {
    round: number
    court: number
    teams: {
        players: string[]  // user IDs
        score: number
    }[]
}
/**
 * Schedule draws for one group of users, rotating partners as much as possible.
 */
export function scheduleDrawsForGroup(
    users: DrawUser[],
    matchesPerUser: number,
    courtsPerGroup = 1
): ScheduledMatch[] {
    const scheduled: ScheduledMatch[] = []
    const played: Record<string, number> = {}
    const partnerCounts: Record<string, number> = {}

    // init counters
    users.forEach(u => { played[u._id] = 0 })

    // choose two-person pairing with minimal prior partnerships
    function pickPair(four: DrawUser[]): [DrawUser, DrawUser] {
        let best: [DrawUser, DrawUser] = [four[0], four[1]]
        let minCount = Infinity
        for (let i = 0; i < four.length; i++) {
            for (let j = i + 1; j < four.length; j++) {
                const a = four[i]._id, b = four[j]._id
                const key = [a, b].sort().join('-')
                const cnt = partnerCounts[key] || 0
                if (cnt < minCount) { minCount = cnt; best = [four[i], four[j]] }
            }
        }
        return best
    }

    const totalSlots = users.length * matchesPerUser
    const slotsPerRound = courtsPerGroup * 4
    const rounds = Math.ceil(totalSlots / slotsPerRound)

    for (let round = 1; round <= rounds; round++) {
        const available = users.filter(u => played[u._id] < matchesPerUser)
        if (available.length < 4) break
        const pool = _.shuffle(available).slice(0, slotsPerRound)

        for (let court = 0; court < courtsPerGroup; court++) {
            const four = pool.slice(court * 4, court * 4 + 4)
            if (four.length < 4) break

            // form teams
            const [p1, p2] = pickPair(four)
            const remaining = four.filter(u => u._id !== p1._id && u._id !== p2._id)
            const [p3, p4] = remaining

            // update partner & played counts
            for (const [x, y] of [[p1, p2], [p3, p4]] as [DrawUser, DrawUser][]) {
                const key = [x._id, y._id].sort().join('-')
                partnerCounts[key] = (partnerCounts[key] || 0) + 1
                played[x._id]++
                played[y._id]++
            }

            scheduled.push({
                round,
                court,
                teams: [
                    { players: [p1._id, p2._id], score: 0 },
                    { players: [p3._id, p4._id], score: 0 }
                ]
            })
        }
    }

    return scheduled
}