<p align="center">
  <img src="https://github.com/user-attachments/assets/b5d0e863-48be-497b-b0e9-4bd8d8ce9bf0" alt="Folia" width="100%" />
</p>

<div align="center">

# Folia-Spotify on iPhone

在 iPhone 上，跟著 Spotify 看全螢幕的同步歌詞

繁體中文 | [English](README.en.md)

[![License](https://img.shields.io/github/license/yu-0615/Folia-Spotify-on-iPhone)](LICENSE)
[![Based on Folia-Spotify](https://img.shields.io/badge/based%20on-Folia--Spotify-1DB954)](https://github.com/yu-0615/Folia-Spotify)
[![Original: Folia](https://img.shields.io/badge/original-chthollyphile%2Ffolia--major-555)](https://github.com/chthollyphile/folia-major)

[部署到 iPhone](#部署到-iphone)
·
[Vercel 一鍵部署](https://vercel.com/new/clone?repository-url=https://github.com/yu-0615/Folia-Spotify-on-iPhone)
·
[Spotify](#spotify)
·
[常見問題](#常見問題)

</div>

> [!NOTE]
> 這個儲存庫是 [Folia-Spotify](https://github.com/yu-0615/Folia-Spotify) 給 iPhone 用的版本。Folia-Spotify 是 [Folia](https://github.com/chthollyphile/folia-major)（作者 [chthollyphile](https://github.com/chthollyphile)）的 fork，按原專案的 [AGPL-3.0](LICENSE) 授權條款釋出。Folia 的設計與絕大部分程式碼都出自原作者和[貢獻者們](CONTRIBUTORS.md)，原有功能的問題請回報到原專案，也請幫原專案按星星。

## 專案簡介

Folia 是一個以全螢幕沉浸式歌詞為核心的音樂播放器，有多種歌詞動畫、AI 生成的配色主題，以及自動的歌詞匹配。

**Folia-Spotify on iPhone** 把 Folia-Spotify 的網頁版部署到 Vercel，再用 iPhone 的 Safari 加入主畫面，當成一個 App 來用：

- 歌在 iPhone 上的 **Spotify App** 裡播放，Folia 跟著顯示同步歌詞，也能播放、暫停、換歌、調音量。
- 歌詞從網易雲、QQ 音樂、酷狗、AMLL 自動匹配。
- 版面為 iPhone 調整過，從主畫面打開的 Folia 也能登入 Spotify。

### 和 Folia-Spotify 的差別

功能和 Folia-Spotify 一樣，只多了這些為 iPhone 做的調整：

| 項目 | 調整 |
| --- | --- |
| 版面 | 整頁字級縮小（12px），內容延伸到瀏海和底部的安全區域，底部列更貼近邊緣，播放膠囊放寬 |
| 正在播放卡片 | 改成膠囊形、圓形封面，預設離左邊遠一點，避開圓角 |
| 控制面板 | 寬 216px（和 Folia-on-iPhone 一樣，分頁改成圖示），開關鈕往內移 |
| Spotify 登入 | 從主畫面打開時，Spotify 的登入頁在 Folia 裡打開，同意後自動回到 Folia（Folia-Spotify 是另開視窗，在主畫面 App 裡回不來） |
| Now Playing | 可以用 `?npHost=` 指定要連的主機，HTTPS 頁面自動改用 `wss` |
| 和 Spotify App 一起播放 | Folia 靠一段靜音音訊對時間。iPhone 上這段音訊會和其他 App 的聲音混在一起播放，不會打斷 Spotify App（用的是 Safari 的 Audio Session 功能，**需要 iOS 16.4 以上**）；離開 Folia 時 iOS 暫停它，也不會跟著把 Spotify 暫停 |

## 部署到 iPhone

> [!IMPORTANT]
> 需要 **iOS 16.4 以上**。較舊的 iOS 沒有 Safari 的 Audio Session 功能，Folia 對時間用的靜音音訊會打斷 Spotify App，兩邊會互相暫停。

### 1. 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yu-0615/Folia-Spotify-on-iPhone)

按上面的按鈕，用這個儲存庫建立 Vercel 專案，部署完記下網域（`https://<名稱>.vercel.app`）。詳細步驟見 [Vercel 一鍵部署指南](https://folia-site.cielaniska.top/guide/deploy-vercel)，其他環境變數（例如 QQ 音樂的 `VITE_QQ_API_BASE`、`QQ_SESSION_SECRET`）見 [技術說明](docs/technical.md) 和 [QQ 音樂部署指南](docs/qq-music-deployment.md)。

### 2. 建立你自己的 Spotify 應用

1. 到 [Spotify for Developers](https://developer.spotify.com/dashboard) 建立應用，API 勾選 **Web API**。
2. 在 **Redirect URIs** 加上 `https://<你的網域>/spotify-callback.html`。
3. 在 **User Management** 加入要登入的帳號。開發模式的應用最多 5 個帳號，應用擁有者和使用者都需要 Spotify Premium。
4. 記下應用的 **Client ID**。可以在 Vercel 的環境變數設 `VITE_SPOTIFY_CLIENT_ID`，登入時就不用再填。Client ID 不是機密；**Client Secret 用不到，也不要放進來。**

### 3. 加入主畫面

1. 用 iPhone 的 **Safari** 打開你的網域。
2. 按「分享」→「加入主畫面」。
3. 之後都從主畫面的 Folia 圖示打開。

### 4. 登入 Spotify

在**主畫面打開的 Folia** 裡選 Spotify 登入，需要時填入 Client ID。Spotify 的登入頁會在 Folia 裡打開，按「同意」後自動回到 Folia。

Safari 分頁和主畫面的 Folia 各存各的資料，在 Safari 分頁裡登入過，主畫面的 Folia 還是要再登入一次。

## Spotify

- **在哪裡播放**：歌一律在 Spotify App 裡播放。不用選裝置，Folia 跟著 Spotify 現在在播放的那台（這台 iPhone、Mac、音箱……），控制面板的「播放裝置」寫著是哪台。都沒開時，Folia 會提醒你先打開 Spotify。
- **跟著換歌**：在 Spotify App 裡換歌、跳到下一首，或 Spotify 開了淡入淡出提早換歌，Folia 都會跟上。
- **能做的事**：搜尋、播放、讀取你的歌單和收藏、按讚、把歌加入或移出你的歌單、建立歌單。
- **歌詞**：從網易雲、QQ 音樂、酷狗、AMLL 匹配。

Spotify 對第三方網頁應用的限制（不是 Folia 能改的）：

- 只讀得到你自己建立或參與協作的歌單。別人的歌單，以及 Daily Mix、Discover Weekly、Release Radar 這類 Spotify 自己做的歌單都讀不到。Daily Mix 只有 [Folia-Spotify 的桌面版](https://github.com/yu-0615/Folia-Spotify) 讀得到。
- 沒有 Spotify 自己的歌詞，也沒有電台頁和探索頁。
- 聲音由 Spotify App 發出，所以等化器、音效、視覺化和自動混音都碰不到 Spotify 的歌。

### 中國大陸的音樂平臺

網易雲、QQ 音樂、酷狗、波點、汽水音樂預設只當歌詞來源，不會出現在平臺清單裡。要像原版一樣切換、登入這些平臺，到「設定 → 連線與整合」打開「在平臺清單中顯示所有平臺」。

## Now Playing

Folia 可以接 [Now Playing](https://github.com/Widdit/now-playing-service/) 服務，顯示電腦上其他播放器的歌曲和歌詞。iPhone 連不到電腦的 `localhost`，所以要把電腦上的服務經 HTTPS 通道（例如 Cloudflare Tunnel）開出來，再告訴 Folia 通道的主機：

```text
https://<你的網域>/?npHost=<通道主機>
```

用這個網址打開一次，Folia 就會記住這台主機，之後從主畫面打開也會連它。換了通道就再用新的主機打開一次。

## 常見問題

**Spotify 登入後沒有回到 Folia？**
確認是從主畫面的 Folia 登入，而不是 Safari 分頁；也確認 Spotify 應用的 Redirect URI 和你的網域完全一致（`https://<你的網域>/spotify-callback.html`）。

**登入時說帳號不被允許？**
開發模式的 Spotify 應用只讓 User Management 裡的帳號登入，把那個帳號加進去。

**Folia 沒有跟著 Spotify 換歌？**
iPhone 鎖定或把 Folia 切到背景時，iOS 會暫停網頁，歌照樣在 Spotify App 裡播。回到 Folia 後，它會再去讀 Spotify 現在放到哪。

**怎麼取得更新？**
這個儲存庫會跟著 Folia-Spotify 更新。Vercel 專案連著你部署的那個儲存庫，那裡有新的提交時會自動重新部署。

## 本機開發

```bash
npm install
npm run dev:web
```

這個指令會一次啟動網頁版，以及歌詞匹配要用的網易雲、QQ 音樂、酷狗 API。用 `http://127.0.0.1:3000` 開啟（不要用 `localhost`，Spotify 不接受）。本機的 Redirect URI 是 `http://127.0.0.1:3000/spotify-callback.html`。

要在 iPhone 上看本機的版面，可以用電腦瀏覽器的開發者工具切到 iPhone 尺寸。部署、環境變數和技術棧見 [技術與開發說明](docs/technical.md)。

## 展示

![visualizer](./img/visualizer.png)

<table>
  <tr>
    <td width="50%">
      <img src="./img/preview-fume.png" alt="Fume 主題預覽" />
    </td>
    <td width="50%">
      <img src="./img/preview-lumi.png" alt="Lumi 主題預覽" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>浮名</strong></td>
    <td align="center"><strong>流光</strong></td>
  </tr>
  <tr>
    <td width="50%">
      <img src="./img/preview-cad.png" alt="Cad 主題預覽" />
    </td>
    <td width="50%">
      <img src="./img/preview-pat.png" alt="Pat 主題預覽" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>心象</strong></td>
    <td align="center"><strong>雲階</strong></td>
  </tr>
  <tr>
    <td width="50%">
      <img src="./img/preview-cappella.jpg" alt="群唱 主題預覽" />
    </td>
    <td width="50%">
      <img src="./img/preview-tilt.png" alt="Tilt 主題預覽" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>群唱</strong></td>
    <td align="center"><strong>傾訴</strong></td>
  </tr>
  <tr>
    <td width="50%">
      <img src="./img/preview-diorama.png" alt="鏡臺 主題預覽" />
    </td>
    <td width="50%">
      <img src="./img/preview-pendolo.png" alt="時計 主題預覽" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>鏡臺</strong></td>
    <td align="center"><strong>時計</strong></td>
  </tr>
</table>

## 桌面版和其他功能

桌面版（Windows / macOS / Linux）、YouTube Music、模組系統、Sync Server、本地音樂庫等不屬於 iPhone 版的內容，見 [Folia-Spotify](https://github.com/yu-0615/Folia-Spotify) 和 [原版 Folia](https://github.com/chthollyphile/folia-major)。完整的使用說明見 [Folia Guide](https://folia-site.cielaniska.top/guide/)。

## 法律與免責聲明

本專案在 AI 的廣泛協助下開發，因此仍可能存在細微或不易察覺的問題。若給你帶來不便，敬請理解。

本專案主要用於展示播放動效、介面設計與相關工程實現。應用中涉及的線上音樂流媒體、歌詞、專輯封面及其他內容，其版權均歸對應權利人所有。

本儲存庫及其原始碼僅供個人學習、技術交流與非營利測試使用。請勿將其用於商業盈利用途。若因對線上資源的傳播、加工或再分發而引發版權糾紛或其他責任，均由使用者自行承擔，專案開發者不承擔相關責任。

請始終尊重數字版權，並在條件允許時通過官方平臺支援正版音樂。

## 致謝

- [chthollyphile/folia-major](https://github.com/chthollyphile/folia-major)：Folia 原專案，以及它的[貢獻者們](CONTRIBUTORS.md)。
- [chenmozhijin/LDDC](https://github.com/chenmozhijin/LDDC)
- [NeteaseCloudMusicApiEnhanced](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced)
- [chenglou/pretext](https://github.com/chenglou/pretext)
- [MakcRe/KuGouMusicApi](https://github.com/MakcRe/KuGouMusicApi)
- [paper-design/shaders](https://github.com/paper-design/shaders)
- [yakult-green-tea/qq-music-api](https://github.com/yakult-green-tea/qq-music-api)

本專案接入了 [Apple Music-like Lyrics TTML 逐詞歌詞庫](https://github.com/amll-dev/amll-ttml-db) 以提供高品質的歌詞檔案，感謝此歌詞庫的作者和貢獻者們。

## 授權條款

本專案基於 `AGPL-3.0` 授權條款開源。
