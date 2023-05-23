
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Active fired')
    let disposable = vscode.workspace.onDidChangeTextDocument(event =>{
        const {document } = event
        const configuration = vscode.workspace.getConfiguration();
        const validLanguages = configuration.get<string[]>("template-literals-converter.validLanguages");
        const enabled = configuration.get('template-string-converter.enabled')
        const changes = event.contentChanges[0];

        const  editor = vscode.window.activeTextEditor;
        if(enabled && validLanguages?.includes(document.languageId)){
            // let selections: vscode.Selection[] = [];

            try {
                if (!editor) {
                    vscode.window.showInformationMessage('No active text editor.');
                    return;
                }
                
                  let selections:any = editor.selections
                  for(const selection of selections){
                    const lineNumber = selection.start.line;
                    let range = new vscode.Range(selection.start, selection.end);
                    const currentChar = changes.range.start.character;
                    const selectedText = event.document.lineAt(lineNumber).text;
                    // console.log(selectedText)
                    if (selectedText.includes('${')) {
                    const template = selectedText.substring(2, selectedText.length);
                    const convertedString = template.replace(/["']/g,"`");
                    editor.edit((editBuilder) => {
                        editBuilder.replace(range, convertedString);
                    });
                    }
                  }
         
            } catch {
                console.log('error')
            }
        }else{

        }
      
        // const { document } = event
        // console.log(document.languageId)
    })
    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
