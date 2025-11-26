import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useUser } from '@/context/user-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { loginUser } from '@/services/auth';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View
} from 'react-native';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { setUser } = useUser();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter your username');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    console.log('🔑 Login attempt - Username:', username.trim().toLowerCase());
    setLoading(true);
    
    try {
      // Authenticate user
      console.log('📡 Calling loginUser...');
      const user = await loginUser(username.trim().toLowerCase(), password);
      console.log('👤 Login result:', user ? 'Success' : 'Failed');

      if (!user) {
        console.log('❌ No user returned from loginUser');
        Alert.alert('Login Failed', 'Invalid username or password. Please try again.');
        setLoading(false);
        return;
      }

      // Set user in context
      console.log('💾 Setting user in context...');
      await setUser(user);
      console.log('✅ User set in context, navigating...');

      // Navigate to main app
      router.replace('/(tabs)/shop');
      console.log('✅ Navigation complete');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      Alert.alert('Error', error?.message || 'Failed to login. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo/Header */}
          <View style={styles.header}>
            <ThemedText style={styles.logo}>🍽️</ThemedText>
            <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
              Welcome to FreshBites
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.text, opacity: 0.7 }]}>
              Enter your details to continue
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText type="defaultSemiBold" style={[styles.label, { color: colors.text }]}>
                Username
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Enter your username"
                placeholderTextColor={colorScheme === 'dark' ? '#888' : '#666'}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText type="defaultSemiBold" style={[styles.label, { color: colors.text }]}>
                Password
              </ThemedText>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: colors.border,
                      paddingRight: 50,
                    },
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor={colorScheme === 'dark' ? '#888' : '#666'}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                  }}
                >
                  <ThemedText style={{ fontSize: 12, color: colors.tint }}>
                    {showPassword ? 'Hide' : 'Show'}
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [
                styles.loginButton,
                { backgroundColor: colors.tint },
                (pressed || loading) && { opacity: 0.7 },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText type="defaultSemiBold" style={styles.loginButtonText}>
                  Login
                </ThemedText>
              )}
            </Pressable>

            {/* New user prompt */}
            <View style={styles.signupPrompt}>
              <ThemedText style={[styles.signupPromptText, { color: colors.text, opacity: 0.7 }]}>
                Don't have an account?{' '}
              </ThemedText>
              <Pressable onPress={() => router.replace('/signup' as any)} disabled={loading}>
                <ThemedText style={[styles.signupLink, { color: colors.tint }]}>
                  Sign Up
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  loginButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 56,
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  infoContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signupPromptText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
