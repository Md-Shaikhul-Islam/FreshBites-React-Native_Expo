# FreshBites Mobile Application – Technical Report

## 1. Project Overview
FreshBites is a cross-platform mobile application built using **Expo** and **React Native**, designed to provide a seamless user experience across Android, iOS, and Web. The project integrates modern tools and backend services such as **Supabase**, **Firebase**, and **Expo Notifications**, supporting real-time features, authentication, and background tasks.

This technical report outlines the technologies, tools, libraries, and system architecture used to build the application.

---

## 2. Core Technologies
### **2.1 Expo Framework**
- Version: `~54.0.23`
- Used for building React Native apps with unified tooling.
- Supports OTA updates, background services, notifications, and deep linking.
- Provides device capabilities (Haptics, File System, Device Info, etc.)

### **2.2 React Native**
- Version: `0.81.5`
- Primary UI framework for building native-like interfaces.
- Allows reusable component-driven development.

### **2.3 React (Core)**
- Version: `19.1.0`
- Handles component rendering, state, and UI logic.

### **2.4 Expo Router**
- Version: `~6.0.14`
- File-based routing system.
- Enables typed routes (enabled via Expo experiments).

---

## 3. Application Configuration (app.json)
### **3.1 Project Metadata**
- Name: **FreshBites**
- Bundle ID / Package ID: `com.freshbites.app`
- Scheme for deep linking: `freshbites`

### **3.2 Android Configuration**
- Edge-to-edge UI enabled.
- Predictive back gesture disabled for custom behavior.
- Adaptive icons with foreground + background assets.
- Android package permissions:
  - Notifications (`POST_NOTIFICATIONS`, `NOTIFICATIONS`)
  - Alarm Scheduling (`SCHEDULE_EXACT_ALARM`, `USE_EXACT_ALARM`)
  - Boot events / background work (`RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK`)
- Version code: `1`

### **3.3 iOS Configuration**
- Tablet support enabled.
- Background Modes: Remote notifications.
- Non-exempt encryption disabled.

### **3.4 Web Configuration**
- Static export mode.
- Custom favicon.

### **3.5 Expo Plugins Used**
- `expo-router`
- `expo-notifications`
- `expo-splash-screen`
- `expo-background-fetch`
- `expo-task-manager`

---

## 4. Libraries and Dependencies
### **4.1 UI / UX Libraries**
- `expo-image`: Efficient image rendering.
- `expo-font`: Custom font loading.
- `@expo/vector-icons`: Icon system.
- `react-native-gesture-handler`: Gesture support.
- `react-native-reanimated`: Smooth animations.
- `react-native-safe-area-context`: Screen edge behavior.

### **4.2 Navigation**
- `@react-navigation/native`
- `@react-navigation/bottom-tabs`
- `expo-linking`
- `expo-router`

### **4.3 Backend Integrations**
#### **Supabase**
- Library: `@supabase/supabase-js`
- Used for:
  - Authentication
  - CRUD operations
  - Realtime Features
  - Storage

#### **Firebase**
- Library: `firebase`
- Used primarily for push notifications and analytics.

### **4.4 Notifications**
- `expo-notifications`: Push + local notifications.
- Supports foreground, background, and scheduled notifications.

### **4.5 Background Services**
- `expo-background-fetch`
- `expo-task-manager`
- Used for:
  - Background data syncing
  - Alarm or schedule-based tasks

### **4.6 In-App Purchases**
- `react-native-iap`
- Manages product purchases, subscriptions, and receipts.

### **4.7 Storage**
- `@react-native-async-storage/async-storage`
- Used for caching and persistent local data.

---

## 5. Build System
### **5.1 EAS Build**
- EAS Project ID: `5a896387-7564-48d7-855f-99982fa80789`
- Supports building:
  - Android APK / AAB
  - iOS IPA
  - Web static build

### **5.2 npm Scripts**
| Script | Purpose |
|--------|----------|
| `start` | Start Metro Bundle + Expo Dev Tools |
| `android` | Run native build on Android device/emulator |
| `ios` | Run native build on iOS simulator |
| `web` | Launch web version |
| `reset-project` | Custom script to reset environment |
| `lint` | Linting with Expo's ESLint config |
| `test` | Jest testing |

---

## 6. Features Supported in Architecture
### **6.1 Push Notifications**
- Custom notification icons for both platforms.
- Background delivery support.
- Firebase / Expo notifications integration.

### **6.2 Background Fetch Tasks**
- Periodic background tasks using `TaskManager`.
- Uses `useNextTaskDeadline` for Android optimal timing.

### **6.3 Splash Screen**
- Custom light/dark mode splash screen.

### **6.4 Deep Linking**
- Using Expo scheme `freshbites://`
- Works with router for navigation via external links.

### **6.5 Cross-Platform Optimization**
- New architecture enabled: `React Native Fabric + TurboModules`.
- Enhances performance, memory usage, and animations.

---

## 7. Project Structure Overview
Typical Expo Router layout:
```
app/
  ├─ (tabs)/
  │   ├─ index.tsx
  │   ├─ profile.tsx
  │   └─ settings.tsx
  ├─ auth/
  │   ├─ login.tsx
  │   ├─ register.tsx
  ├─ api/
  │   └─ notifications.ts
  ├─ _layout.tsx
assets/
scripts/
```

---

## 8. Conclusion
FreshBites is built using a modern, scalable, and maintainable technology stack powered by **Expo**, **React Native**, **Supabase**, and **Firebase**. The architecture ensures:
- Cross-platform consistency
- Fast iteration and deployment via EAS
- Smooth integrations of background tasks, notifications, and in-app purchases
- Performance optimization through React Native’s new architecture

