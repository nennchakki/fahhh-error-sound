import * as vscode from "vscode";
import * as path from "path";

const SOUND_COUNT = 5;
const DEBOUNCE_MS = 2000;

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let previousErrorCount = 0;
let panel: vscode.WebviewPanel | undefined;

function getConfig(): { enabled: boolean; volume: number } {
  const config = vscode.workspace.getConfiguration("fahhh");
  return {
    enabled: config.get<boolean>("enabled", true),
    volume: config.get<number>("volume", 50),
  };
}

function getOrCreatePanel(context: vscode.ExtensionContext): vscode.WebviewPanel {
  if (panel) {
    return panel;
  }
  panel = vscode.window.createWebviewPanel(
    "fahhhPlayer",
    "Fahhh",
    { viewColumn: vscode.ViewColumn.One, preserveFocus: true },
    { enableScripts: true, localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "media"))] },
  );
  panel.onDidDispose(() => { panel = undefined; });
  return panel;
}

function playRandomSound(context: vscode.ExtensionContext, volume: number): void {
  const index = Math.floor(Math.random() * SOUND_COUNT) + 1;
  const fileName = `fahhh-${index}.wav`;
  const p = getOrCreatePanel(context);
  const soundUri = p.webview.asWebviewUri(
    vscode.Uri.file(path.join(context.extensionPath, "media", fileName)),
  );
  const vol = volume / 100;

  p.webview.html = `<!DOCTYPE html>
<html><body><script>
  const a = new Audio('${soundUri}');
  a.volume = ${vol};
  a.play();
</script></body></html>`;
}

function triggerSound(context: vscode.ExtensionContext): void {
  const { enabled, volume } = getConfig();
  if (!enabled || volume === 0) {
    return;
  }
  playRandomSound(context, volume);
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
  previousErrorCount = countErrors();

  // 1. ターミナルのコマンド失敗
  context.subscriptions.push(
    vscode.window.onDidEndTerminalShellExecution((event) => {
      if (event.exitCode !== undefined && event.exitCode !== 0) {
        triggerSound(context);
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
          triggerSound(context);
        }, DEBOUNCE_MS);
      }
      previousErrorCount = currentCount;
    }),
  );

  // 3. タスク失敗（LaTeX Workshopのrecipe terminated等）
  context.subscriptions.push(
    vscode.tasks.onDidEndTaskProcess((event) => {
      if (event.exitCode !== undefined && event.exitCode !== 0) {
        triggerSound(context);
      }
    }),
  );
}

export function deactivate(): void {
  if (debounceTimer !== undefined) {
    clearTimeout(debounceTimer);
    debounceTimer = undefined;
  }
  if (panel) {
    panel.dispose();
    panel = undefined;
  }
}
