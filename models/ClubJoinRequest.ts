import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const clubJoinRequestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
});

// ensure a user can only have one pending join request for a club
clubJoinRequestSchema.index({ userId: 1, clubId: 1, status: 1 }, { 
  unique: true,
  partialFilterExpression: { status: 'pending' }
});

export default models.ClubJoinRequest || model('ClubJoinRequest', clubJoinRequestSchema); 