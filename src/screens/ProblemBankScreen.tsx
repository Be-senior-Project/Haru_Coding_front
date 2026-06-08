import React, {useMemo, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {problemSets} from '../data/mockProblems';
import {TYPE_LABEL, difficultyLabel, difficultyColor} from '../types/problem';
import {useTheme, type Colors} from '../theme/ThemeContext';

// 새 스키마 category/subcategory → 한글 토픽 라벨 (원본 UI 느낌)
const TOPIC_KO: Record<string, string> = {
  'Basic/Introductory': '기초/입문',
  'Algorithm/Data Structure': '알고리즘',
  'Past Exam Prep': '기출 대비',
  'DFS/BFS': '그래프 탐색',
  'Dynamic Programming': '동적 계획법',
};
const ko = (s?: string | null): string => (s ? TOPIC_KO[s] ?? s : '');

// 더미 데이터: 모든 세트 문제 flat + 데모 세트 ID
const allProblems = problemSets.flatMap(set =>
  set.problems.map(p => ({...p, demoSetId: set.id})),
);

export default function ProblemBankScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedTopic, setSelectedTopic] = useState('전체');
  const insets = useSafeAreaInsets();
  const {colors, fontScale} = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);

  const topics = useMemo(
    () => ['전체', ...Array.from(new Set(allProblems.map(p => ko(p.category))))],
    [],
  );

  const filtered =
    selectedTopic === '전체'
      ? allProblems
      : allProblems.filter(p => ko(p.category) === selectedTopic);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, {paddingTop: insets.top + 20}]}>
      <Text style={styles.title}>문제 은행</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {topics.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.filterBtn, selectedTopic === t && styles.filterActive]}
            onPress={() => setSelectedTopic(t)}>
            <Text style={[styles.filterText, selectedTopic === t && styles.filterTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.map(p => (
        <TouchableOpacity
          key={p.id}
          style={styles.problemCard}
          onPress={() => navigation.navigate('ProblemSolve', {setId: p.demoSetId})}>
          <View style={styles.cardTop}>
            <View style={styles.badges}>
              <View style={[styles.badge, {backgroundColor: difficultyColor(p.difficulty) + '22'}]}>
                <Text style={[styles.badgeText, {color: difficultyColor(p.difficulty)}]}>
                  {difficultyLabel(p.difficulty)}
                </Text>
              </View>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{TYPE_LABEL[p.type]}</Text>
              </View>
            </View>
            <Text style={styles.topicText}>{ko(p.subcategory) || ko(p.category)}</Text>
          </View>
          <Text style={styles.problemTitle}>{p.title}</Text>
          <Text style={styles.problemQuestion} numberOfLines={2}>{p.description}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function makeStyles(c: Colors, fs: number) {
  return StyleSheet.create({
    container: {flex: 1, backgroundColor: c.bg},
    content: {padding: 20, paddingBottom: 40},
    title: {fontSize: 20 * fs, fontWeight: '700', color: c.text, marginBottom: 16},
    filterScroll: {marginBottom: 16},
    filterBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: c.filterInactive,
      marginRight: 8,
    },
    filterActive: {backgroundColor: '#2979FF'},
    filterText: {fontSize: 13 * fs, color: c.subText},
    filterTextActive: {color: '#FFF', fontWeight: '600'},
    problemCard: {backgroundColor: c.card, borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2},
    cardTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
    badges: {flexDirection: 'row', gap: 6},
    badge: {paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6},
    badgeText: {fontSize: 11 * fs, fontWeight: '600'},
    typeBadge: {
      backgroundColor: c.isDark ? '#1A1F3A' : '#EEF2FF',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    typeBadgeText: {fontSize: 11 * fs, color: '#2979FF', fontWeight: '600'},
    topicText: {fontSize: 11 * fs, color: c.subText},
    problemTitle: {fontSize: 15 * fs, fontWeight: '700', color: c.text, marginBottom: 4},
    problemQuestion: {fontSize: 13 * fs, color: c.subText, lineHeight: 20 * fs},
  });
}
