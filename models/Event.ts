import mongoose from 'mongoose';
import { GAME_STYLE_VALUES } from '../types/gameStyle';
const { Schema, model, models } = mongoose;

const eventSchema = new Schema(
  {
    name: { type: String, required: true },
    club: { type: Schema.Types.ObjectId, ref: 'Club' },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['preparing', 'registration', 'arranging-matches', 'match-running', 'ended'],
      default: 'preparing',
    },
    visibility: {
      type: String,
      enum: ['private', 'public-view', 'public-join'],
      default: 'private',
    },
    registrationEndTime: { type: Date, required: false },
    playDate: { type: Date, required: false },
    gymInfo: { type: String },
    gameStyle: {
      type: String,
      enum: GAME_STYLE_VALUES,
    },
    maxPoint: { type: Number },
    courtCount: { type: Number },
  },
  { timestamps: true },
);

export default models.Event || model('Event', eventSchema);
