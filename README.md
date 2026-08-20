# Para después

Minimal MVP app to save links you find while browsing (YouTube, Instagram and any other app), using the Android share menu. Links are classified automatically with OpenAI and stored per-user in Firebase.

## Features

- Email/password authentication (Firebase Authentication) with persisted session.
- Save links manually from the app or by sharing them from other apps (Android `ACTION_SEND` / `text/plain`).
- Platform detection: `youtube`, `instagram`, `other`.
- Best-effort metadata extraction (YouTube oEmbed, HTML meta tags for other sites).
- OpenAI (structured JSON) generates a short title and a category from a predefined list.
- Links stored in Cloud Firestore scoped to the authenticated user.
- OpenAI API key stored on-device with `expo-secure-store` (never sent to Firestore, never in the code).

Predefined categories: `Programming`, `Food`, `Fashion`, `Travel`, `Home`, `Shopping`, `Entertainment`, `Ideas`, `Other`. The AI can only pick one of them; anything else is stored as `Other`.

## Tech stack

- Expo SDK 57 (React Native 0.86, React 19.2, TypeScript)
- React Navigation v7
- Firebase JS SDK v12 (Auth + Cloud Firestore)
- `expo-share-intent` v8 for Android Share Intent
- `expo-secure-store` for the OpenAI API key
- `@react-native-async-storage/async-storage` for Firebase auth persistence

> The Share Intent feature requires native code. It **does not work in Expo Go**. You must run a Development Build (`expo-dev-client`) or a production build to test sharing.

## Requirements

- Node.js 22.13 or higher (SDK 57 minimum)
- pnpm (or npm/yarn)
- A Firebase project (Blaze plan not required for this MVP; the Spark plan is enough)
- An OpenAI API key
- For Android builds: Android Studio / Android SDK, or an Expo/EAS account for cloud builds

## 1. Install dependencies

```bash
pnpm install
```

## 2. Configure Firebase

1. Go to https://console.firebase.google.com and create a project.
2. In **Project settings > General > Your apps**, add an **Android app** (and optionally a Web app).
   - Android package name: `com.irenealcaine.paradespues` (must match `app.json`).
   - Download the `google-services.json` only if you build with the native Firebase SDK. This project uses the Firebase JS SDK, so you only need the config values, not the file.
3. Copy the config values shown in the console.

Create the environment file:

```bash
cp .env.example .env
```

Fill in `.env`:

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
# Optional: only used by Firebase Analytics (not used by this app)
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

`EXPO_PUBLIC_` variables are inlined at build time and are **not secret** (Firebase client config is public by design). Never put the OpenAI API key here.

## 3. Configure Firebase Authentication

1. In the Firebase console go to **Build > Authentication > Sign-in method**.
2. Enable **Email/Password**.
3. Save.

## 4. Create Firestore

1. In the Firebase console go to **Build > Firestore Database > Create database**.
2. Choose **Start in production mode**.
3. Select a region close to you.

## 5. Configure Firestore rules

