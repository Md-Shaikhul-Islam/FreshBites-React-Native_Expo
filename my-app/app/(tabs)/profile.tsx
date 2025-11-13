import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useUser } from '@/context/user-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { requestPremiumPurchase, restorePremium } from '@/services/iap';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

type RoleOption = 'Normal' | 'Premium';

export default function ProfileScreen() {
  const { isPremium, setPremium, sandboxMode, setSandboxMode } = useUser();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Editable profile fields
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('+880 1234-567890');
  const [address, setAddress] = useState('123 Main Street, Dhaka');
  const [isEditing, setIsEditing] = useState(false);

  const role: RoleOption = useMemo(() => (isPremium ? 'Premium' : 'Normal'), [isPremium]);

  const onSelectRole = async (value: RoleOption) => {
    if (value === 'Normal') {
      await setPremium(false);
      setOpen(false);
      return;
    }
    if (isPremium) {
      setOpen(false);
      return;
    }
    setOpen(false);
  };

  const onUpgrade = async () => {
    setBusy(true);
    try {
      if (sandboxMode) {
        await setPremium(true);
        Alert.alert('Sandbox Unlock', 'Premium unlocked in sandbox mode (no charge).');
      } else {
        const ok = await requestPremiumPurchase();
        if (ok) {
          await setPremium(true);
          Alert.alert('Success', 'Premium unlocked on this device.');
        } else {
          Alert.alert('Purchase not completed', 'We could not confirm the premium unlock.');
        }
      }
    } catch (e) {
      Alert.alert('Purchase failed', String(e));
    } finally {
      setBusy(false);
    }
  };

  const onRestore = async () => {
    setBusy(true);
    try {
      const has = await restorePremium();
      if (has) {
        await setPremium(true);
        Alert.alert('Restored', 'Your premium status has been restored.');
      } else {
        Alert.alert('No purchases', 'No premium purchase found for this account.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    Alert.alert('Profile Updated', 'Your profile information has been saved.');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>{name.charAt(0).toUpperCase()}</ThemedText>
          </View>
          <ThemedText type="title" style={styles.userName}>{name}</ThemedText>
          {isPremium && (
            <View style={styles.premiumBadge}>
              <ThemedText style={styles.premiumBadgeText}>⭐ Premium Member</ThemedText>
            </View>
          )}
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Personal Information</ThemedText>
            <Pressable onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
              <ThemedText style={styles.editButtonText}>{isEditing ? '✓ Save' : '✏️ Edit'}</ThemedText>
            </Pressable>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Full Name</ThemedText>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                />
              ) : (
                <ThemedText type="defaultSemiBold">{name}</ThemedText>
              )}
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Email</ThemedText>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                />
              ) : (
                <ThemedText type="defaultSemiBold">{email}</ThemedText>
              )}
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Phone</ThemedText>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter your phone"
                  keyboardType="phone-pad"
                />
              ) : (
                <ThemedText type="defaultSemiBold">{phone}</ThemedText>
              )}
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Address</ThemedText>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter your address"
                  multiline
                />
              ) : (
                <ThemedText type="defaultSemiBold">{address}</ThemedText>
              )}
            </View>
          </View>

          {isEditing && (
            <Pressable onPress={handleSaveProfile} style={styles.saveButton}>
              <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>Save Changes</ThemedText>
            </Pressable>
          )}
        </View>

        {/* Membership Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Membership Status</ThemedText>
          
          <View style={styles.dropdown}>
            <Pressable onPress={() => setOpen((v) => !v)} style={styles.dropdownHeader}>
              <ThemedText type="defaultSemiBold">{role}</ThemedText>
              <ThemedText style={{ fontSize: 12 }}>▼</ThemedText>
            </Pressable>
            {open && (
              <View style={styles.dropdownList}>
                {(['Normal', 'Premium'] as RoleOption[]).map((opt) => (
                  <Pressable key={opt} onPress={() => onSelectRole(opt)} style={styles.dropdownItem}>
                    <ThemedText>{opt}</ThemedText>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {!isPremium && (
            <View style={styles.upgradeCard}>
              <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>Upgrade to Premium</ThemedText>
              <ThemedText style={{ fontSize: 14, opacity: 0.7, marginBottom: 12 }}>
                Access exclusive premium dishes, priority support, and special discounts
              </ThemedText>
              <Pressable disabled={busy} onPress={onUpgrade} style={styles.upgradeButton}>
                <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
                  {busy ? 'Processing...' : (sandboxMode ? '🧪 Upgrade (Sandbox)' : '⭐ Upgrade Now')}
                </ThemedText>
              </Pressable>
            </View>
          )}
        </View>

        {/* Sandbox Mode */}
        <View style={styles.section}>
          <View style={styles.sandboxContainer}>
            <View style={{ flex: 1 }}>
              <ThemedText type="defaultSemiBold">🧪 Developer Sandbox</ThemedText>
              <ThemedText style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>
                Test premium features without real purchases
              </ThemedText>
            </View>
            <Pressable 
              onPress={() => setSandboxMode(!sandboxMode)} 
              style={[styles.sandboxToggle, sandboxMode && styles.sandboxToggleActive]}
            >
              <ThemedText style={{ fontSize: 12, fontWeight: '600' }}>
                {sandboxMode ? '✓ ON' : 'OFF'}
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Restore Purchases */}
        <View style={styles.section}>
          <Pressable disabled={busy} onPress={onRestore} style={styles.restoreButton}>
            <ThemedText type="defaultSemiBold">{busy ? 'Checking...' : '🔄 Restore Purchases'}</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    marginBottom: 8,
  },
  premiumBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  premiumBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  editButtonText: {
    fontSize: 14,
    color: '#3b82f6',
  },
  infoCard: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 6,
  },
  input: {
    fontSize: 15,
    fontWeight: '600',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  saveButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  dropdown: { 
    marginTop: 12,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  dropdownList: {
    marginTop: 6,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  dropdownItem: { 
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  upgradeCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  upgradeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
  },
  sandboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  sandboxToggle: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    minWidth: 60,
    alignItems: 'center',
  },
  sandboxToggleActive: {
    backgroundColor: '#9333ea',
  },
  restoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
});
