import React, { useState } from 'react';
import { Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/cart-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';

type Product = {
  id: string;
  sku: string;
  title: string;
  description?: string;
  price: string;
  priceValue: number;
  image: string;
};

const PRODUCTS: Product[] = [
  { 
    id: 'p1', 
    sku: 'food_small_1', 
    title: 'Fresh Apple Pack', 
    description: '3 crisp organic apples from local farms', 
    price: '৳ 50',
    priceValue: 50,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop'
  },
  { 
    id: 'p2', 
    sku: 'food_medium_1', 
    title: 'Classic Sandwich Combo', 
    description: 'Club sandwich with fries and soft drink', 
    price: '৳ 150',
    priceValue: 150,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop'
  },
  { 
    id: 'p3', 
    sku: 'food_large_1', 
    title: 'Family Feast', 
    description: 'Complete meal for 4: pizza, pasta & salad', 
    price: '৳ 499',
    priceValue: 499,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop'
  },
  { 
    id: 'p4', 
    sku: 'food_burger_1', 
    title: 'Gourmet Burger', 
    description: 'Juicy beef patty with cheese & special sauce', 
    price: '৳ 199',
    priceValue: 199,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop'
  },
  { 
    id: 'p5', 
    sku: 'food_sushi_1', 
    title: 'Sushi Platter', 
    description: 'Assorted sushi rolls with wasabi & ginger', 
    price: '৳ 599',
    priceValue: 599,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop'
  },
  { 
    id: 'p6', 
    sku: 'food_salad_1', 
    title: 'Garden Fresh Salad', 
    description: 'Mixed greens with grilled chicken & dressing', 
    price: '৳ 249',
    priceValue: 249,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop'
  },
  { 
    id: 'p7', 
    sku: 'food_tacos_1', 
    title: 'Spicy Tacos Trio', 
    description: '3 authentic Mexican tacos with guacamole', 
    price: '৳ 279',
    priceValue: 279,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop'
  },
  { 
    id: 'p8', 
    sku: 'food_ramen_1', 
    title: 'Tonkotsu Ramen Bowl', 
    description: 'Rich pork broth with noodles, egg & vegetables', 
    price: '৳ 399',
    priceValue: 399,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop'
  },
  { 
    id: 'p9', 
    sku: 'food_curry_1', 
    title: 'Chicken Tikka Masala', 
    description: 'Aromatic curry with rice & naan bread', 
    price: '৳ 329',
    priceValue: 329,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop'
  },
  { 
    id: 'p10', 
    sku: 'food_pasta_1', 
    title: 'Creamy Carbonara', 
    description: 'Classic Italian pasta with bacon & parmesan', 
    price: '৳ 299',
    priceValue: 299,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=400&fit=crop'
  },
  { 
    id: 'p11', 
    sku: 'food_pancakes_1', 
    title: 'Breakfast Pancakes', 
    description: 'Fluffy pancakes with maple syrup & berries', 
    price: '৳ 189',
    priceValue: 189,
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop'
  },
  { 
    id: 'p12', 
    sku: 'food_smoothie_1', 
    title: 'Tropical Smoothie Bowl', 
    description: 'Fresh fruits, granola & coconut flakes', 
    price: '৳ 199',
    priceValue: 199,
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=400&fit=crop'
  },
  { 
    id: 'p13', 
    sku: 'food_wings_1', 
    title: 'Buffalo Chicken Wings', 
    description: 'Spicy wings with blue cheese dip', 
    price: '৳ 259',
    priceValue: 259,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=400&fit=crop'
  },
  { 
    id: 'p14', 
    sku: 'food_dessert_1', 
    title: 'Chocolate Lava Cake', 
    description: 'Warm cake with molten chocolate center', 
    price: '৳ 149',
    priceValue: 149,
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=400&fit=crop'
  },
];

export default function ShopScreen() {
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { addToCart, getTotalItems } = useCart();

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
          data={PRODUCTS}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            return (
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <Image
                  source={{ uri: item.image }}
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
