// src/lib/db/classroom-db.ts
type ClassroomBindings = {
	runtime?: {
		env?: {
			CLASS_DB?: D1Database;
			WORKSHEETS_BUCKET?: R2Bucket;
		};
	};
	env?: {
		CLASS_DB?: D1Database;
		WORKSHEETS_BUCKET?: R2Bucket;
	};
};

export function getClassroomDb(locals: App.Locals | null | undefined) {
	const runtimeLocals = locals as ClassroomBindings | null | undefined;
	return runtimeLocals?.runtime?.env?.CLASS_DB ?? runtimeLocals?.env?.CLASS_DB ?? null;
}

export function getWorksheetsBucket(locals: App.Locals | null | undefined) {
	const runtimeLocals = locals as ClassroomBindings | null | undefined;
	return runtimeLocals?.runtime?.env?.WORKSHEETS_BUCKET ?? runtimeLocals?.env?.WORKSHEETS_BUCKET ?? null;
}

export function hasClassroomDb(locals: App.Locals | null | undefined) {
	return Boolean(getClassroomDb(locals));
}

export function createUnavailableDbMessage() {
	return 'CLASS_DB is not available in this environment.';
}
