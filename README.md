# 🍔 FreshBites - React Native Food Delivery App

A modern, full-featured food delivery application built with React Native and Expo, featuring real-time notifications, in-app purchases, premium membership, and a beautiful, intuitive UI.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/react--native-0.81.5-green.svg)
![Expo](https://img.shields.io/badge/expo-~54.0.25-black.svg)
![License](https://img.shields.io/badge/license-Private-red.svg)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the App](#-running-the-app)
- [Building for Production](#-building-for-production)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)
- [Scripts](#-scripts)

---

## ✨ Features

### Core Features
- 🛒 **Product Browsing & Shopping**: Browse through food items with detailed descriptions and prices
- 🛍️ **Shopping Cart**: Add items to cart with quantity management
- 👤 **User Authentication**: Secure login and signup with Supabase
- 📦 **Order Management**: Place orders and track order history
- 💳 **In-App Purchases**: Google Play Billing integration for premium features

### Premium Features
- ⭐ **Premium Membership**: Access exclusive premium menu items
- 🔔 **Push Notifications**: Real-time order updates and promotional notifications
- 📱 **Device Registration**: Multi-device notification support
- 🎨 **Theme Support**: Dark mode and light mode
- 🔄 **Background Sync**: Automatic data synchronization

### User Experience
- 📱 **Responsive Design**: Works seamlessly on phones and tablets
- 🎯 **Tab Navigation**: Easy navigation between Shop, Premium, Cart, Notifications, and Profile
- ⚡ **Haptic Feedback**: Enhanced touch interactions
- 🖼️ **Optimized Images**: Fast loading with expo-image
- 🔐 **Secure Storage**: AsyncStorage for local data persistence

---

## 🛠️ Tech Stack

### Frontend
- **React Native** (0.81.5) - Mobile framework
- **Expo** (~54.0.25) - Development platform
- **Expo Router** (~6.0.15) - File-based routing
- **TypeScript** (~5.9.2) - Type safety
- **React** (19.1.0) - UI library

### Backend & Services
- **Supabase** - Backend as a Service (Authentication, Database, Storage)
- **Firebase** (^12.6.0) - Additional cloud services
- **Expo Notifications** (~0.32.13) - Push notifications

### Key Libraries
- **react-native-iap** (^14.4.40) - In-app purchases
- **@react-native-async-storage/async-storage** (^2.2.0) - Local storage
- **react-native-reanimated** (~4.1.1) - Animations
- **expo-background-fetch** (~14.0.8) - Background tasks
- **expo-task-manager** (~14.0.8) - Task scheduling

### Navigation
- **@react-navigation/native** (^7.1.8)
- **@react-navigation/bottom-tabs** (^7.4.0)
- **react-native-screens** (~4.16.0)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or later)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **npm** or **yarn**
   - npm comes with Node.js
   - Verify: `npm --version`

3. **Expo CLI**
   ```powershell
   npm install -g expo-cli
   ```

4. **Git** (optional, for version control)
   - Download from [git-scm.com](https://git-scm.com/)

5. **Android Studio** (for Android development)
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK and emulator

6. **Expo Go App** (for testing on physical device)
   - Download from Play Store (Android) or App Store (iOS)

---

## 🚀 Installation

### Step 1: Clone the Repository

```powershell
git clone https://github.com/Md-Shaikhul-Islam/FreshBites-React-Native_Expo.git
cd FreshBites-React-Native_Expo
```

### Step 2: Navigate to Project Directory

```powershell
cd my-app
```

### Step 3: Install Dependencies

Using npm:
```powershell
npm install
```

Or using yarn:
```powershell
yarn install
```

### Step 4: Fix Git Tracking (If Git is Installed)

The `.expo/` directory should not be committed to Git. It's already in `.gitignore`, but if it was previously tracked, remove it:

```powershell
git rm -r --cached .expo
git commit -m "Remove .expo directory from Git tracking"
```

**Note**: If Git is not in your PATH, you can:
1. Add Git to your system PATH, or
2. Use GitHub Desktop or another Git GUI tool
3. Or skip this step if you're not using version control

### Step 5: Configure Supabase

1. Create a file `config/supabase.ts` with your Supabase credentials:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

2. Set up your Supabase database using the provided SQL scripts:
   - `FIX_NEW_USER_NOTIFICATIONS.sql`
   - `NOTIFICATION_SYSTEM_REDESIGN.sql`

### Step 6: Verify Project Health

Run Expo Doctor to check for any issues:

```powershell
npx expo-doctor
```

Most checks should pass. If you see a warning about `.expo` directory, follow Step 4 above.

---

## 🏃 Running the App

### Development Mode

#### Start the Expo Development Server

```powershell
npm start
# or
npx expo start
```

This will open the Expo Developer Tools in your browser.

#### Run on Android Emulator

Make sure Android Studio and an emulator are running, then:

```powershell
npm run android
# or
npx expo run:android
```

#### Run on iOS Simulator (macOS only)

```powershell
npm run ios
# or
npx expo run:ios
```

#### Run on Physical Device

1. Install **Expo Go** app on your phone
2. Scan the QR code from the terminal or browser
3. The app will load on your device

#### Run on Web

```powershell
npm run web
# or
npx expo start --web
```

---

## 📱 Building for Production

### Android APK Build

#### Step 1: Install EAS CLI

```powershell
npm install -g eas-cli
```

#### Step 2: Login to Expo

```powershell
eas login
```

#### Step 3: Configure Build

```powershell
eas build:configure
```

#### Step 4: Build APK

For preview (APK):
```powershell
eas build --profile preview --platform android
```

For production (AAB):
```powershell
eas build --profile production --platform android
```

#### Step 5: Download APK

Once the build completes, download the APK from the provided link.

### Detailed Build Guide

For comprehensive build instructions, see `APK_BUILD_GUIDE.md` in the project root.

---

## 📂 Project Structure

```
FreshBites-React-Native_Expo/
│
├── my-app/                          # Main application directory
│   │
│   ├── app/                         # App screens (Expo Router)
│   │   ├── (tabs)/                  # Tab-based navigation
│   │   │   ├── _layout.tsx          # Tab layout configuration
│   │   │   ├── index.tsx            # Home/Shop screen
│   │   │   ├── cart.tsx             # Shopping cart
│   │   │   ├── premium.tsx          # Premium menu (IAP)
│   │   │   ├── notifications.tsx    # Notifications center
│   │   │   ├── profile.tsx          # User profile
│   │   │   ├── shop.tsx             # Shop screen
│   │   │   └── manager.tsx          # Manager dashboard
│   │   ├── _layout.tsx              # Root layout
│   │   ├── index.tsx                # Entry point
│   │   ├── welcome.tsx              # Welcome screen
│   │   ├── login.tsx                # Login screen
│   │   └── signup.tsx               # Signup screen
│   │
│   ├── components/                  # Reusable components
│   │   ├── ui/                      # UI components
│   │   ├── freshbites-logo.tsx
│   │   ├── haptic-tab.tsx
│   │   ├── iap-modal.tsx
│   │   ├── themed-text.tsx
│   │   └── themed-view.tsx
│   │
│   ├── services/                    # Business logic & API calls
│   │   ├── auth.ts                  # Authentication
│   │   ├── data-manager.ts          # Data management
│   │   ├── device-registration.ts   # Device registration
│   │   ├── iap.ts                   # In-app purchases
│   │   ├── notifications.ts         # Notification handling
│   │   ├── orders.ts                # Order management
│   │   ├── supabase-database.ts     # Supabase DB operations
│   │   ├── supabase-notifications.ts # Supabase notifications
│   │   ├── supabase-storage.ts      # Supabase storage
│   │   ├── notification-preferences.ts
│   │   ├── notification-storage.ts
│   │   └── background-sync.ts       # Background sync
│   │
│   ├── context/                     # React Context providers
│   │   ├── cart-context.tsx         # Shopping cart state
│   │   ├── user-context.tsx         # User state
│   │   └── notification-context.tsx # Notification state
│   │
│   ├── config/                      # Configuration files
│   │   └── supabase.ts              # Supabase configuration
│   │
│   ├── constants/                   # App constants
│   │   └── theme.ts                 # Theme configuration
│   │
│   ├── data/                        # Static data
│   │   ├── products.json            # Product catalog
│   │   └── premium-items.json       # Premium items
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-color-scheme.ts
│   │   ├── use-color-scheme.web.ts
│   │   └── use-theme-color.ts
│   │
│   ├── assets/                      # Images, fonts, etc.
│   │   └── images/
│   │
│   ├── android/                     # Android native code
│   │   ├── app/
│   │   ├── build.gradle
│   │   └── gradle.properties
│   │
│   ├── supabase/                    # Supabase functions
│   │   ├── config.toml
│   │   └── functions/
│   │       └── send-push-notification/
│   │
│   ├── scripts/                     # Utility scripts
│   │
│   ├── package.json                 # Dependencies
│   ├── app.json                     # Expo configuration
│   ├── tsconfig.json                # TypeScript configuration
│   ├── eas.json                     # EAS Build configuration
│   ├── eslint.config.js             # ESLint configuration
│   ├── README.md                    # Project documentation
│   ├── APK_BUILD_GUIDE.md           # Build guide
│   ├── freshbites_technical_report.md
│   ├── FIX_NEW_USER_NOTIFICATIONS.sql
│   └── NOTIFICATION_SYSTEM_REDESIGN.sql
│
└── README.md                        # This file
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `my-app` directory (if needed):

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=your_api_url
```

### Supabase Setup

1. **Create a Supabase Project**: [supabase.com](https://supabase.com)
2. **Get API Credentials**: Project Settings → API
3. **Configure Database**: Run the provided SQL scripts
4. **Enable Authentication**: Enable Email auth in Supabase dashboard

### Firebase Setup (Optional)

If using Firebase features, configure `google-services.json` for Android.

### In-App Purchases Setup

1. **Google Play Console**: Set up your app and products
2. **Configure Products**: Match product IDs in your code
3. **Testing**: Use test accounts for sandbox testing

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: `expo-doctor` reports .expo directory warning

**Solution**: The `.expo/` directory is already in `.gitignore`. To remove it from Git tracking:

```powershell
git rm -r --cached .expo
git commit -m "Remove .expo directory from tracking"
```

If Git is not in your PATH, add it or use Git GUI tools.

#### Issue: Metro bundler not starting

**Solution**: Clear cache and restart
```powershell
npx expo start --clear
```

#### Issue: Module not found errors

**Solution**: Reinstall dependencies
```powershell
rm -rf node_modules
npm install
```

#### Issue: Android build fails

**Solution**: 
1. Clean the build
```powershell
cd android
./gradlew clean
cd ..
```
2. Rebuild
```powershell
npm run android
```

#### Issue: Expo Go connection issues

**Solution**:
1. Ensure both devices are on the same network
2. Disable firewall temporarily
3. Try tunnel mode: `npx expo start --tunnel`

#### Issue: Dependencies version conflicts

**Solution**: Check the health of your project
```powershell
npx expo-doctor
```

Follow the recommendations provided by expo-doctor.

---

## 📜 Scripts

Available npm scripts in `package.json`:

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `expo start` | Start the development server |
| `android` | `expo run:android` | Run on Android |
| `ios` | `expo run:ios` | Run on iOS |
| `web` | `expo start --web` | Run on web |
| `lint` | `expo lint` | Run ESLint |
| `test` | `jest` | Run tests |
| `reset-project` | `node ./scripts/reset-project.js` | Reset project to initial state |

---

## 📱 Testing

### Running Tests

```powershell
npm test
```

### Manual Testing

1. **Authentication Flow**: Test login/signup
2. **Shopping Cart**: Add/remove items
3. **Premium Features**: Test IAP flow (use sandbox)
4. **Notifications**: Test push notifications
5. **Offline Mode**: Test offline functionality

---

## 🔐 Security

- User credentials are handled by Supabase
- Local data is stored securely using AsyncStorage
- API keys should be kept in environment variables
- Never commit sensitive credentials to Git

---

## 🚀 Deployment

### Google Play Store

1. Build production AAB using EAS
2. Upload to Google Play Console
3. Complete store listing
4. Submit for review

### Testing Distribution

Use EAS to share preview builds with testers:

```powershell
eas build --profile preview --platform android
```

Share the generated link with testers.

---

## 📊 Performance

- Uses React Native's new architecture
- Optimized images with expo-image
- Lazy loading for better performance
- Memoization for expensive computations
- Background fetch for data synchronization

---

## 🤝 Contributing

This is a private project. For contributions, please contact the repository owner.

---

## 📄 License

Private - All rights reserved

---

## 👨‍💻 Author

**Md Shaikhul Islam**
- GitHub: [@Md-Shaikhul-Islam](https://github.com/Md-Shaikhul-Islam)

---

## 📞 Support

For issues and questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review Expo documentation: [docs.expo.dev](https://docs.expo.dev)
3. Check React Native docs: [reactnative.dev](https://reactnative.dev)

---

## 🎯 Future Enhancements

- [ ] Real-time order tracking
- [ ] Payment gateway integration
- [ ] Restaurant partner dashboard
- [ ] Delivery driver app
- [ ] Advanced analytics
- [ ] Social features (share orders)
- [ ] Loyalty rewards program
- [ ] Multi-language support

---

## 📸 Screenshots

Add your app screenshots here to showcase the UI.

---

## 🙏 Acknowledgments

- Expo team for the amazing development platform
- Supabase for the backend infrastructure
- React Native community for the libraries

---

**Happy Coding! 🚀**
