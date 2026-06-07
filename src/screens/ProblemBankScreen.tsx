import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {problemSets} from '../data/mockProblems';
import {problemApi} from '../api/problemApi';
import type {Problem} from '../types/problem';
import {TYPE_LABEL, difficultyLabel, difficultyColor} from '../types/problem';
import {useTheme, type Colors} from '../theme/ThemeContext';

// 화면에서 다루는 통합 카드 모델 (실/목 공통)
type Card = Problem & {demoSetId?: string};

// 목 폴백: 모든 세트 문제 flat + 데모 세트 ID
const mockCards: Card[] = problemSets.flatMap(set =>
  set.problems.map(p => ({...p, demoSetId: set.id})),
);

export default function ProblemBankScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const {colors, fontScale} = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);

  const [cards, setCards] = useState<Card[]>(mockCards);
  const [isReal, setIsReal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('전체');

  useEffect(() => {
    let alive = true;
    problemApi
      .list({limit: 100})
      .then(list => {
        if (alive && list.length > 0) {
          setCards(list);
          setIsReal(true);
        }
      })
      .catch(() => {
        /* 실패 시 목 데이터 유지 */
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(
    () => ['전체', ...Array.from(new Set(cards.map(c => c.category)))],
    [cards],
  );

  const filtered =
    selectedCategory === '전체'
      ? cards
      : cards.filter(c => c.category === selectedCategory);

  const openProblem = (c: Card) => {
    if (isReal) navigation.navigate('ProblemSolve', {problemId: c.id});
    else navigation.navigate('ProblemSolve', {setId: c.demoSetId});
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, {paddingTop: insets.top + 20}]}>
      <Text style={styles.title}>문제 은행</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {categories.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.filterBtn, selectedCategory === t && styles.filterActive]}
            onPress={() => setSelectedCategory(t)}>
            <Text style={[styles.filterText, selectedCategory === t && styles.filterTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color="#2979FF" style={{marginTop: 32}} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>해당 카테고리의 문제가 없어요</Text>
        </View>
      ) : (
        filtered.map(c => (
          <TouchableOpacity key={c.id} style={styles.problemCard} onPress={() => openProblem(c)}>
            <View style={styles.cardTop}>
              <View style={styles.badges}>
                <View style={[styles.badge, {backgroundColor: difficultyColor(c.difficulty) + '22'}]}>
                  <Text style={[styles.badgeText, {color: difficultyColor(c.difficulty)}]}>
                    {difficultyLabel(c.difficulty)}
                  </Text>
                </View>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{TYPE_LABEL[c.type]}</Text>
                </View>
              </View>
              <Text style={styles.topicText}>{c.subcategory ?? c.category}</Text>
            </View>
            <Text style={styles.problemTitle}>{c.title}</Text>
            <Text style={styles.problemQuestion} numberOfLines={2}>{c.description}</Text>
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
