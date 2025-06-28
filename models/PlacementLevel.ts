import mongoose from 'mongoose'
const { Schema, model, models } = mongoose

const levelSchema = new Schema({
  club: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  order: Number,
})

export default models.PlacementLevel || model('PlacementLevel', levelSchema)
