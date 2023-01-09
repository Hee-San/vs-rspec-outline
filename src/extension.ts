import * as vscode from 'vscode';

const RSPEC_DOCUMENT_SELECTOR = { language: 'ruby', scheme: 'file', pattern: "**/*_spec.rb" };

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerDocumentSymbolProvider(
			RSPEC_DOCUMENT_SELECTOR,
			new RspecDocumentSymbolProvider()
		)
	);
}

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
