import {api} from './apiFetch';

export interface UserProfile {
  id: number;
  nickname: string;
  email: string;
  profileImageUrl?: string;
  level: number;
  xp: number;
  streakDays: number;
  totalSolved: number;
  correctCount: number;
  accuracyRate: number;
  preferredLanguage?: string;
}

export const userApi = {
  getMe: () => api.get<UserProfile>('/api/users/me'),

  updateMe: (data: {nickname?: string; preferredLanguage?: string; fcmToken?: string}) =>
    api.patch<UserProfile>('/api/users/me', data),
};
