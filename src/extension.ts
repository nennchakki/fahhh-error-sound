import * as vscode from "vscode";
import { execFile } from "child_process";
import * as path from "path";

const SOUND_COUNT = 5;
const DEBOUNCE_MS = 2000;

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let previousErrorCount = 0;

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

function triggerSound(extensionPath: string): void {
  const { enabled, volume } = getConfig();
  if (!enabled || volume === 0) {
    return;
  }
  const index = Math.floor(Math.random() * SOUND_COUNT) + 1;
  const soundPath = path.join(extensionPath, "media", `fahhh-${index}.wav`);
  playSound(soundPath, volume);
}

function countErrors(): number {
  let count = 0;
  for (const [, diagnostics] of vscode.languages.getDiagnostics()) {
    for (const d of diagnostics) {
      if (d.severity === vscode.DiagnosticSeverity.Error) {
        count++;
      }
    }
  }
  return count;
}

export function activate(context: vscode.ExtensionContext): void {
  const extPath = context.extensionPath;
  previousErrorCount = countErrors();

  // 1. ターミナルのコマンド失敗
  context.subscriptions.push(
    vscode.window.onDidEndTerminalShellExecution((event) => {
      if (event.exitCode !== undefined && event.exitCode !== 0) {
        triggerSound(extPath);
      }
    }),
  );

  // 2. 赤エラー（診断エラー）の新規発生（黄色の警告は無視）
  context.subscriptions.push(
    vscode.languages.onDidChangeDiagnostics(() => {
      const currentCount = countErrors();
      if (currentCount > previousErrorCount) {
        if (debounceTimer !== undefined) {
          clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
          debounceTimer = undefined;
          triggerSound(extPath);
        }, DEBOUNCE_MS);
      }
      previousErrorCount = currentCount;
    }),
  );

  // 3. タスク失敗（LaTeX Workshopのrecipe terminated等）
  context.subscriptions.push(
    vscode.tasks.onDidEndTaskProcess((event) => {
      if (event.exitCode !== undefined && event.exitCode !== 0) {
        triggerSound(extPath);
      }
    }),
  );
}

export function deactivate(): void {
  if (debounceTimer !== undefined) {
    clearTimeout(debounceTimer);
    debounceTimer = undefined;
  }
}
