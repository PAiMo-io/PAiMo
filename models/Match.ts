import mongoose, { Document, Schema } from 'mongoose';

interface ITeam {
  players: mongoose.Types.ObjectId[];  // exactly 2 players
  score: number;                       // default 0
}

export interface IMatch extends Document {
  event: mongoose.Types.ObjectId;      // reference to Event
  round: number;                       // numeric round
  court: number;
  group: number;                       // numeric court
  teams: [ITeam, ITeam];               // exactly two teams
  isQuickMatch?: boolean;              // flag to identify quick matches
}

const teamSchema = new Schema<ITeam>({
  players: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    required: true,
  },
  score: { type: Number, default: 0 }
});

const matchSchema = new Schema<IMatch>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true
    },
    round: {
      type: Number,
      required: true,
      index: true
    },
    group: {
      type: Number,
      required: true,
      index: true
    },
    court: {
      type: Number,
      required: true
    },
    teams: {
      type: [teamSchema],
      validate: {
        validator: (arr: any[]) => arr.length === 2,
        message: 'A match must have exactly 2 teams.'
      }
    },
    isQuickMatch: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true  // adds createdAt / updatedAt
  }
);

export default mongoose.models.Match ||
  mongoose.model<IMatch>('Match', matchSchema);