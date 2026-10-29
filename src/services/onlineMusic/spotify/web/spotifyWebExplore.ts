import i18n from '../../../../i18n/config';
import type { UnifiedSong } from '../../../../types';
import { OnlineProviderError } from '../../../../types/onlineMusic';
import type { OnlineExploreProvider, ProviderCollection, ProviderExploreItem, ProviderExploreSection } from '../../../../types/onlineMusic';
import { spotifyWebArtistReleases, spotifyWebFollowedArtists, spotifyWebTopArtists, spotifyWebTopSongs } from './spotifyWebTaste';

// src/services/onlineMusic/spotify/web/spotifyWebExplore.ts
// The explore page of the web version, made of the account's own listening (spotifyWebTaste.ts), as
// the Web API gives an app of one's own no recommendations or Spotify's home page. In this order:
// the songs it played most these four weeks, the artists it plays most, the latest albums and singles
// of those artists, the songs of these six months and of all time (the ones the earlier sections
// show left out), and the artists it follows that the earlier section did not show. One read makes
// the whole page; a section Spotify refuses is left out. What the account played last is not here:
// the explore page has that section from the app's own record of plays.

const SECTION_ITEMS = 20;
const RELEASES = 20;

const namesOf = (artists: Array<{ name: string }> | undefined) => (artists ?? []).map(artist => artist.name).filter(Boolean).join(', ');
const lineOf = (kind: string, whose: string) => [i18n.t(kind), whose].filter(Boolean).join(' · ');
const songItem = (song: UnifiedSong): ProviderExploreItem => ({ kind: 'song', song, subtitle: lineOf('home.exploreSong', namesOf(song.artists)) });
const collectionItem = (collection: ProviderCollection): ProviderExploreItem => ({
    kind: 'collection', collection,
    ...(collection.type === 'album' ? { subtitle: lineOf('home.exploreAlbum', namesOf(collection.artists)) } : {}),
});

const isOffline = (error: unknown) => error instanceof OnlineProviderError && error.code === 'network';

// A part Spotify refuses (a sign-in made before these were asked for has no right to them) is none.
const orNone = <T>(what: string, read: Promise<T[]>): Promise<T[]> => read.catch((error: unknown) => {
    if (isOffline(error)) throw error;
    console.warn(`[Spotify] Explore: ${what} could not be read; the page goes on without it`, error);
    return [];
});

const section = (id: string, titleKey: string, items: ProviderExploreItem[]): ProviderExploreSection[] => (
    items.length > 0 ? [{ id, title: i18n.t(titleKey), items: items.slice(0, SECTION_ITEMS) }] : []
);

export const spotifyWebExplore: OnlineExploreProvider = {
    async getFeed(cursor) {
        // One read makes the whole page: there is nothing after it.
        if (cursor) return { sections: [] };
        const [recent, months, ever, artists, releases, followed] = await Promise.all([
            orNone('the songs of these four weeks', spotifyWebTopSongs('short_term')),
            orNone('the songs of these six months', spotifyWebTopSongs('medium_term')),
            orNone('the songs of all time', spotifyWebTopSongs('long_term')),
            orNone('the artists played most', spotifyWebTopArtists('medium_term')),
            orNone('the new releases', spotifyWebArtistReleases(RELEASES)),
            orNone('the artists followed', spotifyWebFollowedArtists()),
        ]);
        const shown = new Set<string>();
        const unseen = <T extends { id: string | number }>(items: T[]) => items.filter((item) => {
            const id = String(item.id);
            if (shown.has(id)) return false;
            shown.add(id);
            return true;
        }).slice(0, SECTION_ITEMS);
        const sections = [
            ...section('top-recent', 'home.spotifyWebTopRecent', unseen(recent).map(songItem)),
            ...section('top-artists', 'home.spotifyWebTopArtists', unseen(artists).map(collectionItem)),
            ...section('artist-releases', 'home.spotifyWebArtistReleases', releases.map(collectionItem)),
            ...section('top-months', 'home.spotifyWebTopMonths', unseen(months).map(songItem)),
            ...section('top-ever', 'home.spotifyWebTopEver', unseen(ever).map(songItem)),
            ...section('followed', 'home.spotifyWebFollowedArtists', unseen(followed).map(collectionItem)),
        ];
        console.log(`[Spotify] Explore: ${sections.length} sections of the account's own listening`);
        return { sections, refreshReadsAnew: true };
    },
};
