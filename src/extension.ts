import * as vscode from "vscode";
import { execFile, exec } from "child_process";
import * as path from "path";

const SOUND_COUNT = 5;
const DEBOUNCE_MS = 1000;

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let previousErrorUris = new Set<string>();

function getConfig(): { enabled: boolean; volume: number } {
  const config = vscode.workspace.getConfiguration("fahhh");
  return {
    enabled: config.get<boolean>("enabled", true),
    volume: config.get<number>("volume", 50),
  };
}

function buildErrorUriSet(): Set<string> {
  const errorUris = new Set<string>();
  for (const [uri, diagnostics] of vscode.languages.getDiagnostics()) {
    const hasError = diagnostics.some(
      (d) => d.severity === vscode.DiagnosticSeverity.Error
    );
    if (hasError) {
      errorUris.add(uri.toString());
    }
  }
  return errorUris;
}

function playSound(soundPath: string, volume: number): void {
  const vol = volume / 100;

  switch (process.platform) {
    case "darwin":
      execFile("afplay", ["-v", String(vol), soundPath]);
      break;
    case "linux":
      execFile("ffplay", [
        "-nodisp", "-autoexit", "-loglevel", "quiet",
        "-volume", String(volume), soundPath,
      ]);
      break;
    case "win32": {
      const escaped = soundPath.replace(/'/g, "''");
      exec(
        `powershell -NoProfile -Command "` +
        `Add-Type -AssemblyName PresentationCore; ` +
        `$p = New-Object System.Windows.Media.MediaPlayer; ` +
        `$p.Volume = ${vol}; ` +
        `$p.Open([Uri]'${escaped}'); ` +
        `$p.Play(); ` +
        `Start-Sleep -Seconds 5; ` +
        `$p.Close()"`,
      );
      break;
    }
  }
}

function playRandomSound(extensionPath: string, volume: number): void {
  const index = Math.floor(Math.random() * SOUND_COUNT) + 1;
  const soundPath = path.join(extensionPath, "media", `fahhh-${index}.mp3`);
  playSound(soundPath, volume);
}

export function activate(context: vscode.ExtensionContext): void {
  previousErrorUris = buildErrorUriSet();

  const disposable = vscode.languages.onDidChangeDiagnostics((event) => {
    const { enabled, volume } = getConfig();
    if (!enabled || volume === 0) {
      return;
    }

    const currentErrorUris = buildErrorUriSet();

    // Check if any URI in the changed set has new errors
    let hasNewError = false;
    for (const changedUri of event.uris) {
      const uriStr = changedUri.toString();
      if (currentErrorUris.has(uriStr) && !previousErrorUris.has(uriStr)) {
        hasNewError = true;
        break;
      }
    }

    previousErrorUris = currentErrorUris;

    if (!hasNewError) {
      return;
    }

    // Debounce
    if (debounceTimer !== undefined) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      debounceTimer = undefined;
      playRandomSound(context.extensionPath, volume);
    }, DEBOUNCE_MS);
  });

  context.subscriptions.push(disposable);
}

export function deactivate(): void {
  if (debounceTimer !== undefined) {
    clearTimeout(debounceTimer);
    debounceTimer = undefined;
  }
}