This robust setup enables future expansions such as analytics, real-time updates, offline capabilities, and advanced product workflows.


---

## 9. Detailed Package Descriptions
Below is a comprehensive explanation of each major dependency used in the FreshBites project, describing their purpose and how they contribute to the application.

### ### **9.1 Core Framework & System Packages**

#### **expo** (`~54.0.23`)
Provides Expo's runtime environment, API modules, developer tools, and build ecosystem. It abstracts native modules, simplifies updates, and enables cross-platform development.

#### **react-native** (`0.81.5`)
Base framework for building native apps using JavaScript/TypeScript. Creates native UI elements and handles platform-level interactions.

#### **react** (`19.1.0`)
Core library for building UI components, managing state, and rendering logic.

#### **react-native-web** (`~0.21.0`)
Allows React Native components to run on the web by rendering them into DOM elements.

---

### ### **9.2 UI, Icons & Visual Enhancements**

#### **@expo/vector-icons**
Icon library containing Ionicons, MaterialIcons, FontAwesome, etc. Used across the UI for consistent and scalable icons.

#### **expo-image** (`~3.0.10`)
High‑performance image component replacing `Image`. Provides caching and GPU-accelerated rendering.

#### **expo-font** (`~14.0.9`)
Allows loading and using custom fonts.

#### **expo-splash-screen** (`~31.0.10`)
Controls the native splash screen with full customization.

#### **expo-status-bar** (`~3.0.8`)
Provides a cross‑platform status bar component.

#### **expo-symbols** (`~1.0.7`)
Enables Apple SF Symbols support.

#### **react-native-svg** (`^15.15.0`)
Renders SVG content such as icons, charts, and illustrations.

#### **react-native-reanimated** (`~4.1.1`)
High-performance animation library powering gesture interactions and smooth transitions.

#### **react-native-gesture-handler** (`~2.28.0`)
Provides complex gesture recognition support—swipes, pans, long-presses—critical for navigation.

#### **react-native-safe-area-context** (`~5.6.0`)
Ensures UI avoids device notches, rounded corners, and status bars.

#### **react-native-screens** (`~4.16.0`)
Improves navigation performance using native primitives for screens.

---

### ### **9.3 Navigation & Deep Linking**

#### **expo-router** (`~6.0.14`)
File‑based routing system. Simplifies navigation structure by mapping folder structure to screens.

#### **@react-navigation/native** (`^7.1.8`)
Provides core navigation primitives.

#### **@react-navigation/bottom-tabs** (`^7.4.0`)
Implements bottom tab navigation.

#### **expo-linking** (`~8.0.8`)
Handles deep linking: `freshbites://screen`.

---

### ### **9.4 Storage, Files & Device APIs**

#### **@react-native-async-storage/async-storage** (`^2.2.0`)
Persistent key-value store used for caching, tokens, and offline data.

#### **expo-file-system** (`~19.0.17`)
Provides API for reading/writing files on the device.

#### **expo-device** (`~8.0.9`)
Retrieves device-specific information such as model and OS version.

#### **expo-haptics** (`~15.0.7`)
Enables vibration feedback for interactions.

#### **expo-system-ui** (`~6.0.8`)
Controls system UI appearance such as navigation bar and theme.

---

### ### **9.5 Backend & Networking**

#### **@supabase/supabase-js** (`^2.81.1`)
Client SDK for interacting with Supabase services:
- Authentication
- Realtime data
- Postgres Database
- Storage bucket
- Edge functions

#### **firebase** (`^12.6.0`)
Used for push notifications, analytics, or realtime updates depending on configuration.

#### **react-native-url-polyfill** (`^3.0.0`)
Provides URL and URLSearchParams API for mobile environments.

---

### ### **9.6 Notifications & Background Services**

#### **expo-notifications** (`~0.32.13`)
Enables local + push notifications.
Supports:
- Scheduling
- Custom sounds
- Foreground/Background handling
- Token registration

#### **expo-background-fetch** (`~14.0.8`)
Runs tasks at intervals, even when app isn't active.
Used for:
- Background data syncing
- Updating remote state

#### **expo-task-manager** (`~14.0.8`)
Registers tasks for background execution.

#### **expo-constants** (`~18.0.10`)
Provides environment constants like app version, device info, build channels.

---

### ### **9.7 In-App Purchases**

#### **react-native-iap** (`^14.4.40`)
Used for: 
- Subscriptions
- Consumables & non-consumables
- Price retrieval
- Transaction validation

Supports both Google Play Billing & Apple In-App Purchases.

---

### ### **9.8 Development, Testing & Linting**

#### **eslint** (`^9.25.0`) & **eslint-config-expo** (`~10.0.0`)
Ensures consistent code style and prevents errors.

#### **jest**
Used for unit testing.

#### **typescript** (`~5.9.2`)
Static typing system that improves reliability and maintainability.

---

### ### **9.9 Internal Scripts & Tools**

#### **reset-project.js**
Custom tool to:
- Clear caches
- Reset builds
- Clean dependencies for fresh environment setup.

---

## 10. Summary
The FreshBites project uses a modern and powerful stack built on Expo + React Native, integrating backend capabilities through Supabase & Firebase, advanced navigation through Expo Router, and real native enhancements using animations, gestures, and background services.

The detailed breakdown of all dependencies clarifies how each package contributes to functionality, performance, and overall architecture.
