import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

type IAPModalProps = {
  visible: boolean;
  onClose: () => void;
  onPurchase: () => Promise<boolean>;
  productTitle: string;
  productPrice: string;
  productDescription: string;
};

type PurchaseState = 'idle' | 'processing' | 'success' | 'failed';

export function IAPModal({
  visible,
  onClose,
  onPurchase,
  productTitle,
  productPrice,
  productDescription,
}: IAPModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [purchaseState, setPurchaseState] = useState<PurchaseState>('idle');
  const [scaleAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleAnim.setValue(0);
      // Reset state when modal closes
      setTimeout(() => setPurchaseState('idle'), 300);
    }
  }, [visible]);

  const handlePurchase = async () => {
    setPurchaseState('processing');
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await onPurchase();
      
      if (result) {
        setPurchaseState('success');
        // Auto-close after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setPurchaseState('failed');
      }
    } catch (error) {
      setPurchaseState('failed');
    }
  };

  const handleRetry = () => {
    setPurchaseState('idle');
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.modal,
            { backgroundColor: colors.background, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollContent}
          >
          {purchaseState === 'idle' && (
            <>
              <View style={styles.header}>
                <ThemedText type="title" style={{ textAlign: 'center' }}>
                  {productTitle}
                </ThemedText>
                <ThemedText style={{ textAlign: 'center', marginTop: 8, opacity: 0.7 }}>
                  {productDescription}
                </ThemedText>
              </View>

              <View style={[styles.priceContainer, { backgroundColor: colors.card }]}>
                <ThemedText style={{ fontSize: 48, fontWeight: 'bold', color: colors.success }}>
                  {productPrice}
                </ThemedText>
              </View>

              <View style={styles.features}>
                <FeatureItem icon="✨" text="Exclusive premium menu access" colors={colors} />
                <FeatureItem icon="🎁" text="10% discount on all orders" colors={colors} />
                <FeatureItem icon="⚡" text="Priority customer support" colors={colors} />
                <FeatureItem icon="🚀" text="Early access to new features" colors={colors} />
                <FeatureItem icon="💳" text="One-time purchase" colors={colors} />
              </View>

              <View style={styles.buttons}>
                <Pressable
                  onPress={handlePurchase}
                  style={[styles.purchaseButton, { backgroundColor: colors.success }]}
                >
                  <ThemedText type="defaultSemiBold" style={{ color: '#fff', fontSize: 16 }}>
                    Purchase Now
                  </ThemedText>
                </Pressable>
                <Pressable onPress={onClose} style={styles.cancelButton}>
                  <ThemedText style={{ color: colors.text, opacity: 0.7 }}>
                    Maybe Later
                  </ThemedText>
                </Pressable>
              </View>
            </>
          )}

          {purchaseState === 'processing' && (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="large" color={colors.success} />
              <ThemedText type="subtitle" style={{ marginTop: 24, textAlign: 'center' }}>
                Processing Payment...
              </ThemedText>
              <ThemedText style={{ marginTop: 8, textAlign: 'center', opacity: 0.7 }}>
                Please wait while we verify your purchase
              </ThemedText>
            </View>
          )}

          {purchaseState === 'success' && (
            <View style={styles.stateContainer}>
              <View style={styles.successIcon}>
                <ThemedText style={{ fontSize: 60 }}>✅</ThemedText>
              </View>
              <ThemedText type="title" style={{ marginTop: 24, textAlign: 'center', color: colors.success }}>
                Purchase Successful!
              </ThemedText>
              <ThemedText style={{ marginTop: 8, textAlign: 'center', opacity: 0.7 }}>
                Welcome to Premium! Your account has been upgraded.
              </ThemedText>
              <View style={[styles.successDetails, { backgroundColor: colors.card }]}>
                <DetailRow label="Product" value={productTitle} colors={colors} />
                <DetailRow label="Amount" value={productPrice} colors={colors} />
                <DetailRow label="Status" value="Active" colors={colors} />
              </View>
            </View>
          )}

          {purchaseState === 'failed' && (
            <View style={styles.stateContainer}>
              <View style={styles.failureIcon}>
                <ThemedText style={{ fontSize: 60 }}>❌</ThemedText>
              </View>
              <ThemedText type="title" style={{ marginTop: 24, textAlign: 'center', color: colors.error }}>
                Purchase Failed
              </ThemedText>
              <ThemedText style={{ marginTop: 8, textAlign: 'center', opacity: 0.7 }}>
                We couldn't process your payment. Please try again.
              </ThemedText>
              <View style={[styles.errorDetails, { backgroundColor: colors.card }]}>
                <ThemedText style={{ opacity: 0.8, textAlign: 'center' }}>
                  • Check your payment method{'\n'}
                  • Ensure you have sufficient funds{'\n'}
                  • Try again in a few moments
                </ThemedText>
              </View>
              <View style={styles.buttons}>
                <Pressable
                  onPress={handleRetry}
                  style={[styles.purchaseButton, { backgroundColor: colors.tint }]}
                >
                  <ThemedText type="defaultSemiBold" style={{ color: '#fff', fontSize: 16 }}>
                    Try Again
                  </ThemedText>
                </Pressable>
                <Pressable onPress={onClose} style={styles.cancelButton}>
                  <ThemedText style={{ color: colors.text, opacity: 0.7 }}>
                    Cancel
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function FeatureItem({ icon, text, colors }: { icon: string; text: string; colors: any }) {
  return (
    <View style={styles.featureItem}>
      <ThemedText style={{ fontSize: 20, marginRight: 12 }}>{icon}</ThemedText>
      <ThemedText style={{ flex: 1, opacity: 0.9 }}>{text}</ThemedText>
    </View>
  );
}

function DetailRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText style={{ opacity: 0.6 }}>{label}</ThemedText>
      <ThemedText type="defaultSemiBold">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 60,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  priceContainer: {
    padding: 24,
    paddingTop: 28,
    paddingBottom: 28,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  features: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttons: {
    gap: 12,
  },
  purchaseButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },

  stateContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  failureIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successDetails: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  errorDetails: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
});
