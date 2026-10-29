import type { UnifiedSong } from '../../../../types';
import type { ProviderCollection } from '../../../../types/onlineMusic';
import { callSpotifyWeb } from './spotifyWebApi';
import { present, spotifyWebAlbumOf, spotifyWebArtistOf, spotifyWebSongOf } from './spotifyWebNormalize';
import type { SpotifyWebAlbum, SpotifyWebArtist, SpotifyWebPage, SpotifyWebTrack } from './spotifyWebNormalize';

// src/services/onlineMusic/spotify/web/spotifyWebTaste.ts
// What the Web API still tells of the account's listening, for the web version's radio tab and
// explore page (spotifyWebRecommendations.ts, spotifyWebExplore.ts). Since November 2024 an app of
// one's own gets no recommendations, related artists or Spotify's own playlists, and since February
// 2026 no new releases and no artist's top tracks either; what is left is the account's own: its
// most played songs and artists (user-top-read), what it played last (user-read-recently-played),
// the artists it follows, and each artist's albums. Each read is kept for a few minutes, so the radio
// tab and the explore page asking together make one request; signing out forgets them.

export type SpotifyWebTimeRange = 'short_term' | 'medium_term' | 'long_term';

const ROWS = 50;
const KEPT_MS = 5 * 60 * 1000;
// The artists whose albums are read for the new releases, and how many albums each.
const RELEASE_ARTISTS = 8;
const RELEASES_PER_ARTIST = 10;

const kept = new Map<string, { at: number; value: Promise<unknown> }>();

// A read kept for KEPT_MS; one that failed is not kept, so the next asks Spotify again.
const keep = <T>(key: string, read: () => Promise<T>): Promise<T> => {
    const known = kept.get(key);
    if (known && Date.now() - known.at < KEPT_MS) return known.value as Promise<T>;
    const value = read();
    kept.set(key, { at: Date.now(), value });
    value.catch(() => { if (kept.get(key)?.value === value) kept.delete(key); });
    return value;
};

/** Forgets every read: for when the account signs out. */
export const forgetSpotifyWebTaste = (): void => {
    kept.clear();
};

const songsOf = (tracks: Array<SpotifyWebTrack | null | undefined>): UnifiedSong[] => {
    const seen = new Set<string>();
    return tracks.map(track => spotifyWebSongOf(track)).filter(present).filter((song) => {
        const id = String(song.id);
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });
};

/** The account's most played songs over the time range. */
export const spotifyWebTopSongs = (range: SpotifyWebTimeRange): Promise<UnifiedSong[]> => keep(`songs:${range}`, async () => {
    const page = await callSpotifyWeb<SpotifyWebPage<SpotifyWebTrack>>('/me/top/tracks', { query: { time_range: range, limit: ROWS } });
    return songsOf(page.items ?? []);
});

/** The account's most played artists over the time range, as artist cards. */
export const spotifyWebTopArtists = (range: SpotifyWebTimeRange): Promise<ProviderCollection[]> => keep(`artists:${range}`, async () => {
    const page = await callSpotifyWeb<SpotifyWebPage<SpotifyWebArtist>>('/me/top/artists', { query: { time_range: range, limit: ROWS } });
    return (page.items ?? []).map(artist => spotifyWebArtistOf(artist)).filter(present);
});

/** The songs the account played last, the latest first, each once. */
export const spotifyWebRecentSongs = (): Promise<UnifiedSong[]> => keep('recent', async () => {
    const page = await callSpotifyWeb<SpotifyWebPage<{ track?: SpotifyWebTrack }>>('/me/player/recently-played', { query: { limit: ROWS } });
    return songsOf((page.items ?? []).map(row => row?.track));
});

/** The artists the account follows, as artist cards. */
export const spotifyWebFollowedArtists = (): Promise<ProviderCollection[]> => keep('followed', async () => {
    const answer = await callSpotifyWeb<{ artists?: SpotifyWebPage<SpotifyWebArtist> }>('/me/following', { query: { type: 'artist', limit: ROWS } });
    return (answer.artists?.items ?? []).map(artist => spotifyWebArtistOf(artist)).filter(present);
});

/**
 * The latest albums and singles of the artists the account plays most (the followed ones after
 * them), the newest first, each once. An artist whose albums cannot be read is left out.
 */
export const spotifyWebArtistReleases = (limit: number): Promise<ProviderCollection[]> => keep(`releases:${limit}`, async () => {
    const [top, followed] = await Promise.all([
        spotifyWebTopArtists('short_term').catch(() => [] as ProviderCollection[]),
        spotifyWebFollowedArtists().catch(() => [] as ProviderCollection[]),
    ]);
    const artistIds = [...new Set([...top, ...followed].map(artist => String(artist.id)))].slice(0, RELEASE_ARTISTS);
    const pages = await Promise.all(artistIds.map(id => callSpotifyWeb<SpotifyWebPage<SpotifyWebAlbum>>(`/artists/${encodeURIComponent(id)}/albums`, {
        query: { include_groups: 'album,single', limit: RELEASES_PER_ARTIST },
    }).catch((error: unknown) => {
        console.warn(`[Spotify] The albums of artist ${id} could not be read`, error);
        return { items: [] } as SpotifyWebPage<SpotifyWebAlbum>;
    })));
    const seen = new Set<string>();
    return pages.flatMap(page => page.items ?? [])
        .map(album => spotifyWebAlbumOf(album)).filter(present)
        .filter((album) => {
            const id = String(album.id);
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        })
        .sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0))
        .slice(0, limit);
});
