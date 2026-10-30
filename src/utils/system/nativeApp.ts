import { Capacitor } from '@capacitor/core';

// src/utils/system/nativeApp.ts
// The Android app (Capacitor, android/): the web build packed into the APK, served from the app
// itself. The one place that knows it: pages outside the app open in the system browser, and a
// page the app has to follow (a sign-in) opens in a web view of the app's own, which reports each
// address it reaches. The plugin loads only inside the app, so the web build does not carry it.

/** Whether this page runs inside the Android app. */
export const runsAsNativeApp = (): boolean => Capacitor.isNativePlatform();

const inAppBrowser = () => import('@capacitor/inappbrowser');

/** Opens `url` in the system browser. */
export const openInSystemBrowser = async (url: string): Promise<void> => {
    const { InAppBrowser, DefaultSystemBrowserOptions } = await inAppBrowser();
    await InAppBrowser.openInSystemBrowser({ url, options: DefaultSystemBrowserOptions });
};

let stopFollowing: (() => void) | null = null;

/**
 * Opens `url` in a web view over the app and calls `onAddress` with every address it reaches,
 * until it is closed (by the listener, or by `closeAppWebView`). The web view needs no browser
 * installed, so an old or broken one on the device does not stop it.
 */
export const openInAppWebView = async (url: string, onAddress: (address: URL) => void): Promise<void> => {
    const { InAppBrowser, DefaultWebViewOptions, DefaultAndroidWebViewOptions } = await inAppBrowser();
    stopFollowing?.();
    const handles = [await InAppBrowser.addListener('browserPageNavigationCompleted', ({ url: reached }) => {
        if (!reached) return;
        try {
            onAddress(new URL(reached));
        } catch (error) {
            console.warn('[NativeApp] Web view reached something that is not an address', error);
        }
    })];
    const stop = () => {
        if (stopFollowing === stop) stopFollowing = null;
        handles.forEach(handle => void handle.remove());
    };
    stopFollowing = stop;
    await InAppBrowser.openInWebView({
        url,
        options: {
            ...DefaultWebViewOptions,
            showURL: true,
            // In the app's own process: an isolated one is what a broken browser on the device breaks.
            android: { ...DefaultAndroidWebViewOptions, isIsolated: false },
        },
    });
    // Only now: opening closes a web view the listener closed by hand before, and that close must
    // not end the following of this one.
    const closed = await InAppBrowser.addListener('browserClosed', stop);
    if (stopFollowing === stop) handles.push(closed);
    else void closed.remove();
};

/** Closes the web view `openInAppWebView` opened, where it is still open. */
export const closeAppWebView = async (): Promise<void> => {
    stopFollowing?.();
    const { InAppBrowser } = await inAppBrowser();
    await InAppBrowser.close().catch(() => undefined);
};

/**
 * The address of the website's `/api` route `path` (it starts with `/api/`). The web build asks its
 * own site; the app is served from the APK, which has no such route, so it asks the website the
 * app was built for (VITE_WEB_API_ORIGIN, `.env.android`). Only a route that answers other origins
 * (CORS) can be asked that way: the lyric relay does; the AI routes do not.
 */
export const webApiUrl = (path: string): string => {
    if (!runsAsNativeApp()) return path;
    const origin = String(import.meta.env.VITE_WEB_API_ORIGIN ?? '').trim().replace(/\/+$/, '');
    return origin ? `${origin}${path}` : path;
};
