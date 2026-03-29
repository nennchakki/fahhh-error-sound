# Fahhh Error Sound

![icon](media/icon.png)

A VS Code extension that screams "FAHHH" every time a diagnostic error is detected.

[日本語版 README](README.ja.md)

## Install

### From GitHub Releases (recommended)

1. Download the latest `.vsix` from [Releases](https://github.com/nennchakki/fahhh-error-sound/releases)
2. In VS Code, `Cmd+Shift+P` / `Ctrl+Shift+P` → `Extensions: Install from VSIX...`
3. Select the downloaded `.vsix` file

### From the command line

```bash
curl -LO https://github.com/nennchakki/fahhh-error-sound/releases/latest/download/fahhh-error-sound-0.1.0.vsix
code --install-extension fahhh-error-sound-0.1.0.vsix
```

### Build from source

```bash
git clone https://github.com/nennchakki/fahhh-error-sound.git
cd fahhh-error-sound
pnpm install
pnpm run compile
npx @vscode/vsce package --no-dependencies
code --install-extension fahhh-error-sound-0.1.0.vsix
```

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `fahhh.enabled` | Enable/disable the sound | `true` |
| `fahhh.volume` | Volume level (0-100) | `50` |

## How it works

- When a new diagnostic error (red squiggly) appears, a random fahhh sound (1-5) is played
- 1-second debounce prevents rapid-fire playback

## Supported OS

| OS | Playback method |
|---|---|
| macOS | `afplay` (built-in) |
| Linux | `aplay` (built-in) |
| Windows | PowerShell `SoundPlayer` (built-in) |

No additional software required. Just install the extension and you're good to go.
