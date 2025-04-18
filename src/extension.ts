import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let lastReplacedLine: number | undefined;

    let disposable = vscode.workspace.onDidChangeTextDocument((event) => {
        const configuration = vscode.workspace.getConfiguration();
        const enabled = configuration.get<boolean>("converting-strings-to-template-literals.enabled");
        const validLanguages = configuration.get<string[]>("converting-strings-to-template-literals.validLanguages");
        const { document, contentChanges } = event;

        if (enabled && validLanguages?.includes(document.languageId)) {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document !== document) return;

            contentChanges.forEach((change) => {
                const startPosition = change.range.start;
                const line = document.lineAt(startPosition.line);

                if (line.text.includes("${") && startPosition.line !== lastReplacedLine) {
                    const updatedText = line.text.replace(/(['"])((?:(?!\1).)*)\$\{([^}]*)\}((?:(?!\1).)*)\1/g, '`$2${$3}$4`');
                    if (updatedText !== line.text) {
                        const range = new vscode.Range(startPosition.line, 0, startPosition.line, line.text.length);
                        editor.edit((editBuilder) => {
                            editBuilder.replace(range, updatedText);
                        });
                        lastReplacedLine = undefined; // Reset lastReplacedLine
                    }
                } else if (!line.text.includes("${") && line.text.includes("`") && startPosition.line !== lastReplacedLine) {
                    const restoredText = line.text.replace(/`([^`]*)`/g, '"$1"');
                    if (restoredText !== line.text) {
                        const range = new vscode.Range(startPosition.line, 0, startPosition.line, line.text.length);
                        editor.edit((editBuilder) => {
                            editBuilder.replace(range, restoredText);
                        });
                        lastReplacedLine = undefined;
                    }
                }
            });
        }
    });

    context.subscriptions.push(disposable);
}
