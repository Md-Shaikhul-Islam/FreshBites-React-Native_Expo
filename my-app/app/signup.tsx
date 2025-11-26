import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useUser } from '@/context/user-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { checkUsernameExists, registerUser } from '@/services/auth';
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

export default function SignUpScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { setUser } = useUser();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    return password.length >= 8;
  };

  const handleSignUp = async () => {
    // Validation
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    if (username.trim().length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters long');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      // Check if username already exists
      const usernameExists = await checkUsernameExists(username.trim().toLowerCase());
      
      if (usernameExists) {
        Alert.alert(
          'Username Taken',
          'This username is already taken. Please choose a different one.'
        );
        setLoading(false);
        return;
      }

      // Register new user
      const user = await registerUser(
        username.trim().toLowerCase(),
        password,
        email.trim().toLowerCase(),
        name.trim(),
        phone.trim() || undefined
      );

      if (!user) {
        Alert.alert('Error', 'Failed to create account. Please try again.');
        setLoading(false);
        return;
      }

      // Auto-login: Set user in context
      await setUser(user);

      // Navigate to shop (auto-login complete)
      router.replace('/(tabs)/shop');
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert('Error', error?.message || 'Failed to create account. Please check your connection and try again.');
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
              Create Your Account
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.text, opacity: 0.7 }]}>
              Join FreshBites today!
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText type="defaultSemiBold" style={[styles.label, { color: colors.text }]}>
                Username *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    color: colors.text,
                    borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                  },
                ]}
                placeholder="Choose a username"
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
                Password *
              </ThemedText>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      color: colors.text,
                      borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                      paddingRight: 50,
                    },
                  ]}
                  placeholder="At least 8 characters"
                  placeholderTextColor={colorScheme === 'dark' ? '#888' : '#666'}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  returnKeyType="next"
                  blurOnSubmit={false}
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

            <View style={styles.inputContainer}>
              <ThemedText type="defaultSemiBold" style={[styles.label, { color: colors.text }]}>
                Confirm Password *
              </ThemedText>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      color: colors.text,
                      borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                      paddingRight: 50,
                    },
                  ]}
                  placeholder="Re-enter password"
                  placeholderTextColor={colorScheme === 'dark' ? '#888' : '#666'}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                  }}
                >
                  <ThemedText style={{ fontSize: 12, color: colors.tint }}>
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText type="defaultSemiBold" style={[styles.label, { color: colors.text }]}>
                Email *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    color: colors.text,
                    borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                  },
                ]}
                placeholder="your.email@example.com"
                placeholderTextColor={colorScheme === 'dark' ? '#888' : '#666'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText type="defaultSemiBold" style={[styles.label, { color: colors.text }]}>
                Full Name *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    color: colors.text,
                    borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                  },
                ]}
                placeholder="Enter your full name"
                placeholderTextColor={colorScheme === 'dark' ? '#888' : '#666'}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText type="defaultSemiBold" style={[styles.label, { color: colors.text }]}>
                Phone Number (Optional)
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    color: colors.text,
                    borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                  },
                ]}
                placeholder="+880 1234 567890"
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
                placeholderTextColor={colorScheme === 'dark' ? '#888' : '#666'}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Sign Up Button */}
            <Pressable
              onPress={handleSignUp}
              disabled={loading}
              style={[
                styles.signupButton,
                { backgroundColor: colors.tint },
                loading && { opacity: 0.6 },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <ThemedText type="defaultSemiBold" style={styles.signupButtonText}>
                  ✨ Create Account
                </ThemedText>
              )}
            </Pressable>

            {/* Already have account */}
            <View style={styles.loginPrompt}>
              <ThemedText style={[styles.loginPromptText, { color: colors.text, opacity: 0.7 }]}>
                Already have an account?{' '}
              </ThemedText>
              <Pressable onPress={() => router.replace('/login')} disabled={loading}>
                <ThemedText style={[styles.loginLink, { color: colors.tint }]}>
                  Log In
                </ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Footer Info */}
          <View style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: colors.text, opacity: 0.5 }]}>
              By signing up, you agree to our Terms of Service and Privacy Policy
            </ThemedText>
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
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
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
    fontSize: 14,
  },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  signupButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginPromptText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
