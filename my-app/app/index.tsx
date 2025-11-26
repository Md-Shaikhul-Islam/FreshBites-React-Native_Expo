import { useUser } from '@/context/user-context';
import { Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
  const { user, loading } = useUser();

  // Show nothing while loading
  if (loading) {
    return null;
  }

  // If user is logged in, go to shop
  if (user) {
    return <Redirect href="/(tabs)/shop" />;
  }

  // Otherwise, show welcome screen
  return <Redirect href="/welcome" />;
}
