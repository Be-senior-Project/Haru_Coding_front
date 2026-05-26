import React, {useMemo, useState} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {problemSets, type Problem} from '../data/mockProblems';
import {useTheme, type Colors} from '../theme/ThemeContext';
import CodeBlock from '../components/CodeBlock';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type RouteProps = RouteProp<RootStackParamList, 'ProblemSolve'>;

const TYPE_LABEL: Record<string, string> = {
  multiple_choice: '객관식 퀴즈',
  fill_blank: '코드 빈칸 채우기',
  word_match: '단어 매칭',
  short_answer: '단답형/서술형',
};

export default function ProblemSolveScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const {colors, fontScale} = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);

  // 세트 조회
  const set = problemSets.find(s => s.id === route.params.setId) ?? problemSets[0];
  const problems = set.problems;

  // 현재 문제 인덱스
  const [currentIndex, setCurrentIndex] = useState(route.params.initialIndex ?? 0);
  const problem = problems[currentIndex];

  // 답안 상태
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillAnswers, setFillAnswers] = useState<string[]>([]);
  const [matchSelections, setMatchSelections] = useState<Record<number, string>>({});
  const [shortAnswer, setShortAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // 세트 전체 결과 기록
  const [results, setResults] = useState<{id: string; correct: boolean}[]>([]);

  // 문제 전환 시 상태 초기화
  const resetState = () => {
    setSelectedOption(null);
    setFillAnswers(problems[currentIndex + 1]?.blanks?.map(() => '') ?? []);
    setMatchSelections({});
    setShortAnswer('');
    setSubmitted(false);
    setIsCorrect(false);
  };

  const checkAnswer = (): boolean => {
    switch (problem.type) {
      case 'multiple_choice':
        return selectedOption === problem.answer;
      case 'fill_blank':
        return fillAnswers.every(
          (a, i) => a.trim().toLowerCase() === (problem.answer as string[])[i].toLowerCase(),
        );
      case 'word_match':
        return (problem.matchLeft ?? []).every(
          (_, i) => matchSelections[i] === (problem.answer as string[])[i],
        );
      case 'short_answer':
        return shortAnswer.trim() === (problem.answer as string);
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    const correct = checkAnswer();
    setIsCorrect(correct);
    setSubmitted(true);
    setResults(prev => [...prev, {id: problem.id, correct}]);

    if (correct) {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = await AsyncStorage.getItem('lastSolvedDate');
      const savedStreak = await AsyncStorage.getItem('streak');
      const streak = savedStreak ? parseInt(savedStreak, 10) : 0;
      if (lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const newStreak = lastDate === yesterday ? streak + 1 : 1;
        await AsyncStorage.setItem('streak', String(newStreak));
        await AsyncStorage.setItem('lastSolvedDate', today);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetState();
    } else {
      // 세트 완료
      const correctCount = results.filter(r => r.correct).length + (isCorrect ? 1 : 0);
      Alert.alert(
        '🎉 세트 완료!',
        `${problems.length}문제 중 ${correctCount}개 정답\n정답률 ${Math.round(correctCount / problems.length * 100)}%`,
        [{text: '홈으로', onPress: () => navigation.goBack()}],
      );
    }
  };

  const isLastProblem = currentIndex === problems.length - 1;
  const progress = (currentIndex + (submitted ? 1 : 0)) / problems.length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, {paddingTop: insets.top + 16}]}>

      {/* 상단 바 */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.progressBarWrap}>
          <View style={[styles.progressFill, {width: `${progress * 100}%`}]} />
        </View>
        <Text style={styles.progressText}>{currentIndex + 1} / {problems.length}</Text>
      </View>

      {/* 문제 유형 뱃지 */}
      <View style={styles.typeBadge}>
        <Text style={styles.typeBadgeText}>{TYPE_LABEL[problem.type]}</Text>
      </View>

      {/* 문제 */}
      <Text style={styles.question}>{problem.question}</Text>
      {problem.code && <CodeBlock code={problem.code} />}

      {/* 유형별 답안 입력 */}
      {problem.type === 'multiple_choice' && (
        <MultipleChoice
          options={problem.options ?? []}
          selected={selectedOption}
          submitted={submitted}
          correctAnswer={problem.answer as string}
          onSelect={setSelectedOption}
        />
      )}
      {problem.type === 'fill_blank' && (
        <FillBlank
          blanks={problem.blanks ?? []}
          values={fillAnswers.length ? fillAnswers : (problem.blanks ?? []).map(() => '')}
          submitted={submitted}
          correctAnswers={problem.answer as string[]}
          onChange={(i, v) => {
            const next = [...(fillAnswers.length ? fillAnswers : (problem.blanks ?? []).map(() => ''))];
            next[i] = v;
            setFillAnswers(next);
          }}
        />
      )}
      {problem.type === 'word_match' && (
        <WordMatch
          left={problem.matchLeft ?? []}
          right={problem.matchRight ?? []}
          selections={matchSelections}
          submitted={submitted}
          correctAnswers={problem.answer as string[]}
          onSelect={(leftIdx, rightVal) =>
            setMatchSelections(prev => ({...prev, [leftIdx]: rightVal}))
          }
        />
      )}
      {problem.type === 'short_answer' && (
        <ShortAnswer value={shortAnswer} submitted={submitted} onChange={setShortAnswer} />
      )}

      {/* 제출 / 결과 / 다음 */}
      {!submitted ? (
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>정답 확인하기</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.resultCard, isCorrect ? styles.correctCard : styles.wrongCard]}>
          <Text style={styles.resultTitle}>{isCorrect ? '🎉 정답!' : '😢 오답'}</Text>
          <Text style={styles.resultExplain}>{problem.explanation}</Text>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>
              {isLastProblem ? '결과 보기' : '다음 문제 →'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// ─── 하위 컴포넌트 ────────────────────────────────────────────

function MultipleChoice({options, selected, submitted, correctAnswer, onSelect}: {
  options: string[]; selected: string | null; submitted: boolean;
  correctAnswer: string; onSelect: (v: string) => void;
}) {
  const {colors, fontScale} = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);
  return (
    <View style={styles.optionsContainer}>
      {options.map((opt, i) => {
        let bg = colors.card;
        if (submitted) {
          if (opt === correctAnswer) {bg = '#E8F5E9';}
          else if (opt === selected) {bg = '#FFEBEE';}
        } else if (opt === selected) {bg = '#E3F2FD';}
        return (
          <TouchableOpacity
            key={i} style={[styles.optionItem, {backgroundColor: bg}]}
            onPress={() => !submitted && onSelect(opt)} disabled={submitted}>
            <Text style={styles.optionNum}>{i + 1}</Text>
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function FillBlank({blanks, values, submitted, correctAnswers, onChange}: {
  blanks: string[]; values: string[]; submitted: boolean;
  correctAnswers: string[]; onChange: (i: number, v: string) => void;
}) {
  const {colors, fontScale} = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);
  return (
    <View style={styles.fillContainer}>
      {blanks.map((_, i) => {
        const correct = submitted && values[i]?.trim().toLowerCase() === correctAnswers[i]?.toLowerCase();
        const wrong = submitted && !correct;
        return (
          <View key={i} style={styles.fillRow}>
            <Text style={styles.fillLabel}>빈칸 {i + 1}</Text>
            <TextInput
              style={[styles.fillInput, submitted && (correct ? styles.inputCorrect : styles.inputWrong)]}
              value={values[i] ?? ''}
              onChangeText={v => onChange(i, v)}
              editable={!submitted}
              placeholder={`빈칸 ${i + 1}를 입력하세요`}
              placeholderTextColor={colors.subText}
            />
            {submitted && wrong && <Text style={styles.correctHint}>정답: {correctAnswers[i]}</Text>}
          </View>
        );
      })}
    </View>
  );
}

function WordMatch({left, right, selections, submitted, correctAnswers, onSelect}: {
  left: string[]; right: string[]; selections: Record<number, string>;
  submitted: boolean; correctAnswers: string[];
  onSelect: (leftIdx: number, rightVal: string) => void;
}) {
  const {colors, fontScale} = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);
  const [activeLeft, setActiveLeft] = useState<number | null>(null);
  const [shuffledRight] = useState([...right].sort(() => Math.random() - 0.5));

  return (
    <View>
      <Text style={styles.matchHint}>왼쪽 단어를 선택 후 오른쪽 설명을 선택하세요</Text>
      <View style={styles.matchContainer}>
        <View style={styles.matchCol}>
          {left.map((word, i) => {
            const isActive = activeLeft === i;
            const isCorrect = submitted && selections[i] === correctAnswers[i];
            const isWrong = submitted && !isCorrect;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.matchItem, isActive && styles.matchActive,
                  selections[i] !== undefined && styles.matchSelected,
                  submitted && isCorrect && styles.matchCorrect,
                  submitted && isWrong && styles.matchWrong]}
                onPress={() => !submitted && setActiveLeft(i)}>
                <Text style={styles.matchText}>{word}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.matchCol}>
          {shuffledRight.map((desc, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.matchItem, Object.values(selections).includes(desc) && styles.matchSelected]}
              onPress={() => {
                if (activeLeft !== null && !submitted) {
                  onSelect(activeLeft, desc);
                  setActiveLeft(null);
                }
              }}>
              <Text style={styles.matchText} numberOfLines={2}>{desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <Text style={styles.matchRemain}>남은 짝: {left.length - Object.keys(selections).length}개</Text>
    </View>
  );
}

function ShortAnswer({value, submitted, onChange}: {
  value: string; submitted: boolean; onChange: (v: string) => void;
}) {
  const {colors, fontScale} = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);
  return (
    <TextInput
      style={[styles.shortInput, submitted && styles.inputDisabled]}
      value={value} onChangeText={onChange} editable={!submitted}
      placeholder="답을 입력하세요" placeholderTextColor={colors.subText} multiline
    />
  );
}

function makeStyles(c: Colors, fs: number) {
  return StyleSheet.create({
    container: {flex: 1, backgroundColor: c.bg},
    content: {padding: 20, paddingBottom: 60},
    topBar: {flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12},
    progressBarWrap: {flex: 1, height: 8, backgroundColor: c.border, borderRadius: 4, overflow: 'hidden'},
    progressFill: {height: '100%', backgroundColor: '#2979FF', borderRadius: 4},
    progressText: {fontSize: 12, color: c.subText, minWidth: 36, textAlign: 'right'},
    typeBadge: {
      alignSelf: 'flex-start', backgroundColor: c.isDark ? '#1A1F3A' : '#EEF2FF',
      borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10,
    },
    typeBadgeText: {fontSize: 12 * fs, color: '#2979FF', fontWeight: '600'},
    question: {fontSize: 17 * fs, fontWeight: '600', color: c.text, lineHeight: 26 * fs, marginBottom: 16},
    optionsContainer: {gap: 10, marginBottom: 24},
    optionItem: {
      flexDirection: 'row', alignItems: 'center', borderRadius: 10,
      borderWidth: 1, borderColor: c.border, padding: 14, gap: 12,
    },
    optionNum: {fontSize: 14 * fs, fontWeight: '700', color: c.subText, width: 20},
    optionText: {fontSize: 14 * fs, color: c.text, flex: 1},
    fillContainer: {gap: 14, marginBottom: 24},
    fillRow: {gap: 6},
    fillLabel: {fontSize: 13 * fs, color: c.subText},
    fillInput: {
      borderWidth: 1, borderColor: c.border, borderRadius: 10,
      padding: 14, fontSize: 14 * fs, backgroundColor: c.card, color: c.text,
    },
    inputCorrect: {borderColor: '#4CAF50', backgroundColor: '#E8F5E9'},
    inputWrong: {borderColor: '#F44336', backgroundColor: '#FFEBEE'},
    inputDisabled: {backgroundColor: c.isDark ? '#1A1A2A' : '#F5F5F5'},
    correctHint: {fontSize: 12, color: '#F44336'},
    matchHint: {fontSize: 13 * fs, color: c.subText, marginBottom: 12},
    matchContainer: {flexDirection: 'row', gap: 8, marginBottom: 12},
    matchCol: {flex: 1, gap: 8},
    matchItem: {
      backgroundColor: c.card, borderWidth: 1, borderColor: c.border,
      borderRadius: 8, padding: 10, minHeight: 56, justifyContent: 'center',
    },
    matchActive: {borderColor: '#2979FF', backgroundColor: '#E3F2FD'},
    matchSelected: {borderColor: '#90CAF9', backgroundColor: c.isDark ? '#0D1F3A' : '#F0F7FF'},
    matchCorrect: {borderColor: '#4CAF50', backgroundColor: '#E8F5E9'},
    matchWrong: {borderColor: '#F44336', backgroundColor: '#FFEBEE'},
    matchText: {fontSize: 12 * fs, color: c.text},
    matchRemain: {fontSize: 12 * fs, color: c.subText, textAlign: 'right'},
    shortInput: {
      borderWidth: 1, borderColor: c.border, borderRadius: 10,
      padding: 14, fontSize: 14 * fs, backgroundColor: c.card,
      color: c.text, minHeight: 80, marginBottom: 24,
    },
    submitBtn: {
      backgroundColor: '#2979FF', borderRadius: 12,
      paddingVertical: 16, alignItems: 'center', marginTop: 8,
    },
    submitBtnText: {color: '#FFF', fontSize: 16, fontWeight: '700'},
    resultCard: {borderRadius: 14, padding: 20, marginTop: 8},
    correctCard: {backgroundColor: '#E8F5E9'},
    wrongCard: {backgroundColor: '#FFEBEE'},
    resultTitle: {fontSize: 20, fontWeight: '700', marginBottom: 10},
    resultExplain: {fontSize: 14, color: '#333', lineHeight: 22, marginBottom: 16},
    nextBtn: {
      backgroundColor: '#2979FF', borderRadius: 10,
      paddingVertical: 14, alignItems: 'center',
    },
    nextBtnText: {color: '#FFF', fontWeight: '700', fontSize: 15},
  });
}
