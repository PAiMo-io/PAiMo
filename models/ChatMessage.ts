import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const chatMessageSchema = new Schema({
    clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderNickname: { type: String, required: true },
    senderAvatarUrl: { type: String },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

export default models.ChatMessage || model('ChatMessage', chatMessageSchema);
