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
  placementClub?: string;
  placementScores?: { club: string; score: number }[];
  profileComplete?: boolean;
  placementComplete?: boolean;
  bypassPlacement?: boolean;
  lang?: SupportedLanguage;
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
  placementClub: { type: Schema.Types.ObjectId, ref: 'Club' },
  placementScores: {
    type: [
      {
        club: { type: Schema.Types.ObjectId, ref: 'Club' },
        score: Number,
      },
    ],
    default: [],
  },
  profileComplete: { type: Boolean, default: false },
  placementComplete: { type: Boolean, default: false },
  bypassPlacement: { type: Boolean, default: false },
  lang: { type: String, enum: SUPPORTED_LANGUAGES, default: 'en' },
});

export default models.User || model('User', userSchema);
