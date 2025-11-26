import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Brand */}
        <View style={styles.logoContainer}>
          <ThemedText style={styles.logoEmoji}>🍔</ThemedText>
          <ThemedText type="title" style={styles.brandName}>
            FreshBites
          </ThemedText>
          <ThemedText style={[styles.tagline, { color: colors.text, opacity: 0.7 }]}>
            Delicious food at your fingertips
          </ThemedText>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {/* Login Button */}
          <Pressable
            onPress={() => router.push('/login')}
            style={[styles.button, styles.loginButton, { backgroundColor: colors.tint }]}
          >
            <ThemedText type="defaultSemiBold" style={styles.loginButtonText}>
              🔐 Log In
            </ThemedText>
            <ThemedText style={[styles.buttonSubtext, { opacity: 0.9 }]}>
              Already have an account
            </ThemedText>
          </Pressable>

          {/* Sign Up Button */}
          <Pressable
            onPress={() => router.push('/signup' as any)}
            style={[styles.button, styles.signupButton, { 
              backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              borderWidth: 2,
              borderColor: colors.tint + '40'
            }]}
          >
            <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>
              ✨ Sign Up
            </ThemedText>
            <ThemedText style={[styles.buttonSubtext, { color: colors.text, opacity: 0.6 }]}>
              Create a new account
            </ThemedText>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: colors.text, opacity: 0.5 }]}>
            By continuing, you agree to our Terms & Privacy Policy
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  brandName: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  button: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loginButton: {
    paddingVertical: 24,
  },
  signupButton: {
    paddingVertical: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 13,
    color: '#fff',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 32,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
