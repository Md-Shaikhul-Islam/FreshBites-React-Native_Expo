import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/cart-context';
import { useUser } from '@/context/user-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isPremium } = useUser();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: Colors[colorScheme ?? 'light'].text,
        },
        headerTintColor: Colors[colorScheme ?? 'light'].text,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide from navigation
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide from navigation
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          headerTitle: 'FreshBites Shop',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="premium"
        options={{
          title: 'Premium',
          headerTitle: '⭐ Premium Menu',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="star.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          headerTitle: 'Shopping Cart',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          tabBarIcon: ({ color }) => (
            <View style={{ position: 'relative' }}>
              <IconSymbol size={28} name="cart.fill" color={color} />
              {totalItems > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  right: -8,
                  backgroundColor: '#ef4444',
                  borderRadius: 10,
                  minWidth: 18,
                  height: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 4,
                }}>
                  <ThemedText style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                    {totalItems > 99 ? '99+' : totalItems}
                  </ThemedText>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          headerTitle: 'About FreshBites',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="info.circle" color={color} />,
        }}
      />
    </Tabs>
  );
}
