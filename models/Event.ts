import mongoose from 'mongoose';
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
    location: { type: String },
    gameStyle: { type: String },
    maxPoint: { type: Number },
    courtCount: { type: Number },
    umpires: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

export default models.Event || model('Event', eventSchema);
