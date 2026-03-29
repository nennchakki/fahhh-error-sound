# Fahhh Error Sound

![icon](media/icon.png)

VS Codeでエラーが出るたびに「FAHHH」と叫んでくれる拡張機能。

## インストール

### GitHub Releasesから（推奨）

1. [Releases](https://github.com/nennchakki/fahhh-error-sound/releases) から最新の `.vsix` ファイルをダウンロード
2. VS Codeで `Cmd+Shift+P` → `Extensions: Install from VSIX...` を選択
3. ダウンロードした `.vsix` ファイルを選択

### コマンドラインから

```bash
# ダウンロード
curl -LO https://github.com/nennchakki/fahhh-error-sound/releases/latest/download/fahhh-error-sound-0.1.0.vsix

# インストール
code --install-extension fahhh-error-sound-0.1.0.vsix
```

### ソースからビルド

```bash
git clone https://github.com/nennchakki/fahhh-error-sound.git
cd fahhh-error-sound
pnpm install
pnpm run compile
npx @vscode/vsce package --no-dependencies
code --install-extension fahhh-error-sound-0.1.0.vsix
```

## 設定

| 設定 | 説明 | デフォルト |
|------|------|-----------|
| `fahhh.enabled` | 有効/無効 | `true` |
| `fahhh.volume` | 音量 (0-100) | `50` |

## 動作

- コード内にエラー（赤い波線）が発生すると、fahhh-1〜5.mp3のどれかがランダムに再生されます
- 連続再生を防ぐため1秒のデバウンスが入っています

## 対応OS

| OS | 再生方法 | 備考 |
|---|---|---|
| macOS | `afplay` | 標準搭載 |
| Linux | `ffplay` | `sudo apt install ffmpeg` 等で導入 |
| Windows | PowerShell (`MediaPlayer`) | 追加インストール不要 |
