import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createNote,
  deleteNote,
  listLanguages,
  listNotes,
  reviewNote,
  updateNote,
} from "../api/learningApi";
import { FilterBar } from "../components/FilterBar";
import { NoteForm } from "../components/NoteForm";
import { NoteList } from "../components/NoteList";
import { NoteViewer } from "../components/NoteViewer";
import { ReviewStats } from "../components/ReviewStats";
import type {
  CreateLearningNoteRequest,
  LanguageSummary,
  LearningNote,
  NoteFilters,
} from "../types/learning";

type EditorMode = "closed" | "create" | "edit";

const initialFilters: NoteFilters = {
  languageCode: "de",
  search: "",
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function ReviewPage() {
  const [filters, setFilters] = useState<NoteFilters>(initialFilters);
  const [notes, setNotes] = useState<LearningNote[]>([]);
  const [languages, setLanguages] = useState<LanguageSummary[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>("closed");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reviewingNoteId, setReviewingNoteId] = useState<string | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );

  const loadNotes = useCallback(
    async (
      preferredNoteId?: string | null,
      requestedFilters: NoteFilters = filters,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const nextNotes = await listNotes(requestedFilters);
        setNotes(nextNotes);
        setSelectedNoteId((currentId) => {
          if (
            preferredNoteId &&
            nextNotes.some((note) => note.id === preferredNoteId)
          ) {
            return preferredNoteId;
          }

          if (
            preferredNoteId === null ||
            !currentId ||
            !nextNotes.some((note) => note.id === currentId)
          ) {
            return nextNotes[0]?.id ?? null;
          }

          return currentId;
        });
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    const delay = filters.search.trim() ? 250 : 0;
    const timeoutId = window.setTimeout(() => {
      void loadNotes();
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [filters, loadNotes]);

  useEffect(() => {
    async function loadLanguageSummaries() {
      try {
        const summaries = await listLanguages();
        setLanguages(summaries);
      } catch {
        setLanguages([]);
      }
    }

    void loadLanguageSummaries();
  }, []);

  function openCreateForm() {
    setSaveError(null);
    setEditorMode("create");
  }

  function openEditForm() {
    setSaveError(null);
    setEditorMode("edit");
  }

  async function handleSave(payload: CreateLearningNoteRequest) {
    setIsSaving(true);
    setSaveError(null);

    try {
      const savedNote =
        editorMode === "edit" && selectedNote
          ? await updateNote(selectedNote.id, payload)
          : await createNote(payload);

      const nextFilters: NoteFilters = {
        ...filters,
        languageCode: savedNote.language_code,
      };

      setEditorMode("closed");
      setFilters(nextFilters);
      await loadNotes(savedNote.id, nextFilters);

      try {
        setLanguages(await listLanguages());
      } catch {
        setLanguages([]);
      }
    } catch (saveFailed) {
      setSaveError(getErrorMessage(saveFailed));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReview() {
    if (!selectedNote) {
      return;
    }

    const nextQueuedNote =
      notes.find((note) => note.id !== selectedNote.id)?.id ?? null;

    setReviewingNoteId(selectedNote.id);
    setError(null);

    try {
      await reviewNote(selectedNote.id);
      await loadNotes(nextQueuedNote);
    } catch (reviewFailed) {
      setError(getErrorMessage(reviewFailed));
    } finally {
      setReviewingNoteId(null);
    }
  }

  async function handleDelete() {
    if (!selectedNote) {
      return;
    }

    const nextQueuedNote =
      notes.find((note) => note.id !== selectedNote.id)?.id ?? null;

    setDeletingNoteId(selectedNote.id);
    setError(null);

    try {
      await deleteNote(selectedNote.id);
      setEditorMode("closed");
      await loadNotes(nextQueuedNote);

      try {
        setLanguages(await listLanguages());
      } catch {
        setLanguages([]);
      }
    } catch (deleteFailed) {
      setError(getErrorMessage(deleteFailed));
    } finally {
      setDeletingNoteId(null);
    }
  }

  const showEditor = editorMode !== "closed";

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Daily review</p>
          <h1>Learn Languages</h1>
        </div>
        <p className="api-note">Queue order comes from the API.</p>
      </header>

      <FilterBar
        filters={filters}
        languages={languages}
        onChange={setFilters}
        onCreate={openCreateForm}
      />

      {error ? (
        <div className="error-box app-error" role="alert">
          {error}
        </div>
      ) : null}

      <ReviewStats notes={notes} languages={languages} />

      <div className="workspace">
        <aside className="queue-panel" aria-label="Notes">
          <div className="panel-heading">
            <h2>Review queue</h2>
            <span>{notes.length} notes</span>
          </div>
          <NoteList
            notes={notes}
            selectedNoteId={selectedNoteId}
            isLoading={isLoading}
            onSelect={setSelectedNoteId}
          />
        </aside>

        <div className="study-panel">
          {showEditor ? (
            <NoteForm
              note={editorMode === "edit" ? selectedNote : null}
              defaultLanguageCode={filters.languageCode}
              isSaving={isSaving}
              saveError={saveError}
              onSave={handleSave}
              onCancel={() => setEditorMode("closed")}
            />
          ) : (
            <NoteViewer
              note={selectedNote}
              isReviewing={reviewingNoteId === selectedNote?.id}
              isDeleting={deletingNoteId === selectedNote?.id}
              onReview={handleReview}
              onEdit={openEditForm}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </main>
  );
}
