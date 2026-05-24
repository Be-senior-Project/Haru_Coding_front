import React, {useCallback, useMemo, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme, type Colors} from '../theme/ThemeContext';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {statsApi, type StatsData} from '../api/statsApi';

const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const PERIOD_OPTIONS = ['주별', '월별', '전체'] as const;
type Period = typeof PERIOD_OPTIONS[number];

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const {colors, fontScale} = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);

  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('전체');
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('주별');

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, []),
  );

  const loadStats = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    setHasToken(!!token);
    if (!token) return;

    setLoading(true);
    try {
      const data = await statsApi.getMyStats();
      setStats(data);
    } catch (e) {
      console.error('통계 로드 실패', e);
    } finally {
      setLoading(false);
    }
  };

  // 토픽 필터 목록 (API 데이터 기반으로 동적 생성)
  const topicOptions = useMemo(() => {
    if (!stats) return ['전체'];
    return ['전체', ...stats.categoryStats.map(c => c.topicName)];
  }, [stats]);

  // 필터링된 카테고리 통계
  const filteredCategories = useMemo(() => {
    if (!stats) return [];
    if (selectedTopic === '전체') return stats.categoryStats;
    return stats.categoryStats.filter(c => c.topicName === selectedTopic);
  }, [stats, selectedTopic]);

  // 기간별 바 차트 데이터
  const barData = useMemo(() => {
    if (!stats) return Array(7).fill(0);
    return stats.weeklyActivity;
  }, [stats]);

  const maxBar = Math.max(...barData, 1);

  if (loading) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color="#2979FF" />
      </View>
    );
  }

  if (!hasToken) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center', padding: 40}]}>
        <Text style={styles.emptyText}>로그인하면 학습 통계를 볼 수 있어요</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, {paddingTop: insets.top + 20}]}>
      <Text style={styles.title}>학습 통계</Text>

      {/* 토픽 필터 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {topicOptions.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.filterBtn, selectedTopic === t && styles.filterActive]}
            onPress={() => setSelectedTopic(t)}>
            <Text style={[styles.filterText, selectedTopic === t && styles.filterTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 기간 필터 */}
      <View style={styles.periodRow}>
        {PERIOD_OPTIONS.map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, selectedPeriod === p && styles.periodActive]}
            onPress={() => setSelectedPeriod(p)}>
            <Text style={[styles.periodText, selectedPeriod === p && styles.periodTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 요약 카드 */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>총 문제 수</Text>
            <Text style={styles.summaryValue}>
              {stats?.totalSolved ?? 0} <Text style={styles.summaryUnit}>개</Text>
            </Text>
            <Text style={styles.summaryAccuracy}>정답률 {stats?.accuracyRate ?? 0}%</Text>
          </View>
        </View>

        {/* 바 차트 */}
        <View style={styles.barChart}>
          {barData.map((h, i) => (
            <View key={i} style={styles.barWrapper}>
              <View style={[
                styles.bar,
                {
                  height: Math.max((h / maxBar) * 80, 4),
                  backgroundColor: i === new Date().getDay() - 1 ? '#2979FF' : '#BBDEFB',
                },
              ]} />
              <Text style={styles.barLabel}>{WEEK_DAYS[i]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 지표 카드 */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>정답률</Text>
          <Text style={styles.metricValue}>{stats?.accuracyRate ?? 0}%</Text>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, {width: `${stats?.accuracyRate ?? 0}%`, backgroundColor: '#2979FF'}]} />
          </View>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>연속 학습</Text>
          <Text style={styles.metricValue}>{stats?.currentStreak ?? 0}일</Text>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, {width: `${Math.min((stats?.currentStreak ?? 0) * 10, 100)}%`, backgroundColor: '#FF9800'}]} />
          </View>
        </View>
      </View>

      {/* 주제별 성취도 */}
      <Text style={styles.sectionTitle}>주제별 성취도</Text>
      {filteredCategories.length === 0 ? (
        <Text style={styles.emptyText}>아직 푼 문제가 없어요</Text>
      ) : (
        filteredCategories.map(cat => (
          <View key={cat.topicId} style={styles.topicRow}>
            <View style={styles.topicIconBox}>
              <Text style={styles.topicIcon}>{getTopicIcon(cat.topicName)}</Text>
            </View>
            <View style={styles.topicInfo}>
              <View style={styles.topicLabelRow}>
                <Text style={styles.topicLabel}>{cat.topicName}</Text>
                <Text style={styles.topicPct}>{cat.accuracyRate.toFixed(1)}%</Text>
              </View>
              <View style={styles.topicBarBg}>
                <View style={[styles.topicBarFill, {width: `${cat.accuracyRate}%`}]} />
              </View>
              <Text style={styles.topicSub}>{cat.correctCount}/{cat.totalSolved} 정답</Text>
            </View>
          </View>
        ))
      )}

      {/* 최근 활동 */}
      {stats && stats.recentRecords.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, {marginTop: 20}]}>최근 활동</Text>
          {stats.recentRecords.map((r, i) => (
            <View key={i} style={styles.recentItem}>
              <Text style={[styles.recentIcon, {color: r.isCorrect ? '#4CAF50' : '#F44336'}]}>
                {r.isCorrect ? '✓' : '✗'}
              </Text>
              <View style={styles.recentInfo}>
                <Text style={styles.recentTitle}>{r.problemTitle}</Text>
                <Text style={styles.recentMeta}>{r.topic} · {formatDate(r.solvedAt)}</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

function getTopicIcon(name: string): string {
  const map: Record<string, string> = {
    '알고리즘': '{}', '자료구조': '#', '언어/문법': '</>', '모의테스트': '📝',
  };
  return map[name] ?? '📚';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function makeStyles(c: Colors, fs: number) {
  return StyleSheet.create({
    container: {flex: 1, backgroundColor: c.bg},
    content: {padding: 20, paddingBottom: 40},
    title: {fontSize: 20 * fs, fontWeight: '700', color: c.text, marginBottom: 16},
    filterScroll: {marginBottom: 12},
    filterBtn: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: c.filterInactive, marginRight: 8},
    filterActive: {backgroundColor: '#2979FF'},
    filterText: {fontSize: 13 * fs, color: c.subText},
    filterTextActive: {color: '#FFF', fontWeight: '600'},
    periodRow: {flexDirection: 'row', gap: 6, marginBottom: 16},
    periodBtn: {paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: c.filterInactive},
    periodActive: {backgroundColor: '#1E3A5F'},
    periodText: {fontSize: 13 * fs, color: c.subText},
    periodTextActive: {color: '#FFF'},
    summaryCard: {backgroundColor: c.card, borderRadius: 14, padding: 16, marginBottom: 16, elevation: 2},
    summaryRow: {marginBottom: 12},
    summaryItem: {},
    summaryLabel: {fontSize: 12 * fs, color: c.subText},
    summaryValue: {fontSize: 28 * fs, fontWeight: '700', color: c.text},
    summaryUnit: {fontSize: 16 * fs},
    summaryAccuracy: {fontSize: 12 * fs, color: '#4CAF50'},
    barChart: {flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 100, marginBottom: 8},
    barWrapper: {flex: 1, alignItems: 'center', gap: 4},
    bar: {width: '100%', borderRadius: 4},
    barLabel: {fontSize: 10 * fs, color: c.subText},
    metricsRow: {flexDirection: 'row', gap: 10, marginBottom: 20},
    metricCard: {flex: 1, backgroundColor: c.card, borderRadius: 12, padding: 14, elevation: 2},
    metricLabel: {fontSize: 12 * fs, color: c.subText, marginBottom: 4},
    metricValue: {fontSize: 20 * fs, fontWeight: '700', color: c.text, marginBottom: 8},
    metricBar: {height: 6, backgroundColor: c.border, borderRadius: 3, overflow: 'hidden'},
    metricFill: {height: '100%', borderRadius: 3},
    sectionTitle: {fontSize: 16 * fs, fontWeight: '700', color: c.text, marginBottom: 12},
    topicRow: {flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12},
    topicIconBox: {width: 36, height: 36, borderRadius: 8, backgroundColor: c.isDark ? '#1A1F3A' : '#EEF2FF', alignItems: 'center', justifyContent: 'center'},
    topicIcon: {fontSize: 16},
    topicInfo: {flex: 1},
    topicLabelRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4},
    topicLabel: {fontSize: 14 * fs, fontWeight: '600', color: c.text},
    topicPct: {fontSize: 13 * fs, color: c.subText},
    topicBarBg: {height: 6, backgroundColor: c.border, borderRadius: 3, overflow: 'hidden', marginBottom: 4},
    topicBarFill: {height: '100%', backgroundColor: '#4CAF50', borderRadius: 3},
    topicSub: {fontSize: 11 * fs, color: c.subText},
    recentItem: {flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 10, padding: 14, marginBottom: 8, gap: 12},
    recentIcon: {fontSize: 18, fontWeight: '700', width: 24, textAlign: 'center'},
    recentInfo: {flex: 1},
    recentTitle: {fontSize: 14 * fs, fontWeight: '600', color: c.text},
    recentMeta: {fontSize: 12 * fs, color: c.subText, marginTop: 2},
    emptyText: {fontSize: 14 * fs, color: c.subText, textAlign: 'center'},
  });
}
