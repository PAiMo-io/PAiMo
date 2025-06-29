import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/app/constants/i18n';
export interface IUser {
    username?: string;
    email: string;
    gender?: string;
    nickname?: string;
    wechatId?: string;
    role?: 'super-admin' | 'admin' | 'member';
    clubs?: string[];
    image?: string;
    password?: string;
    level?: number;
    profileComplete?: boolean;
    emailVerified?: boolean;
    createProfile?: boolean;
    lang?: SupportedLanguage;
    avatarUpdatedAt?: Date | null; // Add this line
}

const userSchema = new Schema({
    username: { type: String },
    email: { type: String, required: true, unique: true },
    gender: { type: String },
    nickname: { type: String },
    wechatId: { type: String },
    role: {
        type: String,
        enum: ['super-admin', 'admin', 'member'],
        default: 'member',
    },
    clubs: [{ type: Schema.Types.ObjectId, ref: 'Club' }],
    image: { type: String },
    password: { type: String },
    level: { type: Number },
    profileComplete: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    createProfile: { type: Boolean, default: false },
    lang: { type: String, enum: SUPPORTED_LANGUAGES, default: 'en' },
    avatarUpdatedAt: { type: Date, default: null }, // Add this line
});

export default models.User || model('User', userSchema);
