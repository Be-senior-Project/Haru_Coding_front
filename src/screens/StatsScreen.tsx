import React, {useMemo} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme, type Colors} from '../theme/ThemeContext';

const topics = [
  {icon: '{}', label: '배열과 문자열', progress: 100, status: 'Mastered'},
  {icon: '#', label: '해시 테이블', progress: 72, status: null},
  {icon: '→', label: '연결 리스트', progress: 45, status: null},
  {icon: '🌲', label: '트리/그래프', progress: 20, status: null},
];

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const {colors, fontScale} = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, {paddingTop: insets.top + 20}]}>
      <Text style={styles.title}>학습 통계</Text>

      <View style={styles.filterRow}>
        {['전체', '알고리즘', '자료구조', '문법'].map(f => (
          <View key={f} style={[styles.filterBtn, f === '전체' && styles.filterActive]}>
            <Text style={[styles.filterText, f === '전체' && styles.filterTextActive]}>{f}</Text>
          </View>
        ))}
      </View>

      <View style={styles.periodRow}>
        {['주별', '월별', '전체'].map(p => (
          <View key={p} style={[styles.periodBtn, p === '주별' && styles.periodActive]}>
            <Text style={[styles.periodText, p === '주별' && styles.periodTextActive]}>{p}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>총 문제 수</Text>
            <Text style={styles.summaryValue}>125 <Text style={styles.summaryUnit}>개</Text></Text>
            <Text style={styles.summaryDelta}>+12% vs 지난주</Text>
          </View>
        </View>
        <View style={styles.barChart}>
          {[30, 45, 20, 80, 55, 40, 65].map((h, i) => (
            <View key={i} style={styles.barWrapper}>
              <View style={[styles.bar, {height: h, backgroundColor: i === 3 ? '#2979FF' : '#BBDEFB'}]} />
              <Text style={styles.barLabel}>{['월', '화', '수', '목', '금', '토', '일'][i]}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.dateRange}>2026년 4월 13일 — 4월 19일</Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>평균 정답률</Text>
          <Text style={styles.metricValue}>88.5%</Text>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, {width: '88.5%', backgroundColor: '#2979FF'}]} />
          </View>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>학습 시간</Text>
          <Text style={styles.metricValue}>12h 40m</Text>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, {width: '70%', backgroundColor: '#4CAF50'}]} />
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>주제별 성취도</Text>
      {topics.map(t => (
        <View key={t.label} style={styles.topicRow}>
          <View style={styles.topicIconBox}>
            <Text style={styles.topicIcon}>{t.icon}</Text>
          </View>
          <View style={styles.topicInfo}>
            <View style={styles.topicLabelRow}>
              <Text style={styles.topicLabel}>{t.label}</Text>
              {t.status && <Text style={styles.masteredBadge}>{t.status}</Text>}
              {!t.status && <Text style={styles.topicPct}>{t.progress}%</Text>}
            </View>
            <View style={styles.topicBarBg}>
              <View
                style={[
                  styles.topicBarFill,
                  {width: `${t.progress}%`, backgroundColor: t.status ? '#2979FF' : '#4CAF50'},
                ]}
              />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function makeStyles(c: Colors, fs: number) {
  return StyleSheet.create({
    container: {flex: 1, backgroundColor: c.bg},
    content: {padding: 20, paddingBottom: 40},
    title: {fontSize: 20 * fs, fontWeight: '700', color: c.text, marginBottom: 16},
    filterRow: {flexDirection: 'row', gap: 8, marginBottom: 12},
    filterBtn: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: c.filterInactive},
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
    summaryDelta: {fontSize: 12 * fs, color: '#4CAF50'},
    barChart: {flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 90, marginBottom: 8},
    barWrapper: {flex: 1, alignItems: 'center', gap: 4},
    bar: {width: '100%', borderRadius: 4},
    barLabel: {fontSize: 10 * fs, color: c.subText},
    dateRange: {fontSize: 11 * fs, color: c.subText, textAlign: 'center'},
    metricsRow: {flexDirection: 'row', gap: 10, marginBottom: 20},
    metricCard: {flex: 1, backgroundColor: c.card, borderRadius: 12, padding: 14, elevation: 2},
    metricLabel: {fontSize: 12 * fs, color: c.subText, marginBottom: 4},
    metricValue: {fontSize: 20 * fs, fontWeight: '700', color: c.text, marginBottom: 8},
    metricBar: {height: 6, backgroundColor: c.border, borderRadius: 3, overflow: 'hidden'},
    metricFill: {height: '100%', borderRadius: 3},
    sectionTitle: {fontSize: 16 * fs, fontWeight: '700', color: c.text, marginBottom: 12},
    topicRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 8,
      gap: 12,
    },
    topicIconBox: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: c.isDark ? '#1A1F3A' : '#EEF2FF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    topicIcon: {fontSize: 16},
    topicInfo: {flex: 1},
    topicLabelRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6},
    topicLabel: {fontSize: 14 * fs, fontWeight: '600', color: c.text},
    masteredBadge: {fontSize: 11 * fs, color: '#2979FF', fontWeight: '600'},
    topicPct: {fontSize: 13 * fs, color: c.subText},
    topicBarBg: {height: 6, backgroundColor: c.border, borderRadius: 3, overflow: 'hidden'},
    topicBarFill: {height: '100%', borderRadius: 3},
  });
}
