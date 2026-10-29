import { describe, expect, it } from 'vitest';
import { Converter } from 'opencc-js/cn2t';
import { convertLyricLinesToTraditional } from '@/components/app/zhHantLyrics/zhHantConvert';
import type { Line } from '@/types';

// test/unit/lyrics/zhHantConvert.test.ts
// iPhone 版内建的简转繁（src/components/app/zhHantLyrics/）：整行与逐字一起转、逐字时间对得上，
// 日文歌的原文不转，翻译照转，罗马音不碰；台湾用语改了长度时分词丢掉。

const tw = Converter({ from: 'cn', to: 'tw' });
const twp = Converter({ from: 'cn', to: 'twp' });

const line = (words: string[], extra: Partial<Line> = {}): Line => ({
    words: words.map((text, index) => ({ text, startTime: index, endTime: index + 1 })),
    startTime: 0,
    endTime: words.length,
    fullText: words.join(''),
    ...extra,
});

describe('简转繁', () => {
    it('converts a line and its words together, so a phrase across words converts as a phrase', () => {
        const [converted] = convertLyricLinesToTraditional([line(['我的', '头', '发'], { translation: '这是翻译', romanization: 'wo de tou fa' })], tw, { main: true, translation: true });
        expect(converted.fullText).toBe('我的頭髮');
        expect(converted.words.map(word => word.text)).toEqual(['我的', '頭', '髮']);
        expect(converted.words.map(word => word.startTime)).toEqual([0, 1, 2]);
        expect(converted.translation).toBe('這是翻譯');
        expect(converted.romanization).toBe('wo de tou fa');
    });

    it('leaves a Japanese song\'s lyrics as they are, and converts their Chinese translation', () => {
        const lines = [line(['君の', '国']), line(['さくら'], { translation: '樱花' })];
        const converted = convertLyricLinesToTraditional(lines, tw, { main: true, translation: true });
        expect(converted[0]).toBe(lines[0]);
        expect(converted[1].fullText).toBe('さくら');
        expect(converted[1].translation).toBe('櫻花');
    });

    it('drops a word split that no longer fits once Taiwan wording changes the length', () => {
        const [converted] = convertLyricLinesToTraditional([line(['鼠标'], { wordSegments: ['鼠', '标'], autoWordSegments: ['鼠标'] })], twp, { main: true, translation: true });
        expect(converted.fullText).toBe('滑鼠');
        const [same] = convertLyricLinesToTraditional([line(['软件'], { wordSegments: ['软', '件'] })], twp, { main: true, translation: false });
        expect(same.fullText).toBe('軟體');
        expect(same.wordSegments).toEqual(['軟', '體']);
    });

    it('converts only what it is asked to', () => {
        const [onlyTranslation] = convertLyricLinesToTraditional([line(['头发'], { translation: '头发' })], tw, { main: false, translation: true });
        expect(onlyTranslation.fullText).toBe('头发');
        expect(onlyTranslation.translation).toBe('頭髮');
    });
});
