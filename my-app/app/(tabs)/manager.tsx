import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useUser } from '@/context/user-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dataManager, type Product } from '@/services/data-manager';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    View
} from 'react-native';

// Generate a simple UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function ManagerScreen() {
  const { isManager } = useUser();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPremiumItem, setIsPremiumItem] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allPremiumItems, setAllPremiumItems] = useState<Product[]>([]);

  useEffect(() => {
    initializeData();

    // Set up listener for real-time product changes
    const unsubscribe = dataManager.onAction((action) => {
      console.log('📦 Manager: Product change detected:', action.type);
      // Reload items when products change
      loadItems();
    });

    return () => {
      // Cleanup listener on unmount
      unsubscribe();
    };
  }, []);

  const initializeData = async () => {
    await dataManager.initialize();
    await loadItems();
  };

  const loadItems = async () => {
    try {
      const products = await dataManager.getProducts();
      const premiumItems = await dataManager.getPremiumItems();
      
      setAllProducts(products);
      setAllPremiumItems(premiumItems);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  if (!isManager) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.accessDenied}>
          <ThemedText style={styles.lockIcon}>🔒</ThemedText>
          <ThemedText type="title" style={{ textAlign: 'center', color: colors.text }}>
            Manager Access Required
          </ThemedText>
          <ThemedText style={{ textAlign: 'center', marginTop: 8, color: colors.text, opacity: 0.7 }}>
            Only managers can access this feature
          </ThemedText>
          <View style={{ height: 16 }} />
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={[styles.button, { backgroundColor: colors.tint }]}
          >
            <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
              Go to Profile
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  const handleAddItem = async () => {
    if (!title.trim() || !price.trim()) {
      Alert.alert('Validation Error', 'Please fill in title and price');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price');
      return;
    }

    const newItem: Product = {
      id: generateUUID(), // Generate proper UUID
      sku: `${isPremiumItem ? 'premium' : 'food'}_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      price: `৳${priceValue}`, // Display format for app
      priceValue: priceValue,
      image: imageUrl.trim() || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
    };

    try {
      const success = await dataManager.addItem(newItem, isPremiumItem);
      
      if (success) {
        await loadItems();
        
        Alert.alert(
          '✅ Item Added Successfully',
          `${newItem.title} has been added to ${isPremiumItem ? 'Premium' : 'Regular'} items!`,
          [
            { text: 'Add Another', style: 'cancel' },
            {
              text: 'View Items',
              onPress: () => router.push(isPremiumItem ? '/(tabs)/premium' : '/(tabs)/shop'),
            },
          ]
        );

        // Clear form
        setTitle('');
        setDescription('');
        setPrice('');
        setImageUrl('');
      } else {
        Alert.alert('Error', 'Failed to save item. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save item. Please try again.');
      console.error('Error saving item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string, isPremium: boolean) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await dataManager.deleteItem(itemId, isPremium);
              
              if (success) {
                await loadItems();
                Alert.alert('✅ Success', 'Item deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete item. Please try again.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item. Please try again.');
              console.error('Error deleting item:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText type="title">Add New Item</ThemedText>
          <ThemedText style={{ color: colors.text, opacity: 0.7, marginTop: 4 }}>
            Add items to the shop or premium menu
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldContainer}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Item Title *
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="e.g., Delicious Pizza"
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#666'}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.fieldContainer}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Description
            </ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="e.g., Fresh mozzarella with basil"
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#666'}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.fieldContainer}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Price (৳) *
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="e.g., 299"
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#666'}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.fieldContainer}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Image URL
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="https://images.unsplash.com/..."
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#666'}
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
            />
            <ThemedText style={[styles.hint, { color: colors.text, opacity: 0.6 }]}>
              Optional - defaults to placeholder image
            </ThemedText>
          </View>

          <View style={[styles.switchContainer, { backgroundColor: colors.card }]}>
            <View style={{ flex: 1 }}>
              <ThemedText type="defaultSemiBold">Premium Item</ThemedText>
              <ThemedText style={{ fontSize: 12, color: colors.text, opacity: 0.7, marginTop: 2 }}>
                Add to premium menu instead of regular shop
              </ThemedText>
            </View>
            <Switch
              value={isPremiumItem}
              onValueChange={setIsPremiumItem}
              trackColor={{ false: '#767577', true: colors.success }}
              thumbColor={isPremiumItem ? '#fff' : '#f4f3f4'}
            />
          </View>

          <Pressable
            onPress={handleAddItem}
            style={[styles.addButton, { backgroundColor: colors.success }]}
          >
            <ThemedText type="defaultSemiBold" style={{ color: '#fff', fontSize: 16 }}>
              ✨ Add Item
            </ThemedText>
          </Pressable>

          <View style={styles.stats}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <ThemedText style={{ fontSize: 24, fontWeight: 'bold', color: colors.success }}>
                {allProducts.length}
              </ThemedText>
              <ThemedText style={{ color: colors.text, opacity: 0.7, marginTop: 4 }}>
                Regular Items
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <ThemedText style={{ fontSize: 24, fontWeight: 'bold', color: colors.warning }}>
                {allPremiumItems.length}
              </ThemedText>
              <ThemedText style={{ color: colors.text, opacity: 0.7, marginTop: 4 }}>
                Premium Items
              </ThemedText>
            </View>
          </View>
        </View>

        {/* All Items List */}
        {(allProducts.length > 0 || allPremiumItems.length > 0) && (
          <View style={styles.customItemsSection}>
            <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Manage Items</ThemedText>
            
            {allProducts.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <ThemedText type="defaultSemiBold" style={{ marginBottom: 8, color: colors.tint }}>
                  Regular Items ({allProducts.length})
                </ThemedText>
                {allProducts.map((item) => (
                  <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.card }]}>
                    <View style={{ flex: 1 }}>
                      <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                      <ThemedText style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                        {item.description || 'No description'}
                      </ThemedText>
                      <ThemedText style={{ fontSize: 14, marginTop: 4, color: colors.tint }}>
                        {item.price}
                      </ThemedText>
                    </View>
                    <Pressable
                      onPress={() => handleDeleteItem(item.id, false)}
                      style={[styles.deleteButton, { backgroundColor: colors.error }]}
                    >
                      <ThemedText style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Delete</ThemedText>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {allPremiumItems.length > 0 && (
              <View>
                <ThemedText type="defaultSemiBold" style={{ marginBottom: 8, color: '#fbbf24' }}>
                  Premium Items ({allPremiumItems.length})
                </ThemedText>
                {allPremiumItems.map((item) => (
                  <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.card }]}>
                    <View style={{ flex: 1 }}>
                      <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                      <ThemedText style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                        {item.description || 'No description'}
                      </ThemedText>
                      <ThemedText style={{ fontSize: 14, marginTop: 4, color: '#fbbf24' }}>
                        {item.price}
                      </ThemedText>
                    </View>
                    <Pressable
                      onPress={() => handleDeleteItem(item.id, true)}
                      style={[styles.deleteButton, { backgroundColor: colors.error }]}
                    >
                      <ThemedText style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Delete</ThemedText>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}


      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  lockIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  form: {
    padding: 20,
    paddingTop: 0,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  addButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  customItemsSection: {
    marginTop: 24,
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});
