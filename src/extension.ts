import * as vscode from "vscode";
import { execFile } from "child_process";
import * as path from "path";

const SOUND_COUNT = 5;

function getConfig(): { enabled: boolean; volume: number } {
  const config = vscode.workspace.getConfiguration("fahhh");
  return {
    enabled: config.get<boolean>("enabled", true),
    volume: config.get<number>("volume", 50),
  };
}

function playSound(soundPath: string, volume: number): void {
  const vol = volume / 100;

  switch (process.platform) {
    case "darwin":
      execFile("afplay", ["-v", String(vol), soundPath]);
      break;
    case "linux":
      execFile("aplay", ["-q", soundPath]);
      break;
    case "win32":
      execFile("powershell", [
        "-NoProfile", "-Command",
        `(New-Object Media.SoundPlayer '${soundPath.replace(/'/g, "''")}').PlaySync()`,
      ]);
      break;
  }
}

function playRandomSound(extensionPath: string, volume: number): void {
  const index = Math.floor(Math.random() * SOUND_COUNT) + 1;
  const soundPath = path.join(extensionPath, "media", `fahhh-${index}.wav`);
  playSound(soundPath, volume);
}

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.window.onDidEndTerminalShellExecution((event) => {
    const { enabled, volume } = getConfig();
    if (!enabled || volume === 0) {
      return;
    }

    if (event.exitCode !== undefined && event.exitCode !== 0) {
      playRandomSound(context.extensionPath, volume);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate(): void {}
