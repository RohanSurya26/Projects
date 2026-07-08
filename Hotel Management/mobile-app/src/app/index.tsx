import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView, Animated,
  KeyboardAvoidingView, Platform, Dimensions, Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const { width, height } = Dimensions.get('window');

function GlowOrb({ color, size, x, y, delay }: {
  color: string; size: number; x: number; y: number; delay: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 6000, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 6000, useNativeDriver: true }),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.15, 1] });
  return (
    <Animated.View style={{
      position: 'absolute', left: x, top: y, width: size, height: size,
      borderRadius: size / 2, backgroundColor: color, opacity: 0.15,
      transform: [{ translateY }, { scale }],
    }} />
  );
}

export default function LoginScreen() {
  const { colors: c } = useTheme();
  const [email, setEmail] = useState('demo@lumina.com');
  const [password, setPassword] = useState('password');
  const [focusField, setFocusField] = useState('');

  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(50)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoSlide = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoFade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(logoSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email.trim()) { Alert.alert('Required', 'Please enter your email'); return; }
    if (!password.trim()) { Alert.alert('Required', 'Please enter your password'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)/dashboard');
    }, 800);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <GlowOrb color="#6C63FF" size={350} x={-100} y={-80} delay={0} />
      <GlowOrb color="#00D4AA" size={280} x={width - 100} y={height * 0.4} delay={2000} />
      <GlowOrb color="#FF6B6B" size={200} x={width * 0.3} y={height * 0.7} delay={4000} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
          <Animated.View style={{ alignItems: 'center', marginBottom: 36, opacity: logoFade, transform: [{ translateY: logoSlide }] }}>
            <LinearGradient colors={[c.accent, c.accentDark]} style={{ width: 72, height: 72, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="business" size={32} color="#fff" />
            </LinearGradient>
            <Text style={{ fontSize: 28, fontWeight: '800', color: c.text, letterSpacing: 4 }}>LUMINA</Text>
            <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 4, letterSpacing: 1 }}>Hotel Management Suite</Text>
          </Animated.View>

          <Animated.View style={{ backgroundColor: c.card, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: c.border, opacity: cardFade, transform: [{ translateY: cardSlide }] }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: c.text, marginBottom: 4 }}>Welcome back</Text>
            <Text style={{ fontSize: 14, color: c.textSecondary, marginBottom: 28 }}>Sign in to continue</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: c.textSecondary, letterSpacing: 1.5, marginBottom: 8 }}>EMAIL</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.inputBg, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 4, borderWidth: 1.5, borderColor: focusField === 'email' ? c.accent : c.border }}>
                <Ionicons name="mail-outline" size={18} color={focusField === 'email' ? c.accent : c.textMuted} />
                <TextInput style={{ flex: 1, marginLeft: 12, fontSize: 15, color: c.text, paddingVertical: 14 }} placeholder="your@email.com" placeholderTextColor={c.textMuted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" onFocus={() => setFocusField('email')} onBlur={() => setFocusField('')} />
              </View>
            </View>

            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: c.textSecondary, letterSpacing: 1.5, marginBottom: 8 }}>PASSWORD</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.inputBg, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 4, borderWidth: 1.5, borderColor: focusField === 'password' ? c.accent : c.border }}>
                <Ionicons name="lock-closed-outline" size={18} color={focusField === 'password' ? c.accent : c.textMuted} />
                <TextInput style={{ flex: 1, marginLeft: 12, fontSize: 15, color: c.text, paddingVertical: 14 }} placeholder="••••••••" placeholderTextColor={c.textMuted} value={password} onChangeText={setPassword} secureTextEntry onFocus={() => setFocusField('password')} onBlur={() => setFocusField('')} />
              </View>
            </View>

            <TouchableOpacity onPress={handleLogin} activeOpacity={0.85} disabled={loading} style={{ marginTop: 16, borderRadius: 14, overflow: 'hidden', opacity: loading ? 0.7 : 1 }}>
              <LinearGradient colors={[c.accent, c.accentDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 14 }}>
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700', marginRight: 8 }}>{loading ? 'Signing in...' : 'Sign In'}</Text>
                {!loading && <Ionicons name="arrow-forward" size={18} color="#fff" />}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={{ textAlign: 'center', color: c.textMuted, fontSize: 12, marginTop: 20 }}>Lumina Systems • v1.0</Text>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
