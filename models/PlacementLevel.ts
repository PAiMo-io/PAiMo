import mongoose from 'mongoose'
const { Schema, model, models } = mongoose

const levelSchema = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  order: Number,
})

export default models.PlacementLevel || model('PlacementLevel', levelSchema)
