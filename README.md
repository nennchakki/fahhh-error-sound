# Fahhh Error Sound

![icon](media/icon.png)

A VS Code extension that screams "FAHHH" when a command fails in the terminal.

[日本語版 README](README.ja.md)

## Install

1. Download the latest `.vsix` from [Releases](https://github.com/nennchakki/fahhh-error-sound/releases)
2. In VS Code, `Cmd+Shift+P` / `Ctrl+Shift+P` → `Extensions: Install from VSIX...`
3. Select the downloaded `.vsix` file

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `fahhh.enabled` | Enable/disable the sound | `true` |
| `fahhh.volume` | Volume level (0-100) | `50` |

## How it works

- When a command in the VS Code terminal exits with a non-zero exit code, a random fahhh sound (1-5) is played
- Works on macOS, Linux, and Windows — no additional software required
- Requires VS Code 1.93+ (Shell Integration)

## Build from source

<details>
<summary>For developers</summary>

```bash
git clone https://github.com/nennchakki/fahhh-error-sound.git
cd fahhh-error-sound
pnpm install
pnpm run compile
npx @vscode/vsce package --no-dependencies
code --install-extension fahhh-error-sound-0.1.0.vsix
```

</details>
