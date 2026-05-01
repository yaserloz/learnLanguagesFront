import { FormEvent, useEffect, useState } from "react";
import type {
  CreateLearningNoteRequest,
  LearningNote,
  LearningNoteKind,
} from "../types/learning";
import { RichTextEditor } from "./RichTextEditor";

type NoteFormProps = {
  note: LearningNote | null;
  defaultLanguageCode: string;
  isSaving: boolean;
  saveError: string | null;
  onSave: (payload: CreateLearningNoteRequest) => Promise<void>;
  onCancel: () => void;
};

type FormState = CreateLearningNoteRequest & {
  tagsText: string;
};

const emptyForm = (languageCode: string): FormState => ({
  language_code: languageCode,
  kind: "word",
  title: "",
  text_html: "",
  tags: [],
  tagsText: "",
});

export function NoteForm({
  note,
  defaultLanguageCode,
  isSaving,
  saveError,
  onSave,
  onCancel,
}: NoteFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    note
      ? {
          language_code: note.language_code,
          kind: note.kind,
          title: note.title,
          text_html: note.text_html,
          tags: note.tags,
          tagsText: note.tags.join(", "),
        }
      : emptyForm(defaultLanguageCode),
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setForm(
      note
        ? {
            language_code: note.language_code,
            kind: note.kind,
            title: note.title,
            text_html: note.text_html,
            tags: note.tags,
            tagsText: note.tags.join(", "),
          }
        : emptyForm(defaultLanguageCode),
    );
    setValidationError(null);
  }, [defaultLanguageCode, note]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const payload: CreateLearningNoteRequest = {
      language_code: form.language_code.trim().toLowerCase(),
      kind: form.kind,
      title: form.title.trim(),
      text_html: form.text_html.trim(),
      tags: form.tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    if (!payload.language_code || !payload.kind || !payload.title || !payload.text_html) {
      setValidationError("Language, kind, title, and note body are required.");
      return;
    }

    setValidationError(null);
    await onSave(payload);
  }

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <div>
          <span className="eyebrow">{note ? "Edit note" : "Create note"}</span>
          <h2>{note ? note.title : "New study note"}</h2>
        </div>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {(validationError || saveError) && (
        <div className="error-box" role="alert">
          {validationError || saveError}
        </div>
      )}

      <div className="form-grid">
        <label className="field">
          Language code
          <input
            value={form.language_code}
            maxLength={8}
            placeholder="de"
            onChange={(event) =>
              setForm({ ...form, language_code: event.target.value })
            }
          />
        </label>

        <label className="field">
          Kind
          <select
            value={form.kind}
            onChange={(event) =>
              setForm({
                ...form,
                kind: event.target.value as LearningNoteKind,
              })
            }
          >
            <option value="word">Word</option>
            <option value="phrase">Phrase</option>
            <option value="grammar">Grammar</option>
          </select>
        </label>
      </div>

      <label className="field">
        Title
        <input
          value={form.title}
          placeholder="der Termin"
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
      </label>

      <div className="field">
        <label htmlFor="text-html">Note body</label>
        <RichTextEditor
          id="text-html"
          value={form.text_html}
          onChange={(text_html) => setForm({ ...form, text_html })}
        />
      </div>

      <label className="field">
        Tags
        <input
          value={form.tagsText}
          placeholder="work, noun"
          onChange={(event) =>
            setForm({ ...form, tagsText: event.target.value })
          }
        />
      </label>

      <button className="primary-action save-button" type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : note ? "Save changes" : "Create note"}
      </button>
    </form>
  );
}