The rules in `firestore.rules` (also shown below) ensure a user can only read, create, update or delete their own documents:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /links/{linkId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

1. Open **Firestore Database > Rules**.
2. Paste the rules above and click **Publish**.

The `links` collection is created automatically the first time a link is saved (no manual setup needed).

## 6. Configure Expo

The `app.json` already contains:

- App name and scheme (`paradespues`).
- Android package `com.irenealcaine.paradespues`.
- The `expo-share-intent` plugin with `androidIntentFilters: ["text/*"]` and `disableIOS: true` (this project targets Android).
- `expo-secure-store`, `expo-splash-screen`, `expo-dev-client` plugins.

To use a different Android package name, update `app.json` (`expo.android.package`).

## 7. Run the app

### Development Build (required for Share Intent)

```bash
pnpm exec expo prebuild --platform android
pnpm exec expo run:android
```

This compiles a native Android app with the share intent filter and starts Metro. Keep the dev server running.

### Without Share Intent (Expo Go)

You can still test authentication, saving links manually and the settings screen in Expo Go:

```bash
pnpm start
```

Then scan the QR code with the Expo Go app. Share Intent will be inactive (the native module is only present in a dev/production build).

## 8. Test the Android Share Intent

1. Build and install the Development Build (`pnpm exec expo run:android`).
2. Open the app once, register and add your OpenAI API key in **Settings**.
3. Open **YouTube** (or the YouTube app) and open any video.
4. Tap **Share** and choose **Para después** in the share sheet.
5. The app opens, detects the platform, fetches metadata, asks OpenAI for a title/category and saves the link.
6. Open the app Home screen and the new link should appear.

Edge cases handled:

- **App closed when sharing** (cold start): the intent is captured when the app starts.
- **Not authenticated**: the shared URL is kept pending and processed automatically after login.
- **Authenticated but no API key**: the app shows a banner with a direct link to Settings; the link is processed automatically once the key is saved.
- **Metadata unavailable or OpenAI fails**: the link is still saved with a fallback title derived from the URL and category `Other`, showing a warning.

To test cold start with a clean state:

```bash
adb shell am force-stop com.irenealcaine.paradespues
```

Then share a URL again from YouTube.

You can also simulate the intent directly:

```bash
adb shell am start -a android.intent.action.SEND -t text/plain --es android.intent.extra.TEXT "https://www.youtube.com/watch?v=VIDEO_ID" com.irenealcaine.paradespues
```

## 9. Generate an Android build

### Local APK (Android Studio)

```bash
pnpm exec expo prebuild --platform android
cd android
./gradlew assembleRelease
```

The APK is generated at `android/app/build/outputs/apk/release/app-release.apk`. Note: a release build uses the API key/values bundled from `.env` at build time, so `EXPO_PUBLIC_FIREBASE_*` must be set.

### EAS Build (cloud)

```bash
npm install -g eas-cli   # or: pnpm add -D eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

`preview` builds an installable APK. For Play Store you would use `--profile production` (AAB). EAS Build does not require a local Android SDK.

## Project structure

```text
src/
├── components/     # UI building blocks (Button, TextField, LinkCard, banners...)
├── hooks/          # Context providers and hooks (auth, OpenAI key, pending links, share intent)
├── navigation/     # RootNavigator and types
├── screens/        # Login, Register, Home, AddLink, Settings
├── services/       # auth, firestore, openai, platform detection, URL metadata, link processing, secure store
├── firebase/       # Firebase app/auth/db initialization
├── types/          # Shared types and module augmentations
├── constants/      # Categories and colors
└── utils/          # URL helpers, date formatting, error messages
```

## Data model

Each saved link is a Firestore document in the `links` collection:

```ts
{
  id: string;
  userId: string;
  url: string;
  platform: "youtube" | "instagram" | "other";
  type: "video" | "webpage" | "unknown";
  title: string;
  category: string;
  createdAt: Timestamp;
}
```

## Error handling

Errors covered: invalid URL, missing API key, invalid API key, OpenAI errors, Firebase errors, no connection, no metadata available, unsupported content.

Metadata and OpenAI failures never block the save: the URL is always stored whenever possible, with a fallback title and category. An API key that is missing or rejected is surfaced clearly so the user can fix it in Settings.

## Notes

- This is an MVP. No search, tags, favorites, notifications, recommendations or social features are implemented on purpose.
- Instagram does not expose a public metadata API; metadata extraction is best-effort and falls back gracefully to the URL when unavailable.
- The Android `android/` and iOS `ios/` folders are generated by `expo prebuild` and are gitignored (continuous native generation).

## Contact

- Email: irenealcainealvarez@gmail.com
- LinkedIn: https://www.linkedin.com/in/irenealcaine/
- GitHub: https://github.com/irenealcaine