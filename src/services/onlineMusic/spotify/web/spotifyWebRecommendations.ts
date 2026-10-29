import type { UnifiedSong } from '../../../../types';
import { OnlineProviderError } from '../../../../types/onlineMusic';
import type { OnlineRecommendationProvider } from '../../../../types/onlineMusic';
import { spotifyWebArtistReleases, spotifyWebRecentSongs, spotifyWebTopSongs } from './spotifyWebTaste';

// src/services/onlineMusic/spotify/web/spotifyWebRecommendations.ts
// The radio tab of the web version, made of the account's own listening (spotifyWebTaste.ts): the
// Web API gives an app of one's own no radio, recommendations or Spotify's mixes.
//  - Personal FM: the songs the account played most these four weeks, these six months and ever,
//    and the ones it played last, in a random order, each handed out once in a run of the app. Once
//    all are out, they are read again and the ones not yet handed out go on. A trashed song is not
//    handed out again in that run.
//  - Daily songs: the same songs in an order of the day, the same all day long.
//  - Recommended playlists: the latest albums and singles of the artists the account plays most.
// A read Spotify refuses is left out and the rest goes on; offline, the call fails and is asked again.

const FM_BATCH = 2;
const DAILY_SONGS = 30;

const newFm = () => ({
    /** The songs still to hand out, in their random order. */
    left: [] as UnifiedSong[],
    /** Every song handed out or trashed in this run. */
    gone: new Set<string>(),
    queue: Promise.resolve() as Promise<unknown>,
});
let fm = newFm();

/** Forgets the FM: for when the account signs out. */
export const resetSpotifyWebRecommendations = (): void => {
    fm = newFm();
};

const isOffline = (error: unknown) => error instanceof OnlineProviderError && error.code === 'network';

// The songs the radio tab is made of, each once: a part Spotify refuses (a sign-in made before
// these were asked for has no right to them) is left out.
const pool = async (): Promise<UnifiedSong[]> => {
    const parts = await Promise.all([
        spotifyWebTopSongs('short_term'), spotifyWebTopSongs('medium_term'), spotifyWebTopSongs('long_term'), spotifyWebRecentSongs(),
    ].map(read => read.catch((error: unknown) => {
        if (isOffline(error)) throw error;
        console.warn('[Spotify] Radio tab: a part of the account\'s listening could not be read; it goes on without it', error);
        return [] as UnifiedSong[];
    })));
    const seen = new Set<string>();
    return parts.flat().filter((song) => {
        const id = String(song.id);
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });
};

// A random order of `songs`, made from `next` (Math.random, or a generator seeded with the day).
const shuffled = <T>(songs: T[], next: () => number): T[] => {
    const order = [...songs];
    for (let index = order.length - 1; index > 0; index -= 1) {
        const other = Math.floor(next() * (index + 1));
        [order[index], order[other]] = [order[other], order[index]];
    }
    return order;
};

// A generator of numbers in [0, 1) that gives the same ones for the same seed (mulberry32).
const seeded = (seed: number) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

const today = (): number => {
    const now = new Date();
    return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
};

const nextFmSongs = async (session: typeof fm): Promise<UnifiedSong[]> => {
    if (session.left.length < FM_BATCH) {
        const fresh = (await pool()).filter(song => !session.gone.has(String(song.id)));
        const leftIds = new Set(session.left.map(song => String(song.id)));
        session.left.push(...shuffled(fresh.filter(song => !leftIds.has(String(song.id))), Math.random));
    }
    const songs = session.left.splice(0, FM_BATCH);
    songs.forEach(song => session.gone.add(String(song.id)));
    console.log(`[Spotify] Personal FM: ${songs.length} songs handed out, ${session.left.length} left, ${session.gone.size} handed out or trashed in this run`);
    return songs;
};

export const spotifyWebRecommendations: OnlineRecommendationProvider = {
    getPersonalFm() {
        const session = fm;
        const turn = session.queue.catch(() => undefined).then(() => nextFmSongs(session));
        session.queue = turn;
        return turn;
    },
    // The FM's trash button: Spotify is told nothing; the song is kept out of the FM for this run.
    async dislikeSong(id) {
        const song = String(id);
        fm.gone.add(song);
        fm.left = fm.left.filter(left => String(left.id) !== song);
        console.log(`[Spotify] Personal FM: ${song} was trashed and is not handed out again in this run`);
        return {};
    },
    async getDailySongs() {
        const songs = shuffled(await pool(), seeded(today())).slice(0, DAILY_SONGS);
        console.log(`[Spotify] Daily songs: ${songs.length} of the account's most played and last played songs, in today's order`);
        return songs;
    },
    async getRecommendedCollections(limit) {
        const albums = await spotifyWebArtistReleases(limit).catch((error: unknown) => {
            if (isOffline(error)) throw error;
            console.warn('[Spotify] Radio tab: the new releases could not be read; the tab goes on without them', error);
            return [];
        });
        console.log(`[Spotify] Recommended playlists: ${albums.length} new releases of the artists the account plays most`);
        return albums;
    },
};
