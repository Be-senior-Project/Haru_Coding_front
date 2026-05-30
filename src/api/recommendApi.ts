import AsyncStorage from '@react-native-async-storage/async-storage';
import {api} from './apiFetch';
import {userApi} from './userApi';
import {statsApi} from './statsApi';

export interface PersonalizedRecommendation {
  weakTopicIds: string[];
  reason: string;
}

export async function getPersonalizedRecommendation(): Promise<PersonalizedRecommendation> {
  const [userProfile, stats, codingLevel, cotePreparedRaw] = await Promise.all([
    userApi.getMe(),
    statsApi.getMyStats(),
    AsyncStorage.getItem('codingLevel'),
    AsyncStorage.getItem('cotePrepared'),
  ]);

  const body = {
    userId: userProfile.id,
    level: userProfile.level,
    codingLevel: codingLevel ?? 'NONE',
    cotePrepared: cotePreparedRaw === 'true',
    preferredLanguage: userProfile.preferredLanguage ?? 'python',
    totalSolved: stats.totalSolved,
    correctCount: stats.correctCount,
    avgTimeSpentSec: 0,
    categoryStats: stats.categoryStats,
  };

  return api.post<PersonalizedRecommendation>('/api/recommend/personalized', body);
}
