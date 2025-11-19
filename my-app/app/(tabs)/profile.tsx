import { IAPModal } from '@/components/iap-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useUser } from '@/context/user-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { restorePremium } from '@/services/iap';
import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

type RoleOption = 'Normal' | 'Premium' | 'Manager';

export default function ProfileScreen() {
  const { isPremium, setPremium, userRole, setUserRole } = useUser();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showIAPModal, setShowIAPModal] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Editable profile fields
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('+880 1234-567890');
  const [address, setAddress] = useState('123 Main Street, Dhaka');
  const [isEditing, setIsEditing] = useState(false);

  const role: RoleOption = useMemo(() => {
    if (userRole === 'manager') return 'Manager';
    return isPremium ? 'Premium' : 'Normal';
  }, [isPremium, userRole]);

  const onSelectRole = async (value: RoleOption) => {
    if (value === 'Normal') {
      await setUserRole('normal');
      setOpen(false);
      return;
    }
    if (value === 'Premium') {
      if (isPremium) {
        setOpen(false);
        return;
      }
      // Trigger upgrade flow
      setOpen(false);
      onUpgrade();
      return;
    }
    setOpen(false);
  };

  const handleManagerAccess = () => {
    setShowPasscodeModal(true);
    setPasscode('');
  };

  const handlePasscodeSubmit = async () => {
    if (passcode === '123456') {
      setShowPasscodeModal(false);
      await setUserRole('manager');
      setPasscode('');
      Alert.alert('✅ Access Granted', 'You now have manager privileges. Check the Manager tab to add/edit items.');
    } else {
      Alert.alert('❌ Access Denied', 'Incorrect passcode. Please try again.');
      setPasscode('');
    }
  };

  const handleIAPPurchase = async (): Promise<boolean> => {
    try {
      // Always use sandbox mode for premium activation
      await setPremium(true);
      return true;
    } catch (e) {
      console.error('IAP Purchase failed:', e);
      return false;
    }
  };

  const onUpgrade = async () => {
    // Show IAP modal instead of direct upgrade
    setShowIAPModal(true);
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
                  {busy ? 'Processing...' : '⭐ Upgrade Now'}
                </ThemedText>
              </Pressable>
            </View>
          )}
        </View>



        {/* Manager Access */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Manager Tools</ThemedText>
          {userRole === 'manager' ? (
            <View style={[styles.managerCard, { backgroundColor: colors.card }]}>
              <View style={styles.managerBadge}>
                <ThemedText style={{ fontSize: 24 }}>💼</ThemedText>
              </View>
              <ThemedText type="defaultSemiBold" style={{ marginTop: 12, color: colors.tint }}>
                Manager Access Active
              </ThemedText>
              <ThemedText style={{ fontSize: 12, marginTop: 4, opacity: 0.7, textAlign: 'center' }}>
                You can add/edit items from the Manager tab
              </ThemedText>
              <Pressable 
                onPress={() => setUserRole('normal')} 
                style={[styles.revokeButton, { backgroundColor: colors.error }]}
              >
                <ThemedText type="defaultSemiBold" style={{ color: '#fff', fontSize: 12 }}>
                  Revoke Access
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <Pressable 
              onPress={handleManagerAccess} 
              style={[styles.managerAccessButton, { backgroundColor: colors.card }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <ThemedText style={{ fontSize: 32 }}>🔐</ThemedText>
                <View style={{ flex: 1 }}>
                  <ThemedText type="defaultSemiBold">Request Manager Access</ThemedText>
                  <ThemedText style={{ fontSize: 12, marginTop: 2, opacity: 0.7 }}>
                    Enter passcode to manage items
                  </ThemedText>
                </View>
                <ThemedText style={{ fontSize: 20, opacity: 0.5 }}>→</ThemedText>
              </View>
            </Pressable>
          )}
        </View>

        {/* Restore Purchases */}
        <View style={styles.section}>
          <Pressable disabled={busy} onPress={onRestore} style={styles.restoreButton}>
            <ThemedText type="defaultSemiBold">{busy ? 'Checking...' : '🔄 Restore Purchases'}</ThemedText>
          </Pressable>
        </View>
      </ScrollView>

      {/* IAP Modal */}
      <IAPModal
        visible={showIAPModal}
        onClose={() => setShowIAPModal(false)}
        onPurchase={handleIAPPurchase}
        productTitle="Premium Membership"
        productPrice="৳ 1000"
        productDescription="Unlock exclusive premium menu access, 10% discount on all orders, priority customer support, and early access to new features"
      />

      {/* Passcode Modal */}
      <Modal
        visible={showPasscodeModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowPasscodeModal(false);
          setPasscode('');
        }}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => {
            setShowPasscodeModal(false);
            setPasscode('');
          }}
        >
          <Pressable style={[styles.passcodeModal, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
            <ThemedText type="title" style={{ marginBottom: 8, textAlign: 'center' }}>🔐</ThemedText>
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 8, textAlign: 'center' }}>Manager Access</ThemedText>
            <ThemedText style={{ marginBottom: 20, textAlign: 'center', opacity: 0.7, fontSize: 14 }}>
              Enter manager passcode to access management features
            </ThemedText>
            
            <TextInput
              style={[styles.passcodeInput, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              }]}
              placeholder="Enter passcode"
              placeholderTextColor={colors.icon}
              value={passcode}
              onChangeText={setPasscode}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
              autoFocus
              onSubmitEditing={handlePasscodeSubmit}
            />
            
            <View style={styles.passcodeButtons}>
              <Pressable 
                style={[styles.passcodeButton, { backgroundColor: 'rgba(0,0,0,0.05)' }]}
                onPress={() => {
                  setShowPasscodeModal(false);
                  setPasscode('');
                }}
              >
                <ThemedText type="defaultSemiBold">Cancel</ThemedText>
              </Pressable>
              <Pressable 
                style={[styles.passcodeButton, { backgroundColor: colors.tint }]}
                onPress={handlePasscodeSubmit}
              >
                <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>Submit</ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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

  restoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  managerAccessButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  managerCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  managerBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  revokeButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  passcodeModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  passcodeInput: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 4,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
  },
  passcodeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  passcodeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
});
