import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/cart-context';
import { useUser } from '@/context/user-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dataManager, type Product } from '@/services/data-manager';
import { useFocusEffect } from '@react-navigation/native';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function PremiumScreen() {
  const { isPremium } = useUser();
  const { addToCart } = useCart();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [failedImages, setFailedImages] = React.useState<Record<string, boolean>>({});
  const [premiumItems, setPremiumItems] = useState<Product[]>([]);

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';
  const withParams = (url: string) =>
    `${url}${url.includes('?') ? '&' : '?'}auto=format&fit=crop&w=800&q=80`;

  // Reload premium items when screen comes into focus (for manager updates)
  useFocusEffect(
    React.useCallback(() => {
      loadPremiumItems();
    }, [])
  );

  // Subscribe to real-time product changes
  React.useEffect(() => {
    const unsubscribe = dataManager.onAction((action) => {
      console.log('⭐ Premium: Product change detected:', action.type);
      loadPremiumItems();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadPremiumItems = async () => {
    try {
      const data = await dataManager.getPremiumItems();
      setPremiumItems(data);
    } catch (error) {
      console.error('Error loading premium items:', error);
    }
  };

  const handleAddToCart = (item: Product) => {
    addToCart({
      id: item.id,
      sku: item.sku,
      title: item.title,
      description: item.description,
      price: item.price,
      priceValue: item.priceValue,
      image: item.image,
      isPremium: true,
    });
    
    Alert.alert(
      '✅ Added to Cart',
      `${item.title} has been added to your cart!`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
      ]
    );
  };

  if (!isPremium) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.lockedContainer}>
          <ThemedText style={styles.lockIcon}>🔒</ThemedText>
          <ThemedText type="title" style={{ textAlign: 'center', color: colors.text }}>Premium Access Required</ThemedText>
          <ThemedText style={{ textAlign: 'center', marginTop: 8, color: colors.text, opacity: 0.7 }}>
            Unlock exclusive premium dishes and special chef selections
          </ThemedText>
          <View style={{ height: 16 }} />
          <Link href="/(tabs)/profile" asChild>
            <Pressable style={[styles.upgradeButton, { backgroundColor: colors.warning }]}>
              <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>⭐ Upgrade to Premium</ThemedText>
            </Pressable>
          </Link>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.premiumBadge, { backgroundColor: colorScheme === 'dark' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)' }]}>
          <ThemedText type="subtitle" style={{ color: colors.warning }}>⭐ Premium Menu</ThemedText>
          <ThemedText style={{ fontSize: 12, color: colors.text, opacity: 0.8, marginTop: 4 }}>Exclusive dishes for premium members</ThemedText>
        </View>

        <FlatList
          scrollEnabled={false}
          data={premiumItems}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Image
                source={{ uri: failedImages[item.id] ? FALLBACK_IMAGE : withParams(item.image) }}
                onError={() => setFailedImages((m) => ({ ...m, [item.id]: true }))}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <ThemedText type="subtitle" style={{ color: colors.text }}>{item.title}</ThemedText>
                  <View style={[styles.premiumTag, { backgroundColor: colors.warning }]}>
                    <ThemedText style={styles.premiumTagText}>⭐</ThemedText>
                  </View>
                </View>
                <ThemedText style={[styles.description, { color: colors.text, opacity: 0.7 }]}>{item.description}</ThemedText>
                <View style={styles.cardFooter}>
                  <ThemedText type="defaultSemiBold" style={[styles.price, { color: colors.success }]}>{item.price}</ThemedText>
                  <Pressable 
                    onPress={() => handleAddToCart(item)} 
                    style={[styles.addButton, { backgroundColor: colors.success }]}
                  >
                    <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>Add to Cart</ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  lockIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  upgradeButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  premiumBadge: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  itemImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f3f4f6',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  premiumTag: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  premiumTagText: {
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 20,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 2,
  },
});
