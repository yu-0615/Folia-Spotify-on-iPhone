<p align="center">
  <img src="https://github.com/user-attachments/assets/b5d0e863-48be-497b-b0e9-4bd8d8ce9bf0" alt="Folia" width="100%" />
</p>

<div align="center">

# Folia-Spotify on iPhone

Full-screen synced lyrics for Spotify, on your iPhone

[繁體中文](README.md) | English

[![License](https://img.shields.io/github/license/yu-0615/Folia-Spotify-on-iPhone)](LICENSE)
[![Based on Folia-Spotify](https://img.shields.io/badge/based%20on-Folia--Spotify-1DB954)](https://github.com/yu-0615/Folia-Spotify)
[![Original: Folia](https://img.shields.io/badge/original-chthollyphile%2Ffolia--major-555)](https://github.com/chthollyphile/folia-major)

[Deploy to iPhone](#deploy-to-iphone)
·
[Deploy to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/yu-0615/Folia-Spotify-on-iPhone)
·
[Spotify](#spotify)
·
[FAQ](#faq)

</div>

> [!NOTE]
> This repository is the iPhone version of [Folia-Spotify](https://github.com/yu-0615/Folia-Spotify). Folia-Spotify is a fork of [Folia](https://github.com/chthollyphile/folia-major) by [chthollyphile](https://github.com/chthollyphile), released under the original project's [AGPL-3.0](LICENSE) license. Folia's design and nearly all of its code are the work of the original author and [its contributors](CONTRIBUTORS.md); please report issues with the original features to, and star, the original project.

## About

Folia is a music player built around full-screen, immersive lyrics, with many lyric animations, AI-generated color themes, and automatic lyric matching.

**Folia-Spotify on iPhone** deploys the web version of Folia-Spotify to Vercel; added to the home screen from Safari on an iPhone, it works like an app:

- The songs play in the **Spotify app** on the iPhone, while Folia shows the synced lyrics and can play, pause, skip, and change the volume.
- Lyrics are matched automatically from NetEase Cloud Music, QQ Music, Kugou, and AMLL.
- The layout is adjusted for the iPhone, and Spotify sign-in works when Folia is opened from the home screen.

### How it differs from Folia-Spotify

The features are those of Folia-Spotify, with these changes for the iPhone:

| Area | Change |
| --- | --- |
| Layout | A smaller page font size (12px), content running into the notch and bottom safe areas, the bottom bar closer to the edge, a wider player capsule |
| Now-playing card | Pill-shaped with a round cover, placed a little further from the left edge, clear of the rounded corner |
| Control panel | 288px wide, with its toggle moved inward |
| Spotify sign-in | Opened from the home screen, Spotify's sign-in page opens inside Folia and comes back to it once you agree (Folia-Spotify opens a separate window, which never comes back to a home-screen app) |
| Now Playing | The host to connect to can be set with `?npHost=`, and an HTTPS page uses `wss` |

## Deploy to iPhone

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yu-0615/Folia-Spotify-on-iPhone)

Create a Vercel project from this repository with the button above, and note its domain once it is deployed (`https://<name>.vercel.app`). See the [Vercel deployment guide](https://folia-site.cielaniska.top/guide/deploy-vercel) for the steps, and the [technical notes](docs/technical.md) and [QQ Music deployment guide](docs/qq-music-deployment.md) for the other environment variables (such as QQ Music's `VITE_QQ_API_BASE` and `QQ_SESSION_SECRET`).

### 2. Create your own Spotify app

1. Create an app on [Spotify for Developers](https://developer.spotify.com/dashboard) with the **Web API**.
2. Add `https://<your domain>/spotify-callback.html` to its **Redirect URIs**.
3. Add the accounts that will sign in under **User Management**. An app in Development Mode allows up to 5 accounts, and both the app's owner and its users need Spotify Premium.
4. Note the app's **Client ID**. Setting `VITE_SPOTIFY_CLIENT_ID` in Vercel's environment variables saves typing it at sign-in. The Client ID is not a secret; **the Client Secret is not used, so do not put it here.**

### 3. Add it to the home screen

1. Open your domain in **Safari** on the iPhone.
2. Choose Share → Add to Home Screen.
3. From then on, open Folia from its icon on the home screen.

### 4. Sign in to Spotify

In **the Folia opened from the home screen**, choose Spotify and sign in, giving the Client ID if asked. Spotify's sign-in page opens inside Folia and comes back to it once you choose Agree.

A Safari tab and the home-screen Folia keep their data apart: signing in in a Safari tab does not sign in the home-screen Folia.

## Spotify

- **Where it plays**: the songs always play in the Spotify app. There is no device to choose: Folia follows the device Spotify is playing on now (this iPhone, a Mac, a speaker…), and "Playing on" in the control panel names it. With none open, Folia asks you to open Spotify first.
- **Following along**: change songs or skip in the Spotify app, or let Spotify's crossfade move on early, and Folia follows.
- **What it can do**: search, play, read your playlists and saved songs, like songs, add songs to and remove them from your playlists, and create playlists.
- **Lyrics**: matched from NetEase Cloud Music, QQ Music, Kugou, and AMLL.

Spotify's limits on third-party web apps (not something Folia can change):

- Only playlists you created or collaborate on can be read. Other people's playlists, and Spotify's own ones such as Daily Mix, Discover Weekly, and Release Radar, cannot. Daily Mix is read only by [the Folia-Spotify desktop app](https://github.com/yu-0615/Folia-Spotify).
- There are no Spotify lyrics, and no radio or explore page.
- The sound comes from the Spotify app, so the equalizer, effects, visualizer, and automix cannot reach Spotify's songs.

### Music platforms in mainland China

NetEase Cloud Music, QQ Music, Kugou, Bodian, and Qishui serve as lyric sources only by default and are not in the platform list. To switch to and sign in to them as in the original Folia, turn on "Show all platforms in the platform list" under Settings → Connections.

## Now Playing

Folia can connect to a [Now Playing](https://github.com/Widdit/now-playing-service/) service to show the songs and lyrics of other players on a computer. An iPhone cannot reach the computer's `localhost`, so expose the service through an HTTPS tunnel (such as Cloudflare Tunnel) and tell Folia the tunnel's host:

```text
https://<your domain>/?npHost=<tunnel host>
```

Open that address once and Folia remembers the host, including when opened from the home screen. With a new tunnel, open it once again with the new host.

## FAQ

**Spotify's sign-in did not come back to Folia?**
Check that you signed in from the home-screen Folia, not a Safari tab, and that the Spotify app's Redirect URI matches your domain exactly (`https://<your domain>/spotify-callback.html`).

**Sign-in says the account is not allowed?**
A Spotify app in Development Mode lets only the accounts under User Management sign in; add the account there.

**Folia did not follow Spotify to the next song?**
While the iPhone is locked or Folia is in the background, iOS pauses the page; the song plays on in the Spotify app. Back in Folia, it reads again where Spotify is.

**How do I get updates?**
This repository follows Folia-Spotify. A Vercel project redeploys by itself when the repository it was deployed from gets new commits.

## Local development

```bash
npm install
npm run dev:web
```

This starts the web version together with the NetEase Cloud Music, QQ Music, and Kugou APIs the lyric matching uses. Open `http://127.0.0.1:3000` (not `localhost`, which Spotify does not accept). The local Redirect URI is `http://127.0.0.1:3000/spotify-callback.html`.

To see the iPhone layout locally, switch a desktop browser's developer tools to an iPhone size. See the [technical and development notes](docs/technical.md) for deployment, environment variables, and the tech stack.

## Showcase

![visualizer](./img/visualizer.png)

<table>
  <tr>
    <td width="50%">
      <img src="./img/preview-fume.png" alt="Fume preview" />
    </td>
    <td width="50%">
      <img src="./img/preview-lumi.png" alt="Luminous preview" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Fume</strong></td>
    <td align="center"><strong>Luminous</strong></td>
  </tr>
  <tr>
    <td width="50%">
      <img src="./img/preview-cad.png" alt="Mindscape preview" />
    </td>
    <td width="50%">
      <img src="./img/preview-pat.png" alt="Partita preview" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Mindscape</strong></td>
    <td align="center"><strong>Partita</strong></td>
  </tr>
  <tr>
    <td width="50%">
      <img src="./img/preview-cappella.jpg" alt="Cappella preview" />
    </td>
    <td width="50%">
      <img src="./img/preview-tilt.png" alt="Tilt preview" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Cappella</strong></td>
    <td align="center"><strong>Tilt</strong></td>
  </tr>
  <tr>
    <td width="50%">
      <img src="./img/preview-diorama.png" alt="Diorama preview" />
    </td>
    <td width="50%">
      <img src="./img/preview-pendolo.png" alt="Pendolo preview" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Diorama</strong></td>
    <td align="center"><strong>Pendolo</strong></td>
  </tr>
</table>

## Desktop app and other features

The desktop app (Windows / macOS / Linux), YouTube Music, mods, the Sync Server, the local music library, and the rest of what is not part of the iPhone version are covered by [Folia-Spotify](https://github.com/yu-0615/Folia-Spotify) and [the original Folia](https://github.com/chthollyphile/folia-major). See the [Folia Guide](https://folia-site.cielaniska.top/guide/) for the full user guide.

## Legal and disclaimer

This project was developed with extensive AI assistance and may still contain subtle or hard-to-spot problems. We apologize for any inconvenience.

The project mainly showcases playback animation, interface design, and the engineering behind them. Copyright in the online streams, lyrics, album art, and other content shown in the app belongs to the respective rights holders.

This repository and its source code are for personal study, technical exchange, and non-profit testing only. Do not use them for commercial purposes. Users bear sole responsibility for any copyright dispute or other liability arising from distributing, modifying, or redistributing online resources; the developers accept no liability.

Please respect digital rights and support licensed music through official platforms whenever you can.

## Acknowledgements

- [chthollyphile/folia-major](https://github.com/chthollyphile/folia-major): the original Folia, and [its contributors](CONTRIBUTORS.md).
- [chenmozhijin/LDDC](https://github.com/chenmozhijin/LDDC)
- [NeteaseCloudMusicApiEnhanced](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced)
- [chenglou/pretext](https://github.com/chenglou/pretext)
- [MakcRe/KuGouMusicApi](https://github.com/MakcRe/KuGouMusicApi)
- [paper-design/shaders](https://github.com/paper-design/shaders)
- [yakult-green-tea/qq-music-api](https://github.com/yakult-green-tea/qq-music-api)

Folia uses the [Apple Music-like Lyrics TTML word-by-word lyrics database](https://github.com/amll-dev/amll-ttml-db) for high-quality lyric files. Thanks to its authors and contributors.

## License

Folia is open source under the `AGPL-3.0` license.
