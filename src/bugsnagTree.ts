import * as https from 'https';
import * as path from 'path';
import * as vscode from 'vscode';
import { BugsnagBug, BugsnagResponse } from './bugsnag';


export class BugsnagNodeProvider implements vscode.TreeDataProvider<Bug | BugChild> {
	// tslint:disable-next-line:variable-name
	private _onDidChangeTreeData: vscode.EventEmitter<Bug | undefined> = new vscode.EventEmitter<Bug | undefined>();
	// tslint:disable-next-line:member-ordering
	public readonly onDidChangeTreeData: vscode.Event<Bug | undefined> = this._onDidChangeTreeData.event;
	private authorizationToken?: string;
	private projectId?: string;

	constructor(private workspaceRoot: string) {
		this.authorizationToken = vscode.workspace.getConfiguration('bugsnag').get('authorizationToken');
		this.projectId = vscode.workspace.getConfiguration('bugsnag').get('projectId');
		vscode.workspace.onDidChangeConfiguration(() => {
			this.authorizationToken = vscode.workspace.getConfiguration('bugsnag').get('authorizationToken');
			this.projectId = vscode.workspace.getConfiguration('bugsnag').get('projectId');
		});
	}

	public refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	public getTreeItem(element: Bug): vscode.TreeItem {
		return element;
	}

	public getChildren(element?: Bug | BugChild): Thenable<vscode.TreeItem[]> {
		if (element instanceof Bug) {
			if (element.bugsnagBug.grouping_fields !== undefined && element.bugsnagBug.grouping_fields.file !== undefined) {
				return new Promise((resolve, reject) => {
					vscode.workspace.findFiles(element.bugsnagBug.grouping_fields.file, null, 1).then((uri) => {
						if (uri.length === 1) {
							resolve([new BugChild(element.bugsnagBug.message, uri)])
						}
					})
				})
			} else {
				return Promise.resolve([new BugChild(element.bugsnagBug.message)])
			}
		} else if (this.authorizationToken === undefined) {
			vscode.window.showInformationMessage("Please set authorization token")
			return Promise.resolve([]);
		} else if (this.projectId === undefined) {
			vscode.window.showInformationMessage("Please set project id")
			return Promise.resolve([]);
		} else {
			return new Promise((resolve, reject) => {
				https.get(`https://api.bugsnag.com/projects/${this.projectId}/errors`, {
					headers: { Authorization: `token ${this.authorizationToken}` }
				}, (response) => {
					let data = '';

					// A chunk of data has been recieved.
					response.on('data', (chunk) => {
						data += chunk;
					});

					// The whole response has been received. Print out the result.
					response.on('end', () => {
						const result: BugsnagResponse = JSON.parse(data);
						if ("errors" in result) {
							reject(result.errors.join(","))
						} else {
							resolve(result.map((bugResponse) => {
								return new Bug(bugResponse)
							}))
						}
					});
				}).on('error', (err) => {
					vscode.window.showInformationMessage('Workspace has no package.json');
					reject(err);
				})
			})
		}
	}
}

export class Bug extends vscode.TreeItem {
	get tooltip(): string {
		return `${this.label}`;
	}

	public iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	};

	public contextValue = 'dependency';

	constructor(public readonly bugsnagBug: BugsnagBug) {
		super(`${bugsnagBug.error_class}: ${bugsnagBug.context}`, vscode.TreeItemCollapsibleState.Collapsed);
	}
}


class BugChild extends vscode.TreeItem {
	constructor(message: string, uri?: vscode.Uri[]) {
		super(message, vscode.TreeItemCollapsibleState.None)
		if (uri !== undefined) {
			this.command = {
				command: "vscode.open",
				title: "",
				arguments: uri
			}
		}
	}
}
