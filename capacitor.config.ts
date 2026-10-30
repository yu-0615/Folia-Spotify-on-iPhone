import type { CapacitorConfig } from '@capacitor/cli';

// capacitor.config.ts
// The Android app (android/): the web build (`npm run build:android`, dist/) packed into the APK.
// The package id is the one the earlier Trusted Web Activity APK had, so the app installs over it
// when it is signed with the same key (the release APK is signed by hand, outside Gradle).
// @capacitor/app is there for the back button: it goes back a page, and leaves the app on the first.
const config: CapacitorConfig = {
    appId: 'io.github.yu0615.foliaspotify',
    appName: 'Folia Spotify',
    webDir: 'dist',
    // Folia's own dark background, also under the page before it has drawn.
    backgroundColor: '#09090b',
    plugins: {
        SystemBars: {
            // The pages leave no room for the status and navigation bars of their own (no
            // env(safe-area-inset-*)), so the app keeps them out of the page. The Android build
            // drops index.html's viewport-fit=cover for that (vite.config.ts).
            insetsHandling: 'native',
            initialViewportFitValueHint: 'contain',
            // Light text and icons on the bars, over the dark background.
            style: 'DARK',
        },
    },
};

export default config;
