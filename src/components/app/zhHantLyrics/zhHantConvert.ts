import type { LyricAlternateText, LyricBackgroundVocal, LyricSyllable, Line, Word } from '../../../types';

// src/components/app/zhHantLyrics/zhHantConvert.ts
// 简转繁的转换本身（从 dev/folium/zh-hant-lyrics 的模组搬来，改成直接处理宿主的歌词行）：
//   - 一行的逐字、音节、用户分词和整行一起转：先拼成一串转，换完长度不变就按原来的长度切回去，
//     这样跨词的词组（「头发」→「頭髮」）照词组转，逐字时间也对得上；长度变了（台湾用语会把「鼠标」换成「滑鼠」）
//     就各段分开转，对不上整行的分词丢掉，交给宿主重新切。
//   - 日文歌不转原文：有汉字或假名的行里，四分之一以上带假名，就当日文歌，原文里的汉字是日文写法。
//     中文歌里夹一两句日文照样转，只是带假名的那几行不转。翻译照样看自己有没有假名。
//   - 罗马音不碰。

export type ZhHantConvert = (text: string) => string;
export interface ZhHantParts { main: boolean; translation: boolean }

const KANA = /[぀-ヿㇰ-ㇿｦ-ﾟ]/;
const HAN = /\p{Script=Han}/u;
// The share of the lines with Chinese characters or kana that hold kana from which the song is Japanese.
const JAPANESE_SHARE = 0.25;

/** Whether the lyrics are a Japanese song's: then a line of kanji alone is Japanese too. */
export const isJapaneseSong = (lines: readonly Line[]): boolean => {
    const written = lines.filter(line => HAN.test(line.fullText) || KANA.test(line.fullText));
    return written.length > 0 && written.filter(line => KANA.test(line.fullText)).length >= written.length * JAPANESE_SHARE;
};

/** `converted` cut into pieces as long as `originals`, or null when the conversion changed its length. */
const sliceLike = (converted: string, originals: readonly string[]): string[] | null => {
    if (converted.length !== originals.reduce((total, text) => total + text.length, 0)) return null;
    let at = 0;
    return originals.map(text => converted.slice(at, (at += text.length)));
};

/** Pieces of one text converted together, so phrases across piece edges convert as phrases. */
const convertPieces = (convert: ZhHantConvert, pieces: readonly string[]): string[] => {
    const joined = pieces.join('');
    if (!HAN.test(joined)) return [...pieces];
    return sliceLike(convert(joined), pieces) ?? pieces.map(piece => convert(piece));
};

const convertSyllables = (convert: ZhHantConvert, syllables: LyricSyllable[], before: string, after: string): LyricSyllable[] => {
    const texts = syllables.map(syllable => syllable.text);
    const parts = (texts.join('') === before && sliceLike(after, texts)) || convertPieces(convert, texts);
    return syllables.map((syllable, index) => ({ ...syllable, text: parts[index] }));
};

/** Words, and the whole text they make up, converted as one. */
const convertWords = (convert: ZhHantConvert, words: Word[], fullText: string): { words: Word[]; fullText: string } => {
    const texts = convertPieces(convert, words.map(word => word.text));
    const nextWords = words.map((word, index) => (word.syllables
        ? { ...word, text: texts[index], syllables: convertSyllables(convert, word.syllables, word.text, texts[index]) }
        : { ...word, text: texts[index] }));
    const nextFull = words.map(word => word.text).join('') === fullText ? texts.join('') : convertPieces(convert, [fullText])[0];
    return { words: nextWords, fullText: nextFull };
};

const isChineseAlternate = (alternate: LyricAlternateText) => alternate.role === 'translation'
    && (!alternate.language || /^zh/i.test(alternate.language))
    && !KANA.test(alternate.text);

const convertAlternates = (convert: ZhHantConvert, alternates: LyricAlternateText[]): LyricAlternateText[] => alternates.map((alternate) => {
    if (!isChineseAlternate(alternate)) return alternate;
    const text = convertPieces(convert, [alternate.text])[0];
    return alternate.syllables
        ? { ...alternate, text, syllables: convertSyllables(convert, alternate.syllables, alternate.text, text) }
        : { ...alternate, text };
});

const convertTranslation = (convert: ZhHantConvert, translation: string | undefined) => (
    translation && !KANA.test(translation) ? convertPieces(convert, [translation])[0] : translation
);

// A word split kept beside the text: cut like the converted text, or dropped when it no longer fits.
const resplit = (segments: string[] | undefined, fullText: string): string[] | undefined => (
    segments ? sliceLike(fullText, segments) ?? undefined : undefined
);

const convertVocal = (convert: ZhHantConvert, vocal: LyricBackgroundVocal, parts: ZhHantParts): LyricBackgroundVocal => {
    const next = { ...vocal };
    if (parts.main) {
        const { words, fullText } = convertWords(convert, vocal.words ?? [], vocal.text);
        next.words = words;
        next.text = fullText;
    }
    if (parts.translation) {
        if (vocal.translation) next.translation = convertTranslation(convert, vocal.translation);
        if (vocal.alternateTexts) next.alternateTexts = convertAlternates(convert, vocal.alternateTexts);
    }
    return next;
};

/** A line with the parts `parts` asks for converted; one the conversion leaves as it was is the same object. */
const convertLine = (convert: ZhHantConvert, line: Line, parts: ZhHantParts): Line => {
    const next: Line = { ...line };
    let changed = false;
    if (parts.main) {
        const { words, fullText } = convertWords(convert, line.words ?? [], line.fullText);
        if (fullText !== line.fullText) {
            changed = true;
            next.words = words;
            next.fullText = fullText;
            const wordSegments = resplit(line.wordSegments, fullText);
            const autoWordSegments = resplit(line.autoWordSegments, fullText);
            if (wordSegments) next.wordSegments = wordSegments; else delete next.wordSegments;
            if (autoWordSegments) next.autoWordSegments = autoWordSegments; else delete next.autoWordSegments;
        }
    }
    if (parts.translation) {
        const translation = convertTranslation(convert, line.translation);
        if (translation !== line.translation) {
            changed = true;
            next.translation = translation;
        }
        if (line.alternateTexts) {
            next.alternateTexts = convertAlternates(convert, line.alternateTexts);
            changed = true;
        }
    }
    const vocals = line.backgroundVocals ?? (line.backgroundVocal ? [line.backgroundVocal] : null);
    if (vocals) {
        const converted = vocals.map(vocal => convertVocal(convert, vocal, parts));
        if (line.backgroundVocals) next.backgroundVocals = converted;
        if (line.backgroundVocal) next.backgroundVocal = converted[0];
        changed = true;
    }
    return changed ? next : line;
};

/** The lines with Simplified Chinese written in Traditional characters; a Japanese song's text is left alone. */
export const convertLyricLinesToTraditional = (lines: readonly Line[], convert: ZhHantConvert, parts: ZhHantParts): Line[] => {
    const japanese = isJapaneseSong(lines);
    return lines.map(line => convertLine(convert, line, {
        main: parts.main && !japanese && !KANA.test(line.fullText),
        translation: parts.translation,
    }));
};
