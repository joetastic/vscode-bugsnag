export interface BugsnagBug {
	severity: string,
	assigned_collaborator_id: string,
	id: string,
	project_id: string,
	url: string,
	project_url: string,
	error_class: string,
	message: string,
	context: string,
	original_severity: string,
	overridden_severity: string,
	events: number,
	events_url: string,
	unthrottled_occurrence_count: number,
	users: number,
	first_seen: string,  // iso
	last_seen: string, // iso
	first_seen_unfiltered: string, // iso
	reopen_rules: {
		reopen_if: string,
		seconds: number,
		occurrences: number,
		hours: number,
		occurrence_threshold: number,
		additional_occurrences: number
	},
	status: string,
	created_issue: {
		id: string,
		key: string,
		number: number,
		type: string,
		url: string
	},
	comment_count: number,
	missing_dsyms: any[], // FIXME
	release_stages: any[], // FIXME
	grouping_reason: string,
	grouping_fields?: {
		lineNumber?: number,
		file?: string,
		errorClass?: string
	}
}

export type BugsnagResponse = BugsnagBug[] | {errors: string[]}