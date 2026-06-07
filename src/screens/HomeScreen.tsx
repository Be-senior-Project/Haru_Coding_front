import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {getTodaySet} from '../data/mockProblems';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme, type Colors} from '../theme/ThemeContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {recommendationApi, type RecommendationResponse} from '../api/recommendationApi';
import {statsApi, type RecentRecord} from '../api/statsApi';
import {TYPE_LABEL, difficultyLabel, difficultyColor} from '../types/problem';

// 데모용 가짜 최근 활동 (실 기록이 없을 때 표시)
const MOCK_RECENT: RecentRecord[] = [
  {problemId: -1, problemTitle: '짝수의 개수 세기', topic: 'Basic/Introductory', isCorrect: true, solvedAt: new Date(Date.now() - 2 * 3600000).toISOString()},
  {problemId: -2, problemTitle: '그래프의 연결 요소 개수', topic: 'DFS/BFS', isCorrect: false, solvedAt: new Date(Date.now() - 26 * 3600000).toISOString()},
  {problemId: -3, problemTitle: '피보나치 수 (DP)', topic: 'Dynamic Programming', isCorrect: true, solvedAt: new Date(Date.now() - 3 * 86400000).toISOString()},
  {problemId: -4, problemTitle: '배열의 합 구하기', topic: 'Basic/Introductory', isCorrect: true, solvedAt: new Date(Date.now() - 5 * 86400000).toISOString()},
];

// solvedAt(ISO) → "방금 전 / N시간 전 / N일 전"
function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

const TOPIC_ICONS: {label: string; icon: string; progress: number}[] = [
  {label: '알고리즘 마스터', icon: 'account-tree', progress: 45},
  {label: '자료구조 연구소', icon: 'data-object', progress: 72},
  {label: '언어 문법', icon: 'code', progress: 30},
  {label: '모의 테스트', icon: 'assignment', progress: 10},
];

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [streak, setStreak] = useState(0);
  const [todaySolved, setTodaySolved] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rec, setRec] = useState<RecommendationResponse | null>(null);
  const [recent, setRecent] = useState<RecentRecord[]>([]);
  const todaySet = getTodaySet();
  const insets = useSafeAreaInsets();
  const {colors, fontScale} = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const saved = await AsyncStorage.getItem('streak');
    const lastDate = await AsyncStorage.getItem('lastSolvedDate');
    const token = await AsyncStorage.getItem('accessToken');
    const today = new Date().toISOString().split('T')[0];
    if (saved) {setStreak(parseInt(saved, 10));}
    if (lastDate === today) {setTodaySolved(true);}
    setIsLoggedIn(!!token);
    if (token) {
      try {
        setRec(await recommendationApi.get(5));
      } catch {}
      try {
        const stats = await statsApi.getMyStats();
        setRecent(stats.recentRecords ?? []);
      } catch {}
    }
  };

  const handleStartSet = () => {
    if (!todaySet) {return;}
    navigation.navigate('ProblemSolve', {setId: todaySet.id, initialIndex: 0});
  };

  const summary = rec?.summary;
  // 실 기록이 있으면 사용, 없으면 데모용 가짜 데이터
  const displayRecent = recent.length > 0 ? recent : MOCK_RECENT;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, {paddingTop: insets.top + 20}]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.appName}>하루코딩</Text>
        {isLoggedIn ? (
          <View style={styles.streakBadge}>
            <MaterialCommunityIcons name="fire" size={18} color="#E65100" />
            <Text style={styles.streakText}>{streak}일</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.streakBadge} onPress={() => navigation.navigate('Login')}>
            <MaterialIcons name="lock" size={16} color={colors.subText} />
            <Text style={[styles.streakText, {color: colors.subText}]}>로그인</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 오늘의 세트 카드 (데모) */}
      {todaySet ? (
        <View style={styles.todayCard}>
          <Text style={styles.todayLabel}>오늘의 코딩 도전</Text>
          <View style={styles.difficultyBadge}>
            <Text style={[styles.difficultyText, {color: difficultyColor(todaySet.difficulty)}]}>
              ● {difficultyLabel(todaySet.difficulty)}
            </Text>
          </View>
          <Text style={styles.todayTitle}>{todaySet.title}</Text>

          <View style={styles.setInfoRow}>
            <View style={styles.setInfoItem}>
              <MaterialIcons name="format-list-numbered" size={14} color="#90B4CE" />
              <Text style={styles.setInfoText}>{todaySet.problems.length}문제</Text>
            </View>
            <View style={styles.setInfoItem}>
              <MaterialIcons name="topic" size={14} color="#90B4CE" />
              <Text style={styles.setInfoText}>
                {[...new Set(todaySet.problems.map(p => p.subcategory ?? p.category))].join(' · ')}
              </Text>
            </View>
          </View>

          <View style={styles.typeBadgeRow}>
            {todaySet.problems.map((p, i) => (
              <View key={i} style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{TYPE_LABEL[p.type]}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.solveButton, todaySolved && styles.solveButtonDone]}
            onPress={handleStartSet}>
            <View style={styles.solveButtonInner}>
              <MaterialIcons name={todaySolved ? 'check-circle' : 'emoji-events'} size={18} color="#FFF" />
              <Text style={styles.solveButtonText}>
                {todaySolved ? '완료 · 다시 풀기' : '세트 시작하기'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.todayCard}>
          <Text style={styles.todayLabel}>오늘의 세트가 아직 준비되지 않았어요</Text>
        </View>
      )}

      {/* 맞춤 추천 (역량 기반) — 데이터 없어도 섹션은 항상 노출 */}
      <Text style={styles.sectionTitle}>맞춤 추천</Text>
      {summary ? (
        <>
          {/* 역량 요약 미니 카드 */}
          <View style={styles.competencyCard}>
            <View style={styles.competencyRow}>
              <Competency label="추정 레벨" value={difficultyLabel(summary.estimatedLevel)} />
              <Competency label="정답률" value={`${summary.accuracyRate}%`} />
              <Competency label="푼 문제" value={`${summary.totalSolved}개`} />
            </View>
            {summary.weakAreas.length > 0 && (
              <View style={styles.chipRow}>
                <Text style={styles.chipCaption}>보완 필요</Text>
                {summary.weakAreas.slice(0, 3).map(w => (
                  <View key={w.area} style={styles.chip}>
                    <Text style={styles.chipText}>{w.area}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* 추천 문제 카드 */}
          {rec && rec.recommendations.length > 0 ? (
            rec.recommendations.map(r => (
              <TouchableOpacity
                key={r.problemId}
                style={styles.recCard}
                onPress={() => navigation.navigate('ProblemSolve', {problemId: r.problemId})}>
                <View style={styles.recTop}>
                  <View style={styles.recBadges}>
                    <View style={[styles.recBadge, {backgroundColor: difficultyColor(r.difficulty) + '22'}]}>
                      <Text style={[styles.recBadgeText, {color: difficultyColor(r.difficulty)}]}>
                        {difficultyLabel(r.difficulty)}
                      </Text>
                    </View>
                    <View style={styles.recTypeBadge}>
                      <Text style={styles.recTypeText}>{TYPE_LABEL[r.type]}</Text>
                    </View>
                    {r.review && (
                      <View style={styles.reviewBadge}>
                        <Text style={styles.reviewBadgeText}>복습</Text>
                      </View>
                    )}
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={colors.subText} />
                </View>
                <Text style={styles.recTitle}>{r.title}</Text>
                <View style={styles.recReasonRow}>
                  <MaterialIcons name="lightbulb" size={14} color="#FFC107" />
                  <Text style={styles.recReason}>{r.reason}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.recEmpty}>
              <Text style={styles.recEmptyText}>문제를 풀면 맞춤 추천이 시작돼요</Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.competencyEmpty}>
          <MaterialIcons name="insights" size={28} color="#2979FF" />
          <Text style={styles.competencyEmptyTitle}>문제를 풀면 역량을 평가해드려요</Text>
          <Text style={styles.competencyEmptyDesc}>
            {isLoggedIn
              ? '문제를 풀수록 약점을 분석해 맞춤 문제를 추천해드려요.'
              : '로그인하고 문제를 풀면 맞춤 추천이 시작돼요.'}
          </Text>
          {!isLoggedIn && (
            <TouchableOpacity
              style={styles.competencyEmptyBtn}
              onPress={() => navigation.navigate('Login')}>
              <Text style={styles.competencyEmptyBtnText}>로그인하기</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 주제 탐색 */}
      <Text style={styles.sectionTitle}>주제 탐색</Text>
      <View style={styles.topicGrid}>
        {TOPIC_ICONS.map(topic => (
          <View key={topic.label} style={styles.topicCard}>
            <MaterialIcons name={topic.icon} size={24} color="#2979FF" style={styles.topicIcon} />
            <Text style={styles.topicLabel}>{topic.label}</Text>
            <Text style={styles.topicProgress}>{topic.progress}% 완료</Text>
          </View>
        ))}
      </View>

      {/* 최근 활동 */}
      {displayRecent.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>최근 활동</Text>
          {displayRecent.map((r, i) => (
            <View key={i} style={styles.activityItem}>
              <MaterialIcons
                name={r.isCorrect ? 'check-circle' : 'cancel'}
                size={22}
                color={r.isCorrect ? '#4CAF50' : '#F44336'}
                style={styles.activityIcon}
              />
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle} numberOfLines={1}>{r.problemTitle}</Text>
                <Text style={styles.activityMeta}>{r.topic} · {formatRelative(r.solvedAt)}</Text>
              </View>
            </View>
          ))}
        </>
      )}

      {/* 비로그인 안내 */}
      {!isLoggedIn && (
        <TouchableOpacity style={styles.loginBanner} onPress={() => navigation.navigate('Login')}>
          <MaterialIcons name="lock" size={20} color={colors.subText} />
          <Text style={styles.loginBannerText}>로그인하면 맞춤 추천과 학습 기록을 볼 수 있어요</Text>
          <MaterialIcons name="chevron-right" size={20} color={colors.subText} />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function Competency({label, value}: {label: string; value: string}) {
  const {colors, fontScale} = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);
  return (
    <View style={styles.competencyItem}>
      <Text style={styles.competencyValue}>{value}</Text>
      <Text style={styles.competencyLabel}>{label}</Text>
    </View>
  );
}

function makeStyles(c: Colors, fs: number) {
  return StyleSheet.create({
    container: {flex: 1, backgroundColor: c.bg},
    content: {padding: 20, paddingBottom: 40},
    header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20},
    appName: {fontSize: 22 * fs, fontWeight: '700', color: c.text},
    streakBadge: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.isDark ? '#2A1A00' : '#FFF3E0',
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4,
    },
    streakText: {fontSize: 14 * fs, fontWeight: '700', color: '#E65100'},
    todayCard: {backgroundColor: '#1E3A5F', borderRadius: 16, padding: 20, marginBottom: 24},
    todayLabel: {fontSize: 12 * fs, color: '#90B4CE', marginBottom: 6},
    difficultyBadge: {marginBottom: 8},
    difficultyText: {fontSize: 13 * fs, fontWeight: '600'},
    todayTitle: {fontSize: 18 * fs, fontWeight: '700', color: '#FFFFFF', marginBottom: 10},
    setInfoRow: {flexDirection: 'row', gap: 16, marginBottom: 12},
    setInfoItem: {flexDirection: 'row', alignItems: 'center', gap: 4},
    setInfoText: {fontSize: 12 * fs, color: '#90B4CE'},
    typeBadgeRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16},
    typeBadge: {backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3},
    typeBadgeText: {fontSize: 11 * fs, color: '#B0CDE4', fontWeight: '600'},
    solveButton: {backgroundColor: '#2979FF', borderRadius: 10, paddingVertical: 14, alignItems: 'center'},
    solveButtonDone: {backgroundColor: '#4CAF50'},
    solveButtonInner: {flexDirection: 'row', alignItems: 'center', gap: 8},
    solveButtonText: {color: '#FFFFFF', fontWeight: '700', fontSize: 15 * fs},
    sectionTitle: {fontSize: 16 * fs, fontWeight: '700', color: c.text, marginBottom: 12},

    // 역량 요약
    competencyCard: {
      backgroundColor: c.card, borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2,
    },
    competencyRow: {flexDirection: 'row', justifyContent: 'space-around'},
    competencyItem: {alignItems: 'center', gap: 2},
    competencyValue: {fontSize: 18 * fs, fontWeight: '800', color: c.text},
    competencyLabel: {fontSize: 11 * fs, color: c.subText},
    chipRow: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 14},
    chipCaption: {fontSize: 11 * fs, color: c.subText, marginRight: 2},
    chip: {
      backgroundColor: 'rgba(255,112,67,0.14)', borderRadius: 6,
      paddingHorizontal: 8, paddingVertical: 3,
    },
    chipText: {fontSize: 11 * fs, fontWeight: '700', color: '#FF7043'},

    // 추천 문제 카드
    recCard: {
      backgroundColor: c.card, borderRadius: 14, padding: 16, marginBottom: 10,
      borderLeftWidth: 3, borderLeftColor: '#2979FF', elevation: 1,
    },
    recTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
    recBadges: {flexDirection: 'row', gap: 6, alignItems: 'center'},
    recBadge: {paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6},
    recBadgeText: {fontSize: 11 * fs, fontWeight: '600'},
    recTypeBadge: {
      backgroundColor: c.isDark ? '#1A1F3A' : '#EEF2FF',
      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    },
    recTypeText: {fontSize: 11 * fs, color: '#2979FF', fontWeight: '600'},
    reviewBadge: {
      backgroundColor: 'rgba(255,152,0,0.16)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    },
    reviewBadgeText: {fontSize: 11 * fs, color: '#FB8C00', fontWeight: '700'},
    recTitle: {fontSize: 15 * fs, fontWeight: '700', color: c.text, marginBottom: 6},
    recReasonRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 6},
    recReason: {flex: 1, fontSize: 12 * fs, color: c.subText, lineHeight: 18 * fs},
    recEmpty: {backgroundColor: c.card, borderRadius: 12, padding: 20, marginBottom: 12, alignItems: 'center'},
    recEmptyText: {fontSize: 13 * fs, color: c.subText},

    // 역량 평가 빈 상태
    competencyEmpty: {
      backgroundColor: c.card, borderRadius: 14, padding: 24, marginBottom: 24,
      alignItems: 'center', gap: 6,
      borderWidth: 1, borderColor: c.border, borderStyle: 'dashed',
    },
    competencyEmptyTitle: {fontSize: 15 * fs, fontWeight: '700', color: c.text, marginTop: 4},
    competencyEmptyDesc: {fontSize: 13 * fs, color: c.subText, textAlign: 'center', lineHeight: 19 * fs},
    competencyEmptyBtn: {
      marginTop: 10, backgroundColor: '#2979FF', borderRadius: 10,
      paddingVertical: 10, paddingHorizontal: 28,
    },
    competencyEmptyBtnText: {color: '#FFF', fontWeight: '700', fontSize: 14 * fs},

    // 주제 탐색
    topicGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24, marginTop: 12},
    topicCard: {
      width: '47%', backgroundColor: c.card, borderRadius: 12, padding: 16,
      shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    topicIcon: {marginBottom: 6},
    topicLabel: {fontSize: 13 * fs, fontWeight: '600', color: c.text, marginBottom: 4},
    topicProgress: {fontSize: 11 * fs, color: c.subText},

    loginBanner: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: c.card,
      borderRadius: 10, padding: 16, gap: 10,
    },
    loginBannerText: {flex: 1, fontSize: 13 * fs, color: c.subText},

    // 최근 활동
    activityItem: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: c.card,
      borderRadius: 10, padding: 14, marginBottom: 8,
    },
    activityIcon: {marginRight: 12},
    activityInfo: {flex: 1},
    activityTitle: {fontSize: 14 * fs, fontWeight: '600', color: c.text},
    activityMeta: {fontSize: 12 * fs, color: c.subText, marginTop: 2},
  });
}
