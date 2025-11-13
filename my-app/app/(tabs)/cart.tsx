import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/cart-context';
import { useUser } from '@/context/user-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { requestCartPurchase } from '@/services/iap';
import React, { useState } from 'react';
import { Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

type PaymentMethod = 'bkash' | 'nagad' | 'card' | 'cash' | 'iap';

export default function CartScreen() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCart();
  const { isPremium, sandboxMode } = useUser();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [processing, setProcessing] = useState(false);

  const deliveryFee = 50;
  const subtotal = getTotalPrice();
  const discount = isPremium ? subtotal * 0.1 : 0; // 10% discount for premium
  const total = subtotal + deliveryFee - discount;

  const handleCheckout = async () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }

    if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
      if (!phoneNumber || phoneNumber.length < 11) {
        Alert.alert('Invalid Number', 'Please enter a valid phone number.');
        return;
      }
    }

    if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.length < 16) {
        Alert.alert('Invalid Card', 'Please enter a valid card number.');
        return;
      }
    }

    setProcessing(true);

    try {
      // Handle In-App Purchase payment (always in sandbox mode for now)
      if (paymentMethod === 'iap') {
        const success = await requestCartPurchase(total);
        setProcessing(false);
        
        if (success) {
          Alert.alert(
            '✅ Order Successful!',
            `Your order has been placed successfully!\n\n` +
            `Order Total: ৳${total.toFixed(2)}\n` +
            `Payment Method: In-App Purchase (Sandbox)\n` +
            `🧪 Test Mode - No real charge\n` +
            `\nEstimated delivery: 30-45 minutes`,
            [
              {
                text: 'View Orders',
                onPress: () => {
                  clearCart();
                  setShowCheckout(false);
                }
              },
              {
                text: 'OK',
                onPress: () => {
                  clearCart();
                  setShowCheckout(false);
                }
              }
            ]
          );
        } else {
          Alert.alert('Purchase Cancelled', 'Your order was not completed.');
        }
        return;
      }

      // Simulate payment processing for other methods
      setTimeout(() => {
        setProcessing(false);
        
        const paymentDetails = getPaymentDetails();
        
        Alert.alert(
          '✅ Order Successful!',
          `Your order has been placed successfully!\n\n` +
          `Order Total: ৳${total.toFixed(2)}\n` +
          `Payment Method: ${paymentDetails}\n` +
          `${sandboxMode ? '\n🧪 Sandbox Mode - No real charge' : ''}` +
          `\nEstimated delivery: 30-45 minutes`,
          [
            {
              text: 'View Orders',
              onPress: () => {
                clearCart();
                setShowCheckout(false);
              }
            },
            {
              text: 'OK',
              onPress: () => {
                clearCart();
                setShowCheckout(false);
              }
            }
          ]
        );
      }, 2000);
    } catch (error) {
      setProcessing(false);
      Alert.alert('Payment Failed', String(error));
    }
  };

  const getPaymentDetails = () => {
    switch (paymentMethod) {
      case 'bkash':
        return `bKash - ${phoneNumber}`;
      case 'nagad':
        return `Nagad - ${phoneNumber}`;
      case 'card':
        return `Card - **** **** **** ${cardNumber.slice(-4)}`;
      case 'cash':
        return 'Cash on Delivery';
      case 'iap':
        return 'In-App Purchase';
      default:
        return 'Unknown';
    }
  };

  if (items.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyIcon}>🛒</ThemedText>
          <ThemedText type="title" style={{ textAlign: 'center', color: colors.text }}>
            Your Cart is Empty
          </ThemedText>
          <ThemedText style={{ textAlign: 'center', marginTop: 8, color: colors.text, opacity: 0.7 }}>
            Add some delicious items from our menu
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (showCheckout) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Order Summary */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={{ color: colors.text }}>Order Summary</ThemedText>
            <View style={styles.summaryRow}>
              <ThemedText style={{ color: colors.text, opacity: 0.7 }}>Subtotal ({getTotalItems()} items)</ThemedText>
              <ThemedText style={{ color: colors.text }}>৳{subtotal.toFixed(2)}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={{ color: colors.text, opacity: 0.7 }}>Delivery Fee</ThemedText>
              <ThemedText style={{ color: colors.text }}>৳{deliveryFee.toFixed(2)}</ThemedText>
            </View>
            {isPremium && (
              <View style={styles.summaryRow}>
                <ThemedText style={{ color: colors.success }}>Premium Discount (10%)</ThemedText>
                <ThemedText style={{ color: colors.success }}>-৳{discount.toFixed(2)}</ThemedText>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 18, color: colors.text }}>Total</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 18, color: colors.success }}>৳{total.toFixed(2)}</ThemedText>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 12 }}>Payment Method</ThemedText>
            
            {/* bKash */}
            <Pressable
              onPress={() => setPaymentMethod('bkash')}
              style={[
                styles.paymentOption,
                { backgroundColor: colors.card, borderColor: paymentMethod === 'bkash' ? colors.success : colors.border },
              ]}
            >
              <View style={styles.paymentHeader}>
                <ThemedText style={{ fontSize: 24 }}>💳</ThemedText>
                <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>bKash</ThemedText>
              </View>
              {paymentMethod === 'bkash' && (
                <View style={[styles.radioSelected, { backgroundColor: colors.success }]}>
                  <ThemedText style={{ color: '#fff' }}>✓</ThemedText>
                </View>
              )}
            </Pressable>

            {paymentMethod === 'bkash' && (
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="Enter bKash number"
                placeholderTextColor={colors.icon}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={11}
              />
            )}

            {/* Nagad */}
            <Pressable
              onPress={() => setPaymentMethod('nagad')}
              style={[
                styles.paymentOption,
                { backgroundColor: colors.card, borderColor: paymentMethod === 'nagad' ? colors.success : colors.border },
              ]}
            >
              <View style={styles.paymentHeader}>
                <ThemedText style={{ fontSize: 24 }}>💰</ThemedText>
                <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>Nagad</ThemedText>
              </View>
              {paymentMethod === 'nagad' && (
                <View style={[styles.radioSelected, { backgroundColor: colors.success }]}>
                  <ThemedText style={{ color: '#fff' }}>✓</ThemedText>
                </View>
              )}
            </Pressable>

            {paymentMethod === 'nagad' && (
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="Enter Nagad number"
                placeholderTextColor={colors.icon}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={11}
              />
            )}

            {/* Card */}
            <Pressable
              onPress={() => setPaymentMethod('card')}
              style={[
                styles.paymentOption,
                { backgroundColor: colors.card, borderColor: paymentMethod === 'card' ? colors.success : colors.border },
              ]}
            >
              <View style={styles.paymentHeader}>
                <ThemedText style={{ fontSize: 24 }}>💳</ThemedText>
                <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>Credit/Debit Card</ThemedText>
              </View>
              {paymentMethod === 'card' && (
                <View style={[styles.radioSelected, { backgroundColor: colors.success }]}>
                  <ThemedText style={{ color: '#fff' }}>✓</ThemedText>
                </View>
              )}
            </Pressable>

            {paymentMethod === 'card' && (
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="Enter card number"
                placeholderTextColor={colors.icon}
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="number-pad"
                maxLength={16}
              />
            )}

            {/* Cash on Delivery */}
            <Pressable
              onPress={() => setPaymentMethod('cash')}
              style={[
                styles.paymentOption,
                { backgroundColor: colors.card, borderColor: paymentMethod === 'cash' ? colors.success : colors.border },
              ]}
            >
              <View style={styles.paymentHeader}>
                <ThemedText style={{ fontSize: 24 }}>💵</ThemedText>
                <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>Cash on Delivery</ThemedText>
              </View>
              {paymentMethod === 'cash' && (
                <View style={[styles.radioSelected, { backgroundColor: colors.success }]}>
                  <ThemedText style={{ color: '#fff' }}>✓</ThemedText>
                </View>
              )}
            </Pressable>

            {/* In-App Purchase */}
            <Pressable
              onPress={() => setPaymentMethod('iap')}
              style={[
                styles.paymentOption,
                { backgroundColor: colors.card, borderColor: paymentMethod === 'iap' ? colors.success : colors.border },
              ]}
            >
              <View style={styles.paymentHeader}>
                <ThemedText style={{ fontSize: 24 }}>🛒</ThemedText>
                <View style={{ flex: 1 }}>
                  <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>In-App Purchase</ThemedText>
                  <ThemedText style={{ fontSize: 11, color: colors.text, opacity: 0.6, marginTop: 2 }}>
                    Apple/Google Pay via App Store
                  </ThemedText>
                </View>
              </View>
              {paymentMethod === 'iap' && (
                <View style={[styles.radioSelected, { backgroundColor: colors.success }]}>
                  <ThemedText style={{ color: '#fff' }}>✓</ThemedText>
                </View>
              )}
            </Pressable>
          </View>

          {/* Payment Info */}
          <View style={[styles.infoBox, { backgroundColor: colorScheme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)' }]}>
            <ThemedText style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
              {paymentMethod === 'iap' ? '🛒 Secure In-App Purchase' : '🔒 Secure Payment'}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: colors.text, opacity: 0.7 }}>
              {paymentMethod === 'iap' 
                ? 'Purchase through your Apple/Google account. Safe and secure.' 
                : `Your payment information is encrypted and secure.`}
              {sandboxMode && ' (Sandbox Mode - No real charges)'}
            </ThemedText>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable
              onPress={() => setShowCheckout(false)}
              style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>Back to Cart</ThemedText>
            </Pressable>

            <Pressable
              onPress={handleCheckout}
              disabled={processing}
              style={[styles.placeOrderButton, { backgroundColor: processing ? colors.icon : colors.success }]}
            >
              <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
                {processing ? '⏳ Processing...' : `Place Order • ৳${total.toFixed(2)}`}
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={[styles.cartItem, { backgroundColor: colors.card }]}>
            <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
            
            <View style={styles.itemDetails}>
              <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>{item.title}</ThemedText>
              {item.isPremium && (
                <View style={[styles.premiumBadge, { backgroundColor: colors.warning }]}>
                  <ThemedText style={{ fontSize: 10, color: '#fff' }}>⭐ Premium</ThemedText>
                </View>
              )}
              <ThemedText type="defaultSemiBold" style={{ color: colors.success, marginTop: 4 }}>
                ৳{item.priceValue.toFixed(2)}
              </ThemedText>
            </View>

            <View style={styles.quantityControls}>
              <Pressable
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
                style={[styles.quantityButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              >
                <ThemedText style={{ color: colors.text }}>-</ThemedText>
              </Pressable>
              <ThemedText type="defaultSemiBold" style={{ color: colors.text, minWidth: 30, textAlign: 'center' }}>
                {item.quantity}
              </ThemedText>
              <Pressable
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                style={[styles.quantityButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              >
                <ThemedText style={{ color: colors.text }}>+</ThemedText>
              </Pressable>
            </View>

            <Pressable onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
              <ThemedText style={{ color: colors.error, fontSize: 18 }}>🗑️</ThemedText>
            </Pressable>
          </View>
        )}
        ListFooterComponent={
          <View style={{ marginTop: 16 }}>
            {/* Price Summary */}
            <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
              <View style={styles.summaryRow}>
                <ThemedText style={{ color: colors.text, opacity: 0.7 }}>Subtotal</ThemedText>
                <ThemedText style={{ color: colors.text }}>৳{subtotal.toFixed(2)}</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText style={{ color: colors.text, opacity: 0.7 }}>Delivery Fee</ThemedText>
                <ThemedText style={{ color: colors.text }}>৳{deliveryFee.toFixed(2)}</ThemedText>
              </View>
              {isPremium && (
                <View style={styles.summaryRow}>
                  <ThemedText style={{ color: colors.success }}>Premium Discount</ThemedText>
                  <ThemedText style={{ color: colors.success }}>-৳{discount.toFixed(2)}</ThemedText>
                </View>
              )}
              <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
                <ThemedText type="subtitle" style={{ color: colors.text }}>Total</ThemedText>
                <ThemedText type="subtitle" style={{ color: colors.success }}>৳{total.toFixed(2)}</ThemedText>
              </View>
            </View>

            {/* Checkout Button */}
            <Pressable
              onPress={() => setShowCheckout(true)}
              style={[styles.checkoutButton, { backgroundColor: colors.success }]}
            >
              <ThemedText type="defaultSemiBold" style={{ color: '#fff', fontSize: 16 }}>
                Proceed to Checkout
              </ThemedText>
            </Pressable>

            {/* Clear Cart */}
            <Pressable onPress={clearCart} style={[styles.clearButton, { borderColor: colors.border }]}>
              <ThemedText style={{ color: colors.error }}>Clear Cart</ThemedText>
            </Pressable>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    marginLeft: 8,
    justifyContent: 'center',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    marginBottom: 0,
  },
  checkoutButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  clearButton: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  section: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    fontSize: 16,
  },
  infoBox: {
    padding: 12,
    margin: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  placeOrderButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
});
