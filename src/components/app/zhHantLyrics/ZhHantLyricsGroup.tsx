import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { Group, Reveal, Row, Select, Toggle, option, type SettingsGroupDef, type SettingsOptionDef } from '../../modal/settings/kit';
import { useZhHantLyricsStore, type ZhHantVariant } from './zhHantLyricsStore';

// src/components/app/zhHantLyrics/ZhHantLyricsGroup.tsx
// 「设置 → 歌词」里的简转繁一组：开关、转成哪种字形、转不转原文与翻译。

const GROUP: SettingsGroupDef = { id: 'zhHantLyrics', titleKey: 'options.zhHantLyricsHeading' };

const O = {
    enabled: option(GROUP, 'zhHantLyrics', 'options.zhHantLyrics'),
    variant: option(GROUP, 'zhHantLyricsVariant', 'options.zhHantLyricsVariant'),
    main: option(GROUP, 'zhHantLyricsMain', 'options.zhHantLyricsMain'),
    translation: option(GROUP, 'zhHantLyricsTranslation', 'options.zhHantLyricsTranslation'),
};

export const ZH_HANT_LYRICS_OPTIONS: SettingsOptionDef[] = Object.values(O);

const VARIANT_LABELS: Record<ZhHantVariant, string> = {
    tw: 'options.zhHantLyricsVariantTw',
    twp: 'options.zhHantLyricsVariantTwp',
    hk: 'options.zhHantLyricsVariantHk',
};

const ZhHantLyricsGroup: React.FC = () => {
    const { t } = useTranslation();
    const settings = useZhHantLyricsStore(useShallow(state => state));
    return (
        <Group def={GROUP}>
            <Row option={O.enabled} note={t('options.zhHantLyricsDesc')}>
                <Toggle checked={settings.enabled} onChange={settings.setEnabled} />
            </Row>
            <Reveal when={settings.enabled}>
                <Row option={O.variant}>
                    <Select
                        value={settings.variant}
                        options={(Object.keys(VARIANT_LABELS) as ZhHantVariant[]).map(variant => ({ value: variant, label: t(VARIANT_LABELS[variant]) }))}
                        onChange={value => settings.setVariant(value as ZhHantVariant)}
                    />
                </Row>
                <Row option={O.main}>
                    <Toggle checked={settings.main} onChange={settings.setMain} />
                </Row>
                <Row option={O.translation}>
                    <Toggle checked={settings.translation} onChange={settings.setTranslation} />
                </Row>
            </Reveal>
        </Group>
    );
};

export default ZhHantLyricsGroup;
