'use strict';

import * as vscode from 'vscode';
import { BugsnagNodeProvider } from "./bugsnagTree"


export function activate(context: vscode.ExtensionContext) {

	// Samples of `window.registerTreeDataProvider`
	const bugsnagBugsProvider = new BugsnagNodeProvider(vscode.workspace.rootPath);
	vscode.window.registerTreeDataProvider('bugsnagBugs', bugsnagBugsProvider);
	vscode.commands.registerCommand('bugsnagBugs.refreshEntry', () => bugsnagBugsProvider.refresh());
}
