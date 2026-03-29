import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

const SOUND_COUNT = 5;

function getConfig(): { enabled: boolean; volume: number } {
  const config = vscode.workspace.getConfiguration("fahhh");
  return {
    enabled: config.get<boolean>("enabled", true),
    volume: config.get<number>("volume", 50),
  };
}

let panel: vscode.WebviewPanel | undefined;

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
  const soundUri = getOrCreatePanel(context).webview.asWebviewUri(
    vscode.Uri.file(path.join(context.extensionPath, "media", fileName)),
  );
  const vol = volume / 100;

  getOrCreatePanel(context).webview.html = `<!DOCTYPE html>
<html><body><script>
  const a = new Audio('${soundUri}');
  a.volume = ${vol};
  a.play();
</script></body></html>`;
}

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.window.onDidEndTerminalShellExecution((event) => {
    const { enabled, volume } = getConfig();
    if (!enabled || volume === 0) {
      return;
    }

    if (event.exitCode !== undefined && event.exitCode !== 0) {
      playRandomSound(context, volume);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate(): void {
  if (panel) {
    panel.dispose();
    panel = undefined;
  }
}
