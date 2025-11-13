import { Image } from 'expo-image';
import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleEmail = () => {
    Linking.openURL('mailto:bsse1438@iit.du.ac.bd');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* App Header */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <ThemedText type="title" style={styles.appName}>FreshBites</ThemedText>
          <ThemedText style={styles.tagline}>Your Premium Food Delivery App</ThemedText>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>📱 About the App</ThemedText>
          <ThemedText style={styles.paragraph}>
            FreshBites is a modern food delivery application built with React Native and Expo. 
            We bring delicious meals from top restaurants right to your doorstep with just a few taps.
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            Our app features a seamless in-app purchase system powered by Google Play Billing, 
            allowing you to unlock premium menu items and exclusive dishes from celebrity chefs.
          </ThemedText>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>✨ Features</ThemedText>
          <View style={styles.featureItem}>
            <ThemedText style={styles.featureBullet}>🛒</ThemedText>
            <View style={{ flex: 1 }}>
              <ThemedText type="defaultSemiBold">Easy Shopping</ThemedText>
              <ThemedText style={styles.featureDesc}>Browse and order from a wide selection of food items</ThemedText>
            </View>
          </View>
          <View style={styles.featureItem}>
            <ThemedText style={styles.featureBullet}>⭐</ThemedText>
            <View style={{ flex: 1 }}>
              <ThemedText type="defaultSemiBold">Premium Menu</ThemedText>
              <ThemedText style={styles.featureDesc}>Access exclusive premium dishes with membership</ThemedText>
            </View>
          </View>
          <View style={styles.featureItem}>
            <ThemedText style={styles.featureBullet}>💳</ThemedText>
            <View style={{ flex: 1 }}>
              <ThemedText type="defaultSemiBold">Secure Payments</ThemedText>
              <ThemedText style={styles.featureDesc}>Google Play Billing integration for safe transactions</ThemedText>
            </View>
          </View>
          <View style={styles.featureItem}>
            <ThemedText style={styles.featureBullet}>🧪</ThemedText>
            <View style={{ flex: 1 }}>
              <ThemedText type="defaultSemiBold">Sandbox Mode</ThemedText>
              <ThemedText style={styles.featureDesc}>Test premium features without real purchases</ThemedText>
            </View>
          </View>
        </View>

        {/* Tech Stack Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>🔧 Technology</ThemedText>
          <ThemedText style={styles.paragraph}>
            Built with React Native, Expo Router, TypeScript, and react-native-iap for seamless 
            in-app purchases. Features include persistent storage with AsyncStorage, dynamic theming, 
            and haptic feedback for enhanced user experience.
          </ThemedText>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>📧 Contact Us</ThemedText>
          <ThemedText style={styles.paragraph}>
            Have questions, feedback, or need support? We'd love to hear from you!
          </ThemedText>
          
          <Pressable 
            onPress={handleEmail}
            style={({ pressed }) => [
              styles.contactButton,
              { 
                backgroundColor: colorScheme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                borderColor: 'rgba(59, 130, 246, 0.3)'
              },
              pressed && { opacity: 0.7 }
            ]}
          >
            <ThemedText style={styles.contactButtonIcon}>✉️</ThemedText>
            <View style={{ flex: 1 }}>
              <ThemedText type="defaultSemiBold" style={[styles.contactButtonTitle, { color: colors.text }]}>Email Support</ThemedText>
              <ThemedText style={[styles.contactButtonEmail, { color: colorScheme === 'dark' ? '#60a5fa' : '#3b82f6' }]}>bsse1438@iit.du.ac.bd</ThemedText>
            </View>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <ThemedText style={[styles.footerText, { color: colors.text, opacity: 0.7 }]}>Made with ❤️ using React Native & Expo</ThemedText>
          <ThemedText style={[styles.footerText, { color: colors.text, opacity: 0.7 }]}>FreshBites v1.0.0</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { 
    padding: 20,
    paddingBottom: 40,
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 32,
    paddingTop: 8,
  },
  logo: { 
    width: 120, 
    height: 80,
    marginBottom: 12,
  },
  appName: {
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.8,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  featureBullet: {
    fontSize: 24,
  },
  featureDesc: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  contactButtonIcon: {
    fontSize: 32,
  },
  contactButtonTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  contactButtonEmail: {
    fontSize: 14,
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 4,
  },
});
