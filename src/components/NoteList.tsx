import type { LearningNote } from "../types/learning";
import { formatReviewDate } from "../utils/date";

type NoteListProps = {
  notes: LearningNote[];
  selectedNoteId: string | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
};

export function NoteList({
  notes,
  selectedNoteId,
  isLoading,
  onSelect,
}: NoteListProps) {
  if (isLoading) {
    return <div className="empty-state">Loading review queue...</div>;
  }

  if (!notes.length) {
    return (
      <div className="empty-state">
        No notes match the current filters. Create one to start the queue.
      </div>
    );
  }

  return (
    <ul className="note-list" aria-label="Review queue">
      {notes.map((note) => (
        <li key={note.id}>
          <button
            className={note.id === selectedNoteId ? "note-row selected" : "note-row"}
            type="button"
            onClick={() => onSelect(note.id)}
          >
            <span className="note-row-main">
              <span className="note-title">{note.title}</span>
              <span className="note-meta">
                <span>{note.review_count} reviews</span>
                <span>{formatReviewDate(note.last_reviewed_at_utc)}</span>
              </span>
            </span>

            {note.tags.length > 0 ? (
              <span className="tag-row" aria-label="Tags">
                {note.tags.slice(0, 3).map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </span>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );
}
