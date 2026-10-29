import { addBuiltinLyricsTransform, rerunLyricsTransform } from '../../../services/hostExtensionHooks';
import { setLyricsState, usePlaybackStore } from '../../../stores/usePlaybackStore';
import type { LyricData } from '../../../types';
import { convertLyricLinesToTraditional, type ZhHantConvert } from './zhHantConvert';
import { useZhHantLyricsStore, type ZhHantVariant } from './zhHantLyricsStore';

// src/components/app/zhHantLyrics/installZhHantLyrics.ts
// 把简转繁接到宿主的歌词管线上（hostExtensionHooks 的内建转换，在模组的转换之前）。转换表（opencc-js 的 cn2t，
// 约 1 MB）打开时才载入；每种字形的词典第一次用到时建一次。载入或改了设置后，正在显示的歌词马上重转。

const converters = new Map<ZhHantVariant, ZhHantConvert>();
let loading: Promise<void> | null = null;
let installed = false;

// The lyrics on screen, made again from what they were made from.
const refreshShownLyrics = () => {
    const current = usePlaybackStore.getState().lyrics;
    if (!current) return;
    const next = rerunLyricsTransform(current);
    if (next !== current) setLyricsState(next);
};

// Loads the conversion tables and builds the dictionary of the variant asked for, then shows the lyrics converted.
const prepare = (variant: ZhHantVariant): void => {
    if (converters.has(variant)) return;
    loading = (loading ?? Promise.resolve()).then(async () => {
        if (converters.has(variant)) return;
        const startedAt = performance.now();
        const { Converter } = await import('opencc-js/cn2t');
        converters.set(variant, Converter({ from: 'cn', to: variant }));
        console.log(`[ZhHantLyrics] Built the ${variant} dictionary in ${Math.round(performance.now() - startedAt)} ms`);
        refreshShownLyrics();
    }).catch((error: unknown) => {
        console.warn('[ZhHantLyrics] The conversion tables could not be loaded; the lyrics stay as they are', error);
    });
};

const transform = (lyrics: LyricData): LyricData => {
    const { enabled, variant, main, translation } = useZhHantLyricsStore.getState();
    if (!enabled || (!main && !translation) || lyrics.lines.length === 0) return lyrics;
    const convert = converters.get(variant);
    if (!convert) {
        prepare(variant);
        return lyrics;
    }
    const lines = convertLyricLinesToTraditional(lyrics.lines, convert, { main, translation });
    return lines.every((line, index) => line === lyrics.lines[index]) ? lyrics : { ...lyrics, lines };
};

/** Installs the conversion once (main window). */
export const installZhHantLyrics = (): void => {
    if (installed) return;
    installed = true;
    addBuiltinLyricsTransform(transform);
    const { enabled, variant } = useZhHantLyricsStore.getState();
    if (enabled) prepare(variant);
    useZhHantLyricsStore.subscribe((state, previous) => {
        if (state.enabled === previous.enabled && state.variant === previous.variant
            && state.main === previous.main && state.translation === previous.translation) return;
        if (state.enabled) prepare(state.variant);
        refreshShownLyrics();
    });
};
