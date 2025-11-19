import React, { useState } from 'react';
import { Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/cart-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dataManager, type Product } from '@/services/data-manager';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

export default function ShopScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { addToCart } = useCart();

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';
  const withParams = (url: string) =>
    `${url}${url.includes('?') ? '&' : '?'}auto=format&fit=crop&w=800&q=80`;

  // Reload products when screen comes into focus (for manager updates)
  useFocusEffect(
    React.useCallback(() => {
      loadProducts();
    }, [])
  );

  // Subscribe to real-time product changes
  React.useEffect(() => {
    const unsubscribe = dataManager.onAction((action) => {
      console.log('🛍️ Shop: Product change detected:', action.type);
      loadProducts();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadProducts = async () => {
    try {
      const data = await dataManager.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      sku: product.sku,
      title: product.title,
      description: product.description,
      price: product.price,
      priceValue: product.priceValue,
      image: product.image,
      isPremium: false,
    });
    
    Alert.alert(
      '✅ Added to Cart',
      `${product.title} has been added to your cart!`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Promotion Banner */}
        <View style={[styles.banner, { backgroundColor: colorScheme === 'dark' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}>
          <ThemedText type="subtitle" style={{ color: colors.success }}>🎉 Special Offers</ThemedText>
          <ThemedText style={[styles.bannerText, { color: colors.text }]}>Free delivery on orders above ৳300</ThemedText>
        </View>

        <FlatList
          scrollEnabled={false}
          data={products}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            return (
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <Image
                  source={{ uri: failedImages[item.id] ? FALLBACK_IMAGE : withParams(item.image) }}
                  onError={() => setFailedImages((m) => ({ ...m, [item.id]: true }))}
                  style={styles.thumb}
                  resizeMode="cover"
                />

                <View style={styles.cardContent}>
                  <ThemedText type="subtitle" style={styles.productTitle}>{item.title}</ThemedText>
                  <ThemedText style={[styles.description, { color: colors.text, opacity: 0.7 }]}>{item.description}</ThemedText>
                  <View style={styles.cardFooter}>
                    <ThemedText type="defaultSemiBold" style={[styles.price, { color: colors.success }]}>{item.price}</ThemedText>
                    <Pressable
                      onPress={() => handleAddToCart(item)}
                      style={({ pressed }) => [
                        styles.buyButton,
                        { backgroundColor: colors.success },
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <ThemedText type="defaultSemiBold" style={styles.buyButtonText}>
                        🛒 Add to Cart
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          }}
        />

        {/* Info Box */}
        <View style={styles.footer}>
          <View style={[styles.infoBox, { backgroundColor: colorScheme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)' }]}>
            <ThemedText style={[styles.infoText, { color: colors.text }]}>�️ Shop with Confidence</ThemedText>
            <ThemedText style={[styles.infoSubtext, { color: colors.text, opacity: 0.7 }]}>
              Add items to cart and checkout securely
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  bannerText: {
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  thumb: { 
    width: 120, 
    height: 120, 
    backgroundColor: '#f3f4f6',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  productTitle: {
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
  },
  buyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    elevation: 2,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 13,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
  },
  infoBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoSubtext: { 
    fontSize: 12,
  },
});
