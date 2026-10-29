import { create } from 'zustand';
import { getStoredBoolean, getStoredString, setStoredBoolean, setStoredString } from '../../../stores/storagePrimitives';

// src/components/app/zhHantLyrics/zhHantLyricsStore.ts
// 简转繁的设置：开关（默认开）、转成哪种字形，以及转不转歌词原文和翻译。只存在这台设备上。

export type ZhHantVariant = 'tw' | 'twp' | 'hk';
export const ZH_HANT_VARIANTS: readonly ZhHantVariant[] = ['tw', 'twp', 'hk'];

const ENABLED_KEY = 'folia_zh_hant_lyrics_enabled';
const VARIANT_KEY = 'folia_zh_hant_lyrics_variant';
const MAIN_KEY = 'folia_zh_hant_lyrics_main';
const TRANSLATION_KEY = 'folia_zh_hant_lyrics_translation';

const readVariant = (): ZhHantVariant => {
    const stored = getStoredString(VARIANT_KEY, 'tw') as ZhHantVariant;
    return ZH_HANT_VARIANTS.includes(stored) ? stored : 'tw';
};

interface ZhHantLyricsState {
    enabled: boolean;
    variant: ZhHantVariant;
    main: boolean;
    translation: boolean;
    setEnabled: (enabled: boolean) => void;
    setVariant: (variant: ZhHantVariant) => void;
    setMain: (main: boolean) => void;
    setTranslation: (translation: boolean) => void;
}

export const useZhHantLyricsStore = create<ZhHantLyricsState>(set => ({
    enabled: getStoredBoolean(ENABLED_KEY, true),
    variant: readVariant(),
    main: getStoredBoolean(MAIN_KEY, true),
    translation: getStoredBoolean(TRANSLATION_KEY, true),
    setEnabled: (enabled) => {
        setStoredBoolean(ENABLED_KEY, enabled);
        set({ enabled });
    },
    setVariant: (variant) => {
        setStoredString(VARIANT_KEY, variant);
        set({ variant });
    },
    setMain: (main) => {
        setStoredBoolean(MAIN_KEY, main);
        set({ main });
    },
    setTranslation: (translation) => {
        setStoredBoolean(TRANSLATION_KEY, translation);
        set({ translation });
    },
}));
