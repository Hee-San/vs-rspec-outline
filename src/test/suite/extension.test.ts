import * as assert from 'assert';
import * as vscode from 'vscode';
import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('listSymbols', () => {
		const extension = new myExtension.RspecDocumentSymbolProvider();
		const document = [
			"describe 'foo' do",
			"  context 'bar' do",
			"    it 'baz' do # comment",
			"    	some code",
			"    end",
			"    it { is_expected.to be_valid }",
			"  end",
			"end",
		];
		const symbolAndIndents = extension["listSymbols"](document);
		assert.strictEqual(symbolAndIndents.length, 4);
		assert.strictEqual(symbolAndIndents[0][0].name, 'describe foo');
		assert.strictEqual(symbolAndIndents[1][0].name, 'context bar');
		assert.strictEqual(symbolAndIndents[2][0].name, 'it baz');
		assert.strictEqual(symbolAndIndents[3][0].name, 'it is_expected.to be_valid');
	});
}
);
