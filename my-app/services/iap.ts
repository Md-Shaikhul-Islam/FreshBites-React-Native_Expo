// Lightweight wrapper around react-native-iap with graceful fallback for Expo Go
import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';

// Detect if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

const PREMIUM_SKU = 'premium_unlock';

// Cart IAP Products - Consumable items for food orders
const CART_SKUS = {
  SMALL: 'cart_food_small',    // ৳0-200
  MEDIUM: 'cart_food_medium',  // ৳201-500
  LARGE: 'cart_food_large',    // ৳501-1000
  XLARGE: 'cart_food_xlarge',  // ৳1001+
} as const;

type IAPModule = typeof import('react-native-iap');

let IAP: IAPModule | null = null;
let initialized = false;

async function ensureIAP() {
  // Don't even try to load IAP in Expo Go
  if (isExpoGo) {
    console.log('IAP disabled in Expo Go - using sandbox mode');
    return null;
  }
  
  if (IAP) return IAP;
  try {
    // Check if we're in Expo Go by trying to require the module
    const mod = await import('react-native-iap');
    IAP = mod as IAPModule;
    return IAP;
  } catch (e) {
    // Not available (likely Expo Go) - silently fail
    console.log('IAP not available - using sandbox mode');
    return null;
  }
}

export async function initIAP(): Promise<boolean> {
  const mod = await ensureIAP();
  if (!mod) return false;
  if (initialized) return true;
  try {
    await mod.initConnection();
    initialized = true;
    return true;
  } catch (e) {
    console.warn('initIAP failed', e);
    return false;
  }
}

export async function getPremiumProducts() {
  const mod = await ensureIAP();
  if (!mod) return [];
  try {
    // Play Billing uses skus as string[]; for iOS it's productIds
    const ids = Platform.select({ ios: [PREMIUM_SKU], android: [PREMIUM_SKU] })!;
  // Some versions expose `fetchProducts` instead of `getProducts`
  const anyMod: any = mod as any;
  const items = anyMod.fetchProducts ? await anyMod.fetchProducts({ skus: ids }) : await (anyMod.getProducts?.({ skus: ids }) ?? Promise.resolve([]));
    return items;
  } catch (e) {
    console.warn('getProducts failed', e);
    return [];
  }
}

export async function requestPremiumPurchase(): Promise<boolean> {
  const mod = await ensureIAP();
  if (!mod) {
    // Simulate in Expo Go
    await new Promise((r) => setTimeout(r, 600));
    Alert.alert('Simulated purchase', 'Premium unlocked (development mode).');
    return true;
  }
  try {
    await initIAP();
    await mod.requestPurchase({
      skus: [PREMIUM_SKU],
      andDangerouslyFinishTransactionAutomaticallyIOS: true,
    } as any);

    // Since react-native-iap uses listeners, we do a lightweight verification by checking available purchases shortly after
    await new Promise((r) => setTimeout(r, 1500));
  const purchases = await mod.getAvailablePurchases();
  const hasPremium = purchases.some((p: any) => p.productId === PREMIUM_SKU || p.productIds?.includes(PREMIUM_SKU));
    if (hasPremium) {
      try {
        // Try to finish any pending transactions
        for (const p of purchases as any[]) {
          if (p.transactionId) {
            try {
              await mod.finishTransaction({ purchase: p, isConsumable: false });
            } catch {}
          }
        }
      } catch {}
      return true;
    }
    return false;
  } catch (e) {
    console.warn('requestPremiumPurchase failed', e);
    return false;
  }
}

export async function restorePremium(): Promise<boolean> {
  const mod = await ensureIAP();
  if (!mod) return false;
  try {
    await initIAP();
    const purchases = await mod.getAvailablePurchases();
    return purchases.some((p: any) => p.productId === PREMIUM_SKU || p.productIds?.includes(PREMIUM_SKU));
  } catch (e) {
    console.warn('restorePremium failed', e);
    return false;
  }
}

// Cart IAP Functions
export function getCartProductSKU(totalAmount: number): string {
  if (totalAmount <= 200) return CART_SKUS.SMALL;
  if (totalAmount <= 500) return CART_SKUS.MEDIUM;
  if (totalAmount <= 1000) return CART_SKUS.LARGE;
  return CART_SKUS.XLARGE;
}

export async function getCartProducts() {
  const mod = await ensureIAP();
  if (!mod) return [];
  try {
    const ids = Object.values(CART_SKUS);
    const anyMod: any = mod as any;
    const items = anyMod.fetchProducts 
      ? await anyMod.fetchProducts({ skus: ids }) 
      : await (anyMod.getProducts?.({ skus: ids }) ?? Promise.resolve([]));
    return items;
  } catch (e) {
    console.warn('getCartProducts failed', e);
    return [];
  }
}

export async function requestCartPurchase(totalAmount: number): Promise<boolean> {
  const mod = await ensureIAP();
  if (!mod) {
    // Simulate in Expo Go
    await new Promise((r) => setTimeout(r, 1000));
    Alert.alert(
      'Simulated IAP Purchase', 
      `Order placed via In-App Purchase\nAmount: ৳${totalAmount.toFixed(2)}\n\n(Development mode - no real charge)`
    );
    return true;
  }

  try {
    await initIAP();
    const sku = getCartProductSKU(totalAmount);
    
    // Request consumable purchase
    await mod.requestPurchase({
      skus: [sku],
      andDangerouslyFinishTransactionAutomaticallyIOS: false,
    } as any);

    // Wait for purchase to process
    await new Promise((r) => setTimeout(r, 2000));
    
    // Get recent purchases
    const purchases = await mod.getAvailablePurchases();
    const recentPurchase = purchases.find((p: any) => 
      p.productId === sku || p.productIds?.includes(sku)
    );

    if (recentPurchase) {
      try {
        // Finish consumable transaction
        await mod.finishTransaction({ 
          purchase: recentPurchase as any, 
          isConsumable: true 
        });
      } catch (e) {
        console.warn('Failed to finish transaction', e);
      }
      return true;
    }
    
    return false;
  } catch (e) {
    console.warn('requestCartPurchase failed', e);
    // Check if user cancelled
    if (String(e).includes('cancel') || String(e).includes('Cancel')) {
      return false;
    }
    throw e;
  }
}

export const PremiumSKU = PREMIUM_SKU;
export const CartSKUs = CART_SKUS;
 
