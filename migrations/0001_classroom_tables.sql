-- migrations/0001_classroom_tables.sql
CREATE TABLE IF NOT EXISTS lesson_plans (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	date TEXT NOT NULL UNIQUE,
	title TEXT NOT NULL DEFAULT '',
	subject TEXT NOT NULL DEFAULT '',
	objectives TEXT NOT NULL DEFAULT '',
	lesson_details TEXT NOT NULL DEFAULT '',
	homework TEXT NOT NULL DEFAULT '',
	notes TEXT NOT NULL DEFAULT '',
	publication_status TEXT NOT NULL DEFAULT 'NotPublished' CHECK (publication_status IN ('Published', 'NotPublished')),
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lesson_plans_date ON lesson_plans(date);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_publication_status ON lesson_plans(publication_status);

CREATE TABLE IF NOT EXISTS calendar_entries (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	date TEXT NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL DEFAULT '',
	entry_type TEXT NOT NULL DEFAULT 'classroom' CHECK (
		entry_type IN ('classroom', 'homework', 'reminder', 'event', 'field-trip', 'assessment')
	),
	publication_status TEXT NOT NULL DEFAULT 'NotPublished' CHECK (publication_status IN ('Published', 'NotPublished')),
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calendar_entries_date ON calendar_entries(date);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_date_status ON calendar_entries(date, publication_status);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_publication_status ON calendar_entries(publication_status);

CREATE TABLE IF NOT EXISTS worksheets (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	description TEXT NOT NULL DEFAULT '',
	subject TEXT NOT NULL DEFAULT '',
	date TEXT,
	school_week INTEGER,
	ckla_unit TEXT NOT NULL DEFAULT '',
	r2_object_key TEXT NOT NULL UNIQUE,
	file_name TEXT NOT NULL,
	publication_status TEXT NOT NULL DEFAULT 'NotPublished' CHECK (publication_status IN ('Published', 'NotPublished')),
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_worksheets_date ON worksheets(date);
CREATE INDEX IF NOT EXISTS idx_worksheets_school_week ON worksheets(school_week);
CREATE INDEX IF NOT EXISTS idx_worksheets_publication_status ON worksheets(publication_status);

CREATE TABLE IF NOT EXISTS document_access_log (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	worksheet_id INTEGER NOT NULL,
	user_email TEXT NOT NULL,
	accessed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (worksheet_id) REFERENCES worksheets(id)
);

CREATE INDEX IF NOT EXISTS idx_document_access_log_worksheet_id ON document_access_log(worksheet_id);
CREATE INDEX IF NOT EXISTS idx_document_access_log_accessed_at ON document_access_log(accessed_at);
