import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const passwordResetSchema = new Schema({
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 },
});

export default models.PasswordReset || model('PasswordReset', passwordResetSchema);
