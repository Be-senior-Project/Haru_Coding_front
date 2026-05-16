import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme, type Colors} from '../theme/ThemeContext';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {login, googleLogin} from '../api/authApi';
import {GOOGLE_WEB_CLIENT_ID} from '@env';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
});

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {colors, fontScale} = useTheme();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const saveTokensAndGoHome = async (accessToken: string, refreshToken: string) => {
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
    ]);
    navigation.reset({index: 0, routes: [{name: 'Main'}]});
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const {accessToken, refreshToken} = await login(email.trim(), password);
      await saveTokensAndGoHome(accessToken, refreshToken);
    } catch (e: any) {
      Alert.alert('로그인 실패', e.message || '이메일 또는 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (!idToken) {
        throw new Error('Google 로그인에 실패했습니다.');
      }
      const {accessToken, refreshToken} = await googleLogin(idToken);
      await saveTokensAndGoHome(accessToken, refreshToken);
    } catch (e: any) {
      if (e.code !== statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Google 로그인 실패', e.message || '다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.inner, {paddingTop: insets.top + 48}]}>
        <Text style={styles.logo}>🐻‍❄️</Text>
        <Text style={styles.appName}>하루코딩</Text>
        <Text style={styles.tagline}>오늘도 한 문제씩</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="이메일"
            placeholderTextColor={colors.subText}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            placeholderTextColor={colors.subText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.loginBtnText}>로그인</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.googleBtn, loading && styles.btnDisabled]}
            onPress={handleGoogleLogin}
            disabled={loading}>
            <Text style={styles.googleBtnText}>🔵  Google로 계속하기</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupLinkText}>
            아직 계정이 없으신가요?{'  '}
            <Text style={styles.signupLinkBold}>회원가입</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(c: Colors, fs: number) {
  return StyleSheet.create({
    container: {flex: 1, backgroundColor: c.bg},
    inner: {flex: 1, paddingHorizontal: 28, paddingBottom: 40},
    logo: {fontSize: 56, textAlign: 'center', marginBottom: 8},
    appName: {
      fontSize: 28 * fs,
      fontWeight: '800',
      color: c.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    tagline: {
      fontSize: 14 * fs,
      color: c.subText,
      textAlign: 'center',
      marginBottom: 40,
    },
    form: {gap: 12},
    input: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15 * fs,
      color: c.text,
    },
    loginBtn: {
      backgroundColor: '#2979FF',
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 4,
    },
    loginBtnText: {color: '#FFF', fontWeight: '700', fontSize: 16 * fs},
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginVertical: 4,
    },
    dividerLine: {flex: 1, height: 1, backgroundColor: c.border},
    dividerText: {fontSize: 12 * fs, color: c.subText},
    googleBtn: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
    },
    googleBtnText: {color: c.text, fontWeight: '600', fontSize: 15 * fs},
    btnDisabled: {opacity: 0.6},
    signupLink: {marginTop: 'auto', alignItems: 'center'},
    signupLinkText: {fontSize: 14 * fs, color: c.subText},
    signupLinkBold: {color: '#2979FF', fontWeight: '700'},
  });
}
