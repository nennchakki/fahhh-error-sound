# Fahhh Error Sound

![icon](media/icon.png)

VS Codeのターミナルでコマンドが失敗したら「FAHHH」と叫んでくれる拡張機能。

[English README](README.md)

## インストール

1. [Releases](https://github.com/nennchakki/fahhh-error-sound/releases) から最新の `.vsix` ファイルをダウンロード
2. VS Codeで `Cmd+Shift+P` / `Ctrl+Shift+P` → `Extensions: Install from VSIX...` を選択
3. ダウンロードした `.vsix` ファイルを選択

## 設定

| 設定 | 説明 | デフォルト |
|------|------|-----------|
| `fahhh.enabled` | 有効/無効 | `true` |
| `fahhh.volume` | 音量 (0-100) | `50` |

## 動作

- VS Codeのターミナルでコマンドが非ゼロのexit codeで終了すると、fahhh-1〜5.wavのどれかがランダムに再生されます
- macOS、Linux、Windows対応 — 追加インストール不要
- VS Code 1.93以上が必要（Shell Integration機能を使用）

## ソースからビルド

<details>
<summary>開発者向け</summary>

```bash
git clone https://github.com/nennchakki/fahhh-error-sound.git
cd fahhh-error-sound
pnpm install
pnpm run compile
npx @vscode/vsce package --no-dependencies
code --install-extension fahhh-error-sound-0.1.0.vsix
```

</details>
