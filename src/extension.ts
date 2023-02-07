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

export class RspecDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
	provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): Thenable<vscode.DocumentSymbol[]> {
		return new Promise((resolve, reject) => {
			const symbolAndIndents: [vscode.DocumentSymbol, number][] = this.listSymbols(document.getText().split(/\r\n|\n/));
			const outline = this.getSymbolOutline(symbolAndIndents);
			resolve(outline);
		});
	}

	private listSymbols(document: string[]) {
		const symbolAndIndents: [vscode.DocumentSymbol, number][] = [];

		for (let i = 0; i < document.length; i++) {
			const line = document[i];
			const match = line.match(/^(\s*)(describe|context|it|specify|example) (?:['"](.*)['"] do|\{ (.*) \})$/);

			if (!match) { continue; }

			const indent = match[1].length;
			const type = match[2];
			const name = type + ' ' + (match[3] || match[4]);
			const kind = this.getKind(type);
			const range = new vscode.Range(i, indent, i, line.length);
			const symbol = new vscode.DocumentSymbol(name, '', kind, range, range);

			symbolAndIndents.push([symbol, indent]);
		}
		return symbolAndIndents;
	}

	private getSymbolOutline(symbolAndIndents: [vscode.DocumentSymbol, number][]) {
		const dummyRootSymbol = new vscode.DocumentSymbol('root', '', vscode.SymbolKind.File, new vscode.Range(0, 0, 0, 0), new vscode.Range(0, 0, 0, 0));
		const symbolPath: [vscode.DocumentSymbol, number][] = [[dummyRootSymbol, -1]];

		for (let i = 0; i < symbolAndIndents.length; i++) {
			const [symbol, indent] = symbolAndIndents[i];

			while (symbolPath[symbolPath.length - 1][1] >= indent) {
				symbolPath.pop();
			}

			symbolPath[symbolPath.length - 1][0].children.push(symbol);
			symbolPath.push([symbol, indent]);
		}

		return dummyRootSymbol.children;
	}

	private getKind(type: string) {
		switch (type) {
			case 'describe':
				return vscode.SymbolKind.Namespace;
			case 'context':
				return vscode.SymbolKind.Class;
			case 'it':
			case 'specify':
			case 'example':
				return vscode.SymbolKind.Method;
			default:
				return vscode.SymbolKind.Function;
		}
	}
}
