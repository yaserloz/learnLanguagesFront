export type LearningNoteKind = "word" | "phrase" | "grammar";

export type LearningNote = {
  id: string;
  language_code: string;
  kind: LearningNoteKind;
  title: string;
  text_html: string;
  tags: string[];
  review_count: number;
  last_reviewed_at_utc: string | null;
  created_at_utc: string;
  updated_at_utc: string;
};

export type CreateLearningNoteRequest = {
  language_code: string;
  kind: LearningNoteKind;
  title: string;
  text_html: string;
  tags?: string[];
};

export type UpdateLearningNoteRequest = Partial<CreateLearningNoteRequest>;

export type LanguageSummary = {
  language_code: string;
  note_count: number;
};

export type NoteKindFilter = "all" | LearningNoteKind;

export type NoteFilters = {
  languageCode: string;
  kind: NoteKindFilter;
  search: string;
};
