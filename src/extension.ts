// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const RSPEC_DOCUMENT_SELECTOR = { language: 'ruby', scheme: 'file', pattern: '**/*_rspec.rb' };

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vs-rspec-outline" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vs-rspec-outline.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from vs-rspec-outline!');
	});

	context.subscriptions.push(
		vscode.languages.registerDocumentSymbolProvider(
			RSPEC_DOCUMENT_SELECTOR,
			new RspecDocumentSymbolProvider()
		)
	);
}

// this method is called when your extension is deactivated
export function deactivate() { }

class RspecDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
	provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[]> {
		const symbols: vscode.SymbolInformation[] = [];

		for (let i = 0; i < document.lineCount; i++) {
			let line = document.lineAt(i).text;
			const match = line.match(/^(\s*)(describe|context|it)\s+['"](.*)['"]/);
			if (match) {
				const indent = match[1];
				const containerName = match[2];
				const name = match[3];
				const location = new vscode.Location(document.uri, document.lineAt(i).range);
				const symbol = new vscode.SymbolInformation(name, vscode.SymbolKind.Method, containerName, location);
				symbols.push(symbol);
			}
		}
		return symbols;
	}
}
