import mongoose from 'mongoose'
const { Schema, model, models } = mongoose

const optionSchema = new Schema({
  text: String,
  score: Number,
})

const questionSchema = new Schema({
  question: String,
  order: Number,
  options: [optionSchema],
})

const partSchema = new Schema({
  club: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
  name: { type: String, required: true },
  order: Number,
  weight: { type: Number, default: 1 },
  multiplier: { type: Number, default: 1 },
  questions: [questionSchema],
})

export default models.PlacementPart || model('PlacementPart', partSchema)
