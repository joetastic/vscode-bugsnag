'use strict';

import * as vscode from 'vscode';
import { BugsnagNodeProvider } from "./bugsnagTree"


export function activate(context: vscode.ExtensionContext) {

	// Samples of `window.registerTreeDataProvider`
	const bugsnagBugsProvider = new BugsnagNodeProvider(vscode.workspace.rootPath);
	vscode.window.registerTreeDataProvider('bugsnagBugs', bugsnagBugsProvider);
	vscode.commands.registerCommand('bugsnagBugs.gotoLine', async (file: vscode.Uri, line: number) => {
		await vscode.commands.executeCommand('vscode.open', file);
		// FIXME: there must be a better way to do this.
		const editor = vscode.window.activeTextEditor;
		const position = editor.selection.active;
		const newPosition = position.with(line, 0);
		const newSelection = new vscode.Selection(newPosition, newPosition);
		editor.selection = newSelection;
	})
	vscode.commands.registerCommand('bugsnagBugs.refreshEntry', () => bugsnagBugsProvider.refresh());
}
