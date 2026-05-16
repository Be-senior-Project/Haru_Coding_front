import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme, type Colors, type FontSizeKey} from '../theme/ThemeContext';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

const badges = ['🏆', '📅', '🐱', '🔍', '👑', '🎯'];

const FONT_SIZE_OPTIONS: {key: FontSizeKey; label: string; size: number}[] = [
  {key: 'small', label: '가', size: 13},
  {key: 'medium', label: '가', size: 17},
  {key: 'large', label: '가', size: 22},
];

export default function ProfileScreen() {
  const [streak, setStreak] = useState(0);
  const [totalSolved] = useState(125);
  const [hasToken, setHasToken] = useState(false);
  const insets = useSafeAreaInsets();
  const {colors, isDark, toggleTheme, fontScale, fontSizeKey, setFontSize} = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    AsyncStorage.getItem('streak').then(v => v && setStreak(parseInt(v, 10)));
    AsyncStorage.getItem('accessToken').then(v => setHasToken(!!v));
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    setHasToken(false);
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, {paddingTop: insets.top + 20}]}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>lv.12</Text>
          </View>
        </View>
        <Text style={styles.username}>홍길동</Text>
        <Text style={styles.userLevel}>lv.12 중급</Text>
        <View style={styles.expBar}>
          <View style={[styles.expFill, {width: '67%'}]} />
        </View>
        <Text style={styles.expText}>EXP PROGRESS 67%</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statLabel}>연속 학습</Text>
            <Text style={styles.statValue}>{streak}일</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📝</Text>
            <Text style={styles.statLabel}>총 문제</Text>
            <Text style={styles.statValue}>{totalSolved}개</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🏅</Text>
            <Text style={styles.statLabel}>랭킹</Text>
            <Text style={styles.statValue}>25%</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statLabel}>정답률</Text>
            <Text style={styles.statValue}>88%</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>업적 및 배지</Text>
      <View style={styles.badgeRow}>
        {badges.map((b, i) => (
          <View key={i} style={[styles.badgeItem, i === 1 && styles.badgeActive]}>
            <Text style={styles.badgeEmoji}>{b}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>설정 및 관리</Text>
      <View style={styles.settingsCard}>
        {[
          {label: '프로필 수정', icon: '✏️'},
          {label: '알림 설정', icon: '🔔'},
          {label: '서비스 약관', icon: '📄'},
          {label: '로그아웃', icon: '🚪'},
        ].map(item => (
          <TouchableOpacity key={item.label} style={styles.settingRow}>
            <Text style={styles.settingIcon}>{item.icon}</Text>
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.settingRow}>
          <Text style={styles.settingIcon}>🌙</Text>
          <Text style={styles.settingLabel}>다크모드 설정</Text>
          <Switch value={isDark} onValueChange={toggleTheme} />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingIcon}>🔤</Text>
          <Text style={styles.settingLabel}>글자 크기</Text>
          <View style={styles.fontSizeRow}>
            {FONT_SIZE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.fontSizeBtn, fontSizeKey === opt.key && styles.fontSizeBtnActive]}
                onPress={() => setFontSize(opt.key)}>
                <Text
                  style={[
                    styles.fontSizeBtnText,
                    {fontSize: opt.size},
                    fontSizeKey === opt.key && styles.fontSizeBtnTextActive,
                  ]}>
                  가
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* DEV ONLY */}
      {hasToken ? (
        <TouchableOpacity style={styles.devLogoutBtn} onPress={handleLogout}>
          <Text style={styles.devLogoutText}>[DEV] 로그아웃</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.devLoginBtn} onPress={handleLogin}>
          <Text style={styles.devLoginText}>[DEV] 로그인하기</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function makeStyles(c: Colors, fs: number) {
  return StyleSheet.create({
    container: {flex: 1, backgroundColor: c.bg},
    content: {padding: 20, paddingBottom: 40},
    profileCard: {backgroundColor: c.card, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20, elevation: 2},
    avatar: {position: 'relative', marginBottom: 10},
    avatarText: {fontSize: 48},
    levelBadge: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      backgroundColor: '#2979FF',
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    levelText: {fontSize: 10, color: '#FFF', fontWeight: '700'},
    username: {fontSize: 20 * fs, fontWeight: '700', color: c.text},
    userLevel: {fontSize: 13 * fs, color: c.subText, marginBottom: 8},
    expBar: {
      width: '100%',
      height: 8,
      backgroundColor: c.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 4,
    },
    expFill: {height: '100%', backgroundColor: '#2979FF', borderRadius: 4},
    expText: {fontSize: 11 * fs, color: c.subText, marginBottom: 16},
    statsRow: {flexDirection: 'row', justifyContent: 'space-around', width: '100%'},
    statItem: {alignItems: 'center', gap: 2},
    statIcon: {fontSize: 20},
    statLabel: {fontSize: 11 * fs, color: c.subText},
    statValue: {fontSize: 16 * fs, fontWeight: '700', color: c.text},
    sectionTitle: {fontSize: 16 * fs, fontWeight: '700', color: c.text, marginBottom: 12},
    badgeRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20},
    badgeItem: {
      width: 52,
      height: 52,
      borderRadius: 12,
      backgroundColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeActive: {backgroundColor: c.isDark ? '#1A2F4A' : '#E3F2FD', borderWidth: 2, borderColor: '#2979FF'},
    badgeEmoji: {fontSize: 24},
    settingsCard: {backgroundColor: c.card, borderRadius: 14, overflow: 'hidden', elevation: 2},
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    settingIcon: {fontSize: 18, marginRight: 12},
    settingLabel: {flex: 1, fontSize: 14 * fs, color: c.text},
    settingArrow: {fontSize: 18, color: c.subText},
    fontSizeRow: {flexDirection: 'row', gap: 8},
    fontSizeBtn: {
      width: 40,
      height: 40,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.bg,
    },
    fontSizeBtnActive: {borderColor: '#2979FF', backgroundColor: c.isDark ? '#1A1F3A' : '#EEF2FF'},
    fontSizeBtnText: {color: c.subText, fontWeight: '600'},
    fontSizeBtnTextActive: {color: '#2979FF'},
    devLogoutBtn: {marginTop: 24, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8, borderWidth: 1, borderColor: '#FF5252'},
    devLogoutText: {color: '#FF5252', fontSize: 13 * fs, fontWeight: '600'},
    devLoginBtn: {marginTop: 24, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8, borderWidth: 1, borderColor: '#2979FF'},
    devLoginText: {color: '#2979FF', fontSize: 13 * fs, fontWeight: '600'},
  });
}
