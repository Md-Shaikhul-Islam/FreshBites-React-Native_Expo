import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/cart-context';
import { useUser } from '@/context/user-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Link, router } from 'expo-router';
import React from 'react';
import { Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

type PremiumItem = {
  id: string;
  sku: string;
  title: string;
  price: string;
  priceValue: number;
  description: string;
  image: string;
};

const PREMIUM_ITEMS: PremiumItem[] = [
  { 
    id: 'sp1',
    sku: 'premium_sushi_1', 
    title: "Chef's Special Sushi", 
    price: '৳ 899',
    priceValue: 899,
    description: 'Premium nigiri and maki selection with fresh wasabi and pickled ginger',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop'
  },
  { 
    id: 'sp2',
    sku: 'premium_pasta_1', 
    title: 'Truffle Pasta Deluxe', 
    price: '৳ 1199',
    priceValue: 1199,
    description: 'Handmade fettuccine with black truffle shavings and aged parmesan',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop'
  },
  { 
    id: 'sp3',
    sku: 'premium_steak_1', 
    title: 'Golden Wagyu Steak', 
    price: '৳ 1999',
    priceValue: 1999,
    description: 'Premium wagyu beef with 24k gold flakes and seasonal vegetables',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop'
  },
  { 
    id: 'sp4',
    sku: 'premium_lobster_1', 
    title: 'Lobster Thermidor', 
    price: '৳ 1599',
    priceValue: 1599,
    description: 'Fresh lobster in creamy brandy sauce with truffle butter',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=400&fit=crop'
  },
  { 
    id: 'sp5',
    sku: 'premium_caviar_1', 
    title: 'Caviar Delight', 
    price: '৳ 2499',
    priceValue: 2499,
    description: 'Premium Beluga caviar served with blinis and crème fraîche',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'
  },
  { 
    id: 'sp6',
    sku: 'premium_oysters_1', 
    title: 'Oysters Rockefeller', 
    price: '৳ 1299',
    priceValue: 1299,
    description: 'Half dozen fresh oysters with champagne mignonette',
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=400&fit=crop'
  },
  { 
    id: 'sp7',
    sku: 'premium_tuna_1', 
    title: 'Bluefin Tuna Tartare', 
    price: '৳ 1499',
    priceValue: 1499,
    description: 'Premium grade bluefin tuna with avocado and microgreens',
    image: 'https://images.unsplash.com/photo-1606914469175-a9a3a3ac5e00?w=400&h=400&fit=crop'
  },
  // { 
  //   id: 'sp8',
  //   sku: 'premium_duck_1', 
  //   title: 'Peking Duck Masterpiece', 
  //   price: '৳ 1799',
  //   priceValue: 1799,
  //   description: 'Traditional Peking duck with pancakes and hoisin sauce',
  //   image: 'https://images.unsplash.com/photo-1606240717484-9e5f5b7f7c12?w=400&h=400&fit=crop'
  // },
  // { 
  //   id: 'sp9',
  //   sku: 'premium_wine_1', 
  //   title: 'Vintage Wine Pairing', 
  //   price: '৳ 3999',
  //   priceValue: 3999,
  //   description: 'Curated selection of premium wines with cheese platter',
  //   image: 'https://images.unsplash.com/photo-1596142332133-327e2a4d3414?w=400&h=400&fit=crop'
  // },
  // { 
  //   id: 'sp10',
  //   sku: 'premium_molecular_1', 
  //   title: 'Molecular Gastronomy Experience', 
  //   price: '৳ 2999',
  //   priceValue: 2999,
  //   description: '7-course molecular cuisine journey by master chef',
  //   image: 'https://images.unsplash.com/photo-1606230785875-04c36c18a7fb?w=400&h=400&fit=crop'
  // },
];

export default function PremiumScreen() {
  const { isPremium } = useUser();
  const { addToCart } = useCart();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [failedImages, setFailedImages] = React.useState<Record<string, boolean>>({});

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';
  const withParams = (url: string) =>
    `${url}${url.includes('?') ? '&' : '?'}auto=format&fit=crop&w=800&q=80`;

  const handleAddToCart = (item: PremiumItem) => {
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
          data={PREMIUM_ITEMS}
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
