import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const clubSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  location: String,
  createdBy: String,
  createdAt: { type: Date, default: Date.now },
  logoUrl: String,
  visibility: {
    type: String,
    enum: ['private', 'publicView', 'publicJoin'],
    default: 'private',
  },
  placementRequired: { type: Boolean, default: false },
  members: [
    {
      id: { type: Schema.Types.ObjectId, ref: 'User' },
      username: String,
    },
  ],
  adminList: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

export default models.Club || model('Club', clubSchema);
