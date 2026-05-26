import React, {useMemo, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {problemSets, type Problem} from '../data/mockProblems';
import {useTheme, type Colors} from '../theme/ThemeContext';

const DIFFICULTY_COLOR: Record<string, string> = {
  초급: '#4CAF50',
  중급: '#FF9800',
  고급: '#F44336',
};

const TYPE_LABEL: Record<string, string> = {
  multiple_choice: '객관식',
  fill_blank: '빈칸',
  word_match: '매칭',
  short_answer: '단답형',
};

// 모든 세트에서 문제 flat하게 추출 + 세트 ID 매핑
const allProblemsWithSetId = problemSets.flatMap(set =>
  set.problems.map(p => ({...p, setId: set.id})),
);

export default function ProblemBankScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedTopic, setSelectedTopic] = useState('전체');
  const topics = ['전체', '알고리즘', '자료구조', '개념', '언어/문법'];
  const insets = useSafeAreaInsets();
  const {colors, fontScale} = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);

  const filtered =
    selectedTopic === '전체'
      ? allProblemsWithSetId
      : allProblemsWithSetId.filter(p => p.topic === selectedTopic);

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
            <Text style={[styles.filterText, selectedTopic === t && styles.filterTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>해당 토픽의 문제가 없어요</Text>
        </View>
      ) : (
        filtered.map(p => (
          <TouchableOpacity
            key={p.id}
            style={styles.problemCard}
            onPress={() => navigation.navigate('ProblemSolve', {setId: p.setId})}>
            <View style={styles.cardTop}>
              <View style={styles.badges}>
                <View style={[styles.badge, {backgroundColor: DIFFICULTY_COLOR[p.difficulty] + '22'}]}>
                  <Text style={[styles.badgeText, {color: DIFFICULTY_COLOR[p.difficulty]}]}>
                    {p.difficulty}
                  </Text>
                </View>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{TYPE_LABEL[p.type]}</Text>
                </View>
              </View>
              <Text style={styles.topicText}>{p.topic}</Text>
            </View>
            <Text style={styles.problemTitle}>{p.title}</Text>
            <Text style={styles.problemQuestion} numberOfLines={2}>{p.question}</Text>
          </TouchableOpacity>
        ))
      )}
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
      paddingHorizontal: 14, paddingVertical: 8,
      borderRadius: 20, backgroundColor: c.filterInactive, marginRight: 8,
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
      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    },
    typeBadgeText: {fontSize: 11 * fs, color: '#2979FF', fontWeight: '600'},
    topicText: {fontSize: 11 * fs, color: c.subText},
    problemTitle: {fontSize: 15 * fs, fontWeight: '700', color: c.text, marginBottom: 4},
    problemQuestion: {fontSize: 13 * fs, color: c.subText, lineHeight: 20 * fs},
    emptyBox: {alignItems: 'center', paddingVertical: 40},
    emptyText: {fontSize: 14 * fs, color: c.subText},
  });
}
