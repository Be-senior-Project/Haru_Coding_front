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
import {getPersonalizedRecommendation, type PersonalizedRecommendation} from '../api/recommendApi';

const DIFFICULTY_COLOR: Record<string, string> = {
  입문: '#2196F3',
  초급: '#4CAF50',
  중급: '#FF9800',
  고급: '#F44336',
};

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
  const [recommendation, setRecommendation] = useState<PersonalizedRecommendation | null>(null);
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
        const rec = await getPersonalizedRecommendation();
        setRecommendation(rec);
      } catch {}
    }
  };

  const handleStartSet = () => {
    if (!todaySet) {return;}
    navigation.navigate('ProblemSolve', {setId: todaySet.id, initialIndex: 0});
  };

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

      {/* 오늘의 세트 카드 */}
      {todaySet ? (
        <View style={styles.todayCard}>
          <Text style={styles.todayLabel}>오늘의 코딩 도전</Text>
          <View style={styles.difficultyBadge}>
            <Text style={[styles.difficultyText, {color: DIFFICULTY_COLOR[todaySet.difficulty]}]}>
              ● {todaySet.difficulty}
            </Text>
          </View>
          <Text style={styles.todayTitle}>{todaySet.title}</Text>

          {/* 문제 수 + 토픽 미리보기 */}
          <View style={styles.setInfoRow}>
            <View style={styles.setInfoItem}>
              <MaterialIcons name="format-list-numbered" size={14} color="#90B4CE" />
              <Text style={styles.setInfoText}>{todaySet.problems.length}문제</Text>
            </View>
            <View style={styles.setInfoItem}>
              <MaterialIcons name="topic" size={14} color="#90B4CE" />
              <Text style={styles.setInfoText}>
                {[...new Set(todaySet.problems.map(p => p.topic))].join(' · ')}
              </Text>
            </View>
          </View>

          {/* 문제 유형 뱃지 */}
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

      {/* 오늘의 추천 */}
      {recommendation !== null && !!recommendation.weakTopicIds?.length && (
        <>
          <Text style={styles.sectionTitle}>오늘의 추천</Text>
          <View style={styles.recommendCard}>
            <View style={styles.recommendReasonRow}>
              <MaterialIcons name="lightbulb" size={16} color="#FFC107" />
              <Text style={styles.recommendReason}>{recommendation.reason}</Text>
            </View>
            {(recommendation.weakTopicIds ?? []).map(topicId => (
              <View key={topicId} style={styles.weakTopicBar}>
                <View style={styles.weakTopicLeft}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#FF7043" />
                  <Text style={styles.weakTopicName}>{TOPIC_NAME[topicId] ?? topicId}</Text>
                </View>
                <View style={styles.weakBadge}>
                  <Text style={styles.weakBadgeText}>보완 필요</Text>
                </View>
              </View>
            ))}
          </View>
        </>
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
      <Text style={styles.sectionTitle}>최근 활동</Text>
      {isLoggedIn ? (
        [{title: '유효한 괄호', topic: '스택', time: '9시간 전', correct: true},
         {title: 'K개 정렬된 리스트 병합', topic: '힙/정렬', time: '3일 전', correct: true}].map(item => (
          <View key={item.title} style={styles.activityItem}>
            <MaterialIcons
              name={item.correct ? 'check-circle' : 'cancel'}
              size={22}
              color={item.correct ? '#4CAF50' : '#F44336'}
              style={styles.activityIcon}
            />
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>{item.title}</Text>
              <Text style={styles.activityMeta}>{item.topic} · {item.time}</Text>
            </View>
          </View>
        ))
      ) : (
        <TouchableOpacity style={styles.loginBanner} onPress={() => navigation.navigate('Login')}>
          <MaterialIcons name="lock" size={20} color={colors.subText} />
          <Text style={styles.loginBannerText}>로그인하면 학습 기록을 볼 수 있어요</Text>
          <MaterialIcons name="chevron-right" size={20} color={colors.subText} />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const TYPE_LABEL: Record<string, string> = {
  multiple_choice: '객관식',
  fill_blank: '빈칸',
  word_match: '매칭',
  short_answer: '단답형',
};

const TOPIC_NAME: Record<string, string> = {
  ALGORITHM: '알고리즘',
  DATA_STRUCTURE: '자료구조',
  LANGUAGE: '언어 문법',
  MOCK_TEST: '모의 테스트',
  STACK: '스택',
  QUEUE: '큐',
  TREE: '트리',
  GRAPH: '그래프',
  SORT: '정렬',
  DP: '동적 프로그래밍',
  HASH: '해시',
  STRING: '문자열',
  GREEDY: '탐욕 알고리즘',
  BFS: '너비 우선 탐색',
  DFS: '깊이 우선 탐색',
  BINARY_SEARCH: '이진 탐색',
};

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
    topicGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24},
    topicCard: {
      width: '47%', backgroundColor: c.card, borderRadius: 12, padding: 16,
      shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    topicIcon: {marginBottom: 6},
    topicLabel: {fontSize: 13 * fs, fontWeight: '600', color: c.text, marginBottom: 4},
    topicProgress: {fontSize: 11 * fs, color: c.subText},
    activityItem: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: c.card,
      borderRadius: 10, padding: 14, marginBottom: 8,
    },
    activityIcon: {marginRight: 12},
    activityInfo: {flex: 1},
    activityTitle: {fontSize: 14 * fs, fontWeight: '600', color: c.text},
    activityMeta: {fontSize: 12 * fs, color: c.subText, marginTop: 2},
    loginBanner: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: c.card,
      borderRadius: 10, padding: 16, gap: 10,
    },
    loginBannerText: {flex: 1, fontSize: 13 * fs, color: c.subText},
    recommendCard: {
      backgroundColor: c.card, borderRadius: 14, padding: 16, marginBottom: 24,
      borderLeftWidth: 3, borderLeftColor: '#FF7043',
    },
    recommendReasonRow: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 14,
    },
    recommendReason: {flex: 1, fontSize: 13 * fs, color: c.subText, lineHeight: 19},
    weakTopicBar: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: c.isDark ? 'rgba(255,112,67,0.1)' : 'rgba(255,112,67,0.07)',
      borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 6,
    },
    weakTopicLeft: {flexDirection: 'row', alignItems: 'center', gap: 8},
    weakTopicName: {fontSize: 14 * fs, fontWeight: '600', color: c.text},
    weakBadge: {
      backgroundColor: 'rgba(255,112,67,0.18)', borderRadius: 6,
      paddingHorizontal: 8, paddingVertical: 3,
    },
    weakBadgeText: {fontSize: 11 * fs, fontWeight: '700', color: '#FF7043'},
  });
}
