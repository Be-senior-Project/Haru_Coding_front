import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme, type Colors, type FontSizeKey} from '../theme/ThemeContext';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const BADGE_ICONS: {name: string; lib: 'mi' | 'mc'}[] = [
  {name: 'emoji-events', lib: 'mi'},
  {name: 'calendar-today', lib: 'mi'},
  {name: 'pets', lib: 'mi'},
  {name: 'search', lib: 'mi'},
  {name: 'stars', lib: 'mi'},
  {name: 'gps-fixed', lib: 'mi'},
];

const SETTINGS: {label: string; icon: string; lib: 'mi' | 'mc'}[] = [
  {label: '프로필 수정', icon: 'edit', lib: 'mi'},
  {label: '알림 설정', icon: 'notifications', lib: 'mi'},
  {label: '서비스 약관', icon: 'description', lib: 'mi'},
  {label: '로그아웃', icon: 'logout', lib: 'mi'},
];

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
    navigation.reset({index: 0, routes: [{name: 'Login'}]});
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, {paddingTop: insets.top + 20}]}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <MaterialIcons name="person" size={48} color={colors.subText} />
          {hasToken && (
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>lv.12</Text>
            </View>
          )}
        </View>

        {hasToken ? (
          <>
            <Text style={styles.username}>홍길동</Text>
            <Text style={styles.userLevel}>lv.12 중급</Text>
            <View style={styles.expBar}>
              <View style={[styles.expFill, {width: '67%'}]} />
            </View>
            <Text style={styles.expText}>EXP PROGRESS 67%</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="fire" size={22} color="#E65100" />
                <Text style={styles.statLabel}>연속 학습</Text>
                <Text style={styles.statValue}>{streak}일</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="edit-note" size={22} color="#2979FF" />
                <Text style={styles.statLabel}>총 문제</Text>
                <Text style={styles.statValue}>{totalSolved}개</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="military-tech" size={22} color="#FF9800" />
                <Text style={styles.statLabel}>랭킹</Text>
                <Text style={styles.statValue}>25%</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="check-circle" size={22} color="#4CAF50" />
                <Text style={styles.statLabel}>정답률</Text>
                <Text style={styles.statValue}>88%</Text>
              </View>
            </View>
          </>
        ) : (
          <TouchableOpacity style={styles.loginPrompt} onPress={() => navigation.navigate('Login')}>
            <MaterialIcons name="lock" size={28} color={colors.subText} />
            <Text style={styles.loginPromptText}>로그인하면 내 정보를 볼 수 있어요</Text>
            <View style={styles.loginPromptBtn}>
              <Text style={styles.loginPromptBtnText}>로그인하기</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionTitle}>업적 및 배지</Text>
      {hasToken ? (
        <View style={styles.badgeRow}>
          {BADGE_ICONS.map((b, i) => (
            <View key={i} style={[styles.badgeItem, i === 1 && styles.badgeActive]}>
              <MaterialIcons name={b.name} size={26} color={i === 1 ? '#2979FF' : colors.subText} />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.lockedBox}>
          <MaterialIcons name="lock" size={20} color={colors.subText} />
          <Text style={styles.lockedText}>로그인 후 확인할 수 있어요</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>설정 및 관리</Text>
      <View style={styles.settingsCard}>
        {SETTINGS.filter(item => item.label !== '로그아웃').map(item => (
          <TouchableOpacity key={item.label} style={styles.settingRow}>
            <MaterialIcons name={item.icon} size={20} color={colors.subText} style={styles.settingIcon} />
            <Text style={styles.settingLabel}>{item.label}</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.subText} />
          </TouchableOpacity>
        ))}
        <View style={styles.settingRow}>
          <MaterialIcons name="dark-mode" size={20} color={colors.subText} style={styles.settingIcon} />
          <Text style={styles.settingLabel}>다크모드 설정</Text>
          <Switch value={isDark} onValueChange={toggleTheme} />
        </View>
        <View style={styles.settingRow}>
          <MaterialIcons name="text-fields" size={20} color={colors.subText} style={styles.settingIcon} />
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
        {hasToken && (
          <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color="#F44336" style={styles.settingIcon} />
            <Text style={[styles.settingLabel, {color: '#F44336'}]}>로그아웃</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

function makeStyles(c: Colors, fs: number) {
  return StyleSheet.create({
    container: {flex: 1, backgroundColor: c.bg},
    content: {padding: 20, paddingBottom: 40},
    profileCard: {backgroundColor: c.card, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20, elevation: 2},
    avatar: {position: 'relative', marginBottom: 10},
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
    expBar: {width: '100%', height: 8, backgroundColor: c.border, borderRadius: 4, overflow: 'hidden', marginBottom: 4},
    expFill: {height: '100%', backgroundColor: '#2979FF', borderRadius: 4},
    expText: {fontSize: 11 * fs, color: c.subText, marginBottom: 16},
    statsRow: {flexDirection: 'row', justifyContent: 'space-around', width: '100%'},
    statItem: {alignItems: 'center', gap: 4},
    statLabel: {fontSize: 11 * fs, color: c.subText},
    statValue: {fontSize: 16 * fs, fontWeight: '700', color: c.text},
    sectionTitle: {fontSize: 16 * fs, fontWeight: '700', color: c.text, marginBottom: 12},
    loginPrompt: {alignItems: 'center', paddingVertical: 8, gap: 8},
    loginPromptText: {fontSize: 13 * fs, color: c.subText, textAlign: 'center'},
    loginPromptBtn: {backgroundColor: '#2979FF', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 28, marginTop: 4},
    loginPromptBtnText: {color: '#FFF', fontWeight: '700', fontSize: 14 * fs},
    lockedBox: {flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.card, borderRadius: 10, padding: 14, marginBottom: 20},
    lockedText: {fontSize: 13 * fs, color: c.subText},
    badgeRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20},
    badgeItem: {width: 52, height: 52, borderRadius: 12, backgroundColor: c.border, alignItems: 'center', justifyContent: 'center'},
    badgeActive: {backgroundColor: c.isDark ? '#1A2F4A' : '#E3F2FD', borderWidth: 2, borderColor: '#2979FF'},
    settingsCard: {backgroundColor: c.card, borderRadius: 14, overflow: 'hidden', elevation: 2},
    settingRow: {flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: c.border},
    settingIcon: {marginRight: 12},
    settingLabel: {flex: 1, fontSize: 14 * fs, color: c.text},
    fontSizeRow: {flexDirection: 'row', gap: 8},
    fontSizeBtn: {width: 40, height: 40, borderRadius: 8, borderWidth: 1.5, borderColor: c.border, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg},
    fontSizeBtnActive: {borderColor: '#2979FF', backgroundColor: c.isDark ? '#1A1F3A' : '#EEF2FF'},
    fontSizeBtnText: {color: c.subText, fontWeight: '600'},
    fontSizeBtnTextActive: {color: '#2979FF'},
  });
}
