import mongoose from 'mongoose'
const { Schema, model, models } = mongoose

const optionSchema = new Schema({
  text: String,
  score: Number,
})

const placementQuestionSchema = new Schema({
  question: { type: String, required: true },
  order: Number,
  options: [optionSchema],
})

export default models.PlacementQuestion || model('PlacementQuestion', placementQuestionSchema)
