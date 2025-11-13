 # 🍔 FreshBites - Food Delivery App

A modern React Native food delivery application built with Expo, featuring in-app purchases, premium membership, and a beautiful UI.

---

## � App Overview

**FreshBites** is a complete food delivery application that demonstrates:
- Product browsing and purchasing
- Premium membership system with gated content
- User profile management with editable fields
- Sandbox mode for testing premium features
- In-app purchase integration (Google Play Billing ready)

---

## 🏗️ Project Structure Explained

### **Root Files**

#### `package.json`
- **Purpose**: Defines all dependencies and scripts
- **Key Dependencies**:
  - `expo ~54.0.23` - Expo SDK
  - `react-native 0.76.5` - React Native framework
  - `expo-router ~6.0.14` - File-based routing
  - `react-native-iap` - In-app purchases
  - `@react-native-async-storage/async-storage` - Persistent storage

#### `app.json`
- **Purpose**: Expo configuration file
- **Contains**: App name, slug, version, icons, splash screen settings

#### `tsconfig.json`
- **Purpose**: TypeScript configuration
- **Features**: Path aliases (@/*), strict mode enabled

---

## 📂 Directory Structure

```
my-app/
├── app/                          # Main application code (Expo Router)
│   ├── (tabs)/                   # Tab-based screens
│   │   ├── _layout.tsx           # Tab navigation configuration
│   │   ├── shop.tsx              # Food shop with products
│   │   ├── premium.tsx           # Premium-only menu
│   │   ├── profile.tsx           # User profile & settings
│   │   ├── about.tsx             # About page with contact
│   │   ├── index.tsx             # Hidden (not used)
│   │   └── explore.tsx           # Hidden (not used)
│   ├── _layout.tsx               # Root layout with UserProvider
│   └── modal.tsx                 # Example modal screen
│
├── components/                   # Reusable UI components
│   ├── themed-text.tsx           # Text with theme support
│   ├── themed-view.tsx           # View with theme support
│   ├── haptic-tab.tsx            # Tab button with haptic feedback
│   ├── ui/
│   │   ├── icon-symbol.tsx       # Cross-platform icon component
│   │   └── collapsible.tsx       # Collapsible section
│   └── [other components]
│
├── context/                      # React Context for global state
│   └── user-context.tsx          # Premium status & sandbox mode
│
├── services/                     # Business logic & API integrations
│   └── iap.ts                    # In-app purchase service
│
├── constants/                    # App-wide constants
│   └── theme.ts                  # Color themes & fonts
│
├── hooks/                        # Custom React hooks
│   ├── use-color-scheme.ts       # Dark/light mode detection
│   └── use-theme-color.ts        # Theme color helper
│
└── assets/                       # Images, fonts, icons
    └── images/
```

---

## 🔍 File-by-File Explanation

### **1. App Entry & Navigation**

#### `app/_layout.tsx` (Root Layout)
```typescript
// Purpose: App entry point, wraps entire app with providers
// What it does:
// - Wraps app in UserProvider (premium state management)
// - Sets up theme (dark/light mode)
// - Defines navigation structure (tabs + modals)
```

#### `app/(tabs)/_layout.tsx` (Tab Navigation)
```typescript
// Purpose: Configures bottom tab navigation
// Features:
// - 4 tabs: Shop, Premium (conditional), Profile, About
// - Custom icons for each tab
// - Premium tab only shows if user isPremium
// - Header bars enabled with custom titles
// - Haptic feedback on tab press
```

---

### **2. Screen Components**

#### `app/(tabs)/shop.tsx` - **Food Shop**
```typescript
// Purpose: Main shopping screen with products
// Features:
// - Lists 3 food products (Apple Pack, Sandwich, Family Meal)
// - Simulated purchase flow (works in Expo Go)
// - Per-item loading states (clicking one doesn't disable others)
// - Promotional banner at top
// - Restore purchases button
// - Beautiful card design with images
// How it works:
// 1. User clicks "Buy Now" on a product
// 2. Item loading state activates (only that item)
// 3. Simulates 800ms purchase delay
// 4. Shows success alert
// 5. Removes loading state
```

#### `app/(tabs)/premium.tsx` - **Premium Menu**
```typescript
// Purpose: Exclusive premium products (gated content)
// Features:
// - Locked state for non-premium users (🔒 icon + upgrade prompt)
// - Shows 3 premium dishes with images & descriptions
// - Premium badges on each item (⭐)
// - Add to Cart functionality
// How it works:
// 1. Checks if user isPremium from context
// 2. If NO → Shows locked screen with "Upgrade" button
// 3. If YES → Shows premium products list
// Key: This demonstrates content gating based on purchase
```

#### `app/(tabs)/profile.tsx` - **User Profile**
```typescript
// Purpose: User profile management & premium upgrade
// Features:
// - Avatar with user initial
// - Editable personal info (name, email, phone, address)
// - Edit/Save toggle
// - Membership status dropdown (Normal/Premium)
// - Sandbox mode toggle (🧪) for testing
// - Upgrade to Premium button
// - Restore Purchases button
// How sandbox works:
// 1. Toggle sandbox mode ON
// 2. Click "Upgrade (Sandbox)"
// 3. Instantly becomes premium (no charge)
// 4. Premium tab appears in navigation
```

#### `app/(tabs)/about.tsx` - **About Page**
```typescript
// Purpose: App information and contact
// Features:
// - App logo and tagline
// - Detailed app description
// - Feature list with icons (🛒, ⭐, 💳, 🧪)
// - Technology stack explanation
// - Contact section with email button
// - Opens mail client: bsse1438@iit.du.ac.bd
// - Footer with version info
```

---

### **3. State Management**

#### `context/user-context.tsx` - **User Context**
```typescript
// Purpose: Global state for premium status
// What it manages:
// - isPremium: boolean (user's premium status)
// - setPremium: function to update status
// - sandboxMode: boolean (testing mode)
// - setSandboxMode: toggle function
// - loading: boolean (initial load state)

// How it works:
// 1. On app start: Loads isPremium from AsyncStorage
// 2. Dynamic import of AsyncStorage (works in Expo Go)
// 3. Falls back to in-memory storage if native unavailable
// 4. Persists premium status across app restarts
// 5. Exposes state via useUser() hook

// Usage in components:
const { isPremium, setPremium, sandboxMode } = useUser();
```

---

### **4. Business Logic**

#### `services/iap.ts` - **In-App Purchase Service**
```typescript
// Purpose: Handles Google Play Billing integration
// Key Functions:
// - initIAP(): Initialize connection to Play Store
// - requestPremiumPurchase(): Trigger purchase for "premium_unlock"
// - restorePremium(): Check for existing purchases
// - getPremiumProducts(): Fetch product details from store

// How it works:
// 1. Dynamic import of react-native-iap
// 2. If unavailable (Expo Go) → Returns simulated success
// 3. If available (dev build) → Real purchase flow
// 4. Connects to Google Play Billing
// 5. Requests purchase with SKU "premium_unlock"
// 6. Finishes transaction when complete
// 7. Returns success/failure

// Why dynamic import?
// - Allows app to run in Expo Go without native modules
// - Graceful fallback to simulation mode
```

---

### **5. Reusable Components**

#### `components/themed-text.tsx` & `themed-view.tsx`
```typescript
// Purpose: Components that adapt to dark/light theme
// Benefit: Consistent styling across app
// Auto-adjusts colors based on system theme
```

#### `components/haptic-tab.tsx`
```typescript
// Purpose: Tab button with vibration feedback
// When user taps tab → Phone vibrates slightly
// Better UX and tactile feedback
```

#### `components/ui/icon-symbol.tsx`
```typescript
// Purpose: Cross-platform icon component
// Maps SF Symbols (iOS) to Material Icons (Android)
// Examples:
// - 'cart.fill' → 'shopping-cart'
// - 'star.fill' → 'star'
// - 'house.fill' → 'home'
```

---

### **6. Configuration Files**

#### `constants/theme.ts`
```typescript
// Defines color schemes for light/dark mode
// Colors for text, background, tints, etc.
```

#### `hooks/use-color-scheme.ts`
```typescript
// Custom hook to detect system theme (light/dark)
// Returns: 'light' | 'dark' | null
```

---

## 🎯 How the App Works (User Journey)

### **Normal User Flow:**
1. Opens app → Sees Shop, Profile, About tabs
2. Browses products in Shop
3. Clicks "Buy Now" → Simulated purchase alert
4. Goes to Profile → Sees "Normal" status
5. Premium tab is hidden

### **Upgrading to Premium:**
1. Go to Profile tab
2. Enable "🧪 Sandbox Mode" (for testing)
3. Click "🧪 Upgrade (Sandbox)"
4. Alert: "Premium unlocked"
5. Premium tab appears in bottom navigation
6. Can now access exclusive premium dishes

### **Premium User Flow:**
1. Has Premium tab visible
2. Opens Premium tab
3. Sees exclusive dishes (Chef's Sushi, Truffle Pasta, Golden Steak)
4. Can add premium items to cart
5. Profile shows "⭐ Premium Member" badge

---

## 🧪 Testing Features

### **Sandbox Mode** (Developer Testing)
- **Location**: Profile tab
- **Purpose**: Test premium features without real purchases
- **How to use**:
  1. Toggle sandbox mode ON
  2. Click "Upgrade (Sandbox)"
  3. Instantly unlocks premium (no charge)
  4. Can toggle back to Normal anytime

### **Simulated Purchases** (Expo Go)
- Shop screen uses simulated billing
- No native modules required
- Works in Expo Go without build
- Shows realistic purchase flow

---

## 📦 Dependencies Explained

### **Core Framework**
- `expo` - Complete development platform
- `react-native` - Mobile app framework
- `expo-router` - File-based navigation

### **Navigation**
- `@react-navigation/native` - Navigation library
- `react-native-screens` - Native screen management
- `react-native-safe-area-context` - Safe area handling

### **UI & Styling**
- `@expo/vector-icons` - Icon library
- `expo-haptics` - Vibration feedback
- `react-native-reanimated` - Animations

### **Data & Storage**
- `@react-native-async-storage/async-storage` - Local storage
- Stores premium status persistently

### **In-App Purchases**
- `react-native-iap` - Google Play/App Store billing
- Handles real premium purchases in production

---

## 🚀 Getting Started

### **Installation**
```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Scan QR code with Expo Go app
```

### **Running on Device**
```bash
# Android (requires Android Studio)
npm run android

# iOS (requires Xcode, macOS only)
npm run ios
```

---

## 🛠️ Development Commands

```bash
# Start with cache cleared
npx expo start -c

# Run linter
npm run lint

# Reset to fresh project
npm run reset-project
```

---

## 🎨 Key Features

### ✅ **Implemented**
- ✅ Bottom tab navigation with 4 tabs
- ✅ Food shop with 3 products
- ✅ Premium membership system
- ✅ Content gating (Premium tab)
- ✅ Editable user profile
- ✅ Sandbox mode for testing
- ✅ Simulated purchases in Expo Go
- ✅ Persistent premium status
- ✅ Dark/light theme support
- ✅ Haptic feedback
- ✅ Email contact integration
- ✅ Beautiful modern UI

### 🔄 **For Production** (Requires Dev Build)
- Real Google Play Billing integration
- Receipt validation on backend
- Actual payment processing
- Product price fetching from store

---

## 📧 Contact

**Email**: bsse1438@iit.du.ac.bd  
**App Name**: FreshBites  
**Version**: 1.0.0

---

## 📝 Notes

### **Why Expo Go Limitations?**
- Native modules (AsyncStorage, react-native-iap) don't work in Expo Go
- Solution: Dynamic imports with graceful fallbacks
- For real IAP: Must build with `expo run:android`

### **Sandbox vs Production**
- **Sandbox**: Instant premium unlock (testing only)
- **Production**: Real purchase through Google Play

### **File Organization**
- `app/` - All screens (Expo Router convention)
- `components/` - Reusable UI
- `context/` - Global state
- `services/` - Business logic
- Clean separation of concerns

---

## 🎓 Learning Points

This app demonstrates:
1. **Expo Router** - File-based navigation
2. **Context API** - Global state management
3. **Dynamic Imports** - Graceful native module handling
4. **Conditional Rendering** - Content gating
5. **Persistent Storage** - AsyncStorage
6. **Theme Support** - Dark/light mode
7. **TypeScript** - Type-safe development
8. **Component Composition** - Reusable UI patterns

---

**Made with ❤️ using React Native & Expo**
