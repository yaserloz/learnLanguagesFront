export type LanguageCode = "de" | "fr" | "en";

export type LearningNote = {
  id: string;
  language_code: LanguageCode;
  title: string;
  text_html: string;
  tags: string[];
  review_count: number;
  last_reviewed_at_utc: string | null;
  created_at_utc: string;
  updated_at_utc: string;
};

export type CreateLearningNoteRequest = {
  language_code: LanguageCode;
  title: string;
  text_html: string;
  tags?: string[];
};

export type UpdateLearningNoteRequest = Partial<CreateLearningNoteRequest>;

export type LanguageSummary = {
  language_code: LanguageCode;
  note_count: number;
};

export type NoteFilters = {
  languageCode: LanguageCode;
  search: string;
};

export type StatsSummary = {
  total_notes: number;
  total_review_count: number;
  tracked_review_events: number;
  never_reviewed: number;
  reviewed_notes: number;
  average_review_count: number;
};

export type ReviewActivityDay = {
  date?: string;
  day?: string;
  review_count: number;
};
