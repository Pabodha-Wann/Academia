# Academia 🎓

Academia is a modern, premium student companion mobile application designed to help students track tasks, manage class schedules, calculate GPA, and receive timely notifications for deadlines and upcoming lectures.

---

## 🛠️ Tech Stack & Frameworks

- **Core Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (utilizing Expo SDK & Router).
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing).
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (In-memory, highly reactive state stores).
- **Database**: SQLite via [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (Local persistent storage).
- **Styling**: Tailwind CSS via NativeWind.
- **Date Handling**: [date-fns](https://date-fns.org/).
- **Push & Local Notifications**: [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) (For scheduled class reminders and assignment alerts).

---

## 📋 System Dependencies

Before running or building the app, make sure you have the following installed on your development machine:

1. **Node.js** (v18.x or v20.x recommended)
2. **Package Manager**: npm (bundled with Node) or Yarn.
3. **Android Studio** (for Android emulator and SDK tools) or **Xcode** (macOS only, for iOS simulator).
4. **Git** (for version control).
5. **EAS CLI** (Required for cloud-based app builds):
   ```bash
   npm install -g eas-cli
   ```

---

## 🚀 Getting Started & Running Locally

Follow these steps to run the application in development mode:

### 1. Clone the Repository & Install Dependencies
Navigate to your project directory and run:
```bash
npm install
```

### 2. Start the Development Server
Start the Metro packager using the clear-cache option to ensure clean asset resolution:
```bash
npx expo start --clear
```

### 3. Launch on a Device or Emulator
- **Android Emulator**: Press `a` in the terminal.
- **iOS Simulator**: Press `i` in the terminal (macOS only).
- **Physical Device**: Download the **Expo Go** app (App Store or Google Play), then scan the QR code displayed in your terminal or browser console.

---

## 📦 Building the App (APK / Standalone Build)

Since this app uses native notification and camera features, building a standalone development or production build is recommended.

### Cloud Build using EAS (Expo Application Services)

EAS Build allows you to build standalone binaries (.apk, .aab, or .ipa) in the cloud.

1. **Log in to your Expo account**:
   ```bash
   eas login
   ```

2. **Initialize configuration** (if not already done):
   ```bash
   eas build:configure
   ```

3. **Build Android APK (Preview/Testing profile)**:
   ```bash
   eas build -p android --profile preview
   ```
   *This will generate a downloadable `.apk` file that you can directly install on any Android device.*

4. **Build Android Production Bundle (AAB for Google Play Store)**:
   ```bash
   eas build -p android --profile production
   ```

### Local Standalone Build (Alternative)

If you prefer to compile the binaries locally using your own hardware:
```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

---

## 🗄️ Architecture & Design Pattern

The codebase adheres to a clean **Service-Store Pattern**:
* **Database Layer (`@/database`)**: Standard SQLite queries handling profile, tasks, GPA entries, and notifications.
* **Service Layer (`@/services`)**: Orchestrates operations between the SQLite database, Zustand stores, and native OS APIs (such as notification triggers).
* **State Stores (`@/store`)**: Pure Zustand state containers that hold in-memory representation of tasks, schedules, GPA, and configurations.
* **UI Screen Modals (`@/app/modals`)**: Transparent sheets and overlay screens for subject selectors, GPA calculators, and notification lists.
