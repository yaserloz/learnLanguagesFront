import { ExternalLink } from "lucide-react";
import type { LearningNote } from "../types/learning";
import { formatDateTime, formatReviewDate } from "../utils/date";

type NoteViewerProps = {
  note: LearningNote | null;
  isReviewing: boolean;
  isDeleting: boolean;
  onReview: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function NoteViewer({
  note,
  isReviewing,
  isDeleting,
  onReview,
  onEdit,
  onDelete,
}: NoteViewerProps) {
  if (!note) {
    return (
      <section className="viewer empty-viewer">
        <p>Select a note or create a new one to begin studying.</p>
      </section>
    );
  }

  const forvoUrl = `https://forvo.com/search/${encodeURIComponent(note.title)}/`;
  const openForvoPopup = () => {
    window.open(
      forvoUrl,
      "forvo-pronunciation",
      "popup=yes,width=980,height=760,noopener,noreferrer",
    );
  };

  return (
    <section className="viewer" aria-labelledby="selected-note-title">
      <div className="viewer-header">
        <div className="viewer-title-block">
          <h1 id="selected-note-title">{note.title}</h1>
          <button
            className="forvo-link"
            title={`Open "${note.title}" on Forvo`}
            aria-label={`Open ${note.title} on Forvo`}
            type="button"
            onClick={openForvoPopup}
          >
            Forvo
            <ExternalLink aria-hidden="true" size={16} strokeWidth={2.3} />
          </button>
        </div>
        <div className="viewer-actions">
          <button type="button" onClick={onEdit}>
            Edit
          </button>
          <button
            className="danger"
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div
        className="note-body"
        dangerouslySetInnerHTML={{ __html: note.text_html }}
      />

      {note.tags.length > 0 ? (
        <div className="tag-row expanded" aria-label="Tags">
          {note.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <dl className="review-details">
        <div>
          <dt>Language</dt>
          <dd>{note.language_code.toUpperCase()}</dd>
        </div>
        <div>
          <dt>Reviews</dt>
          <dd>{note.review_count}</dd>
        </div>
        <div>
          <dt>Last reviewed</dt>
          <dd>{formatReviewDate(note.last_reviewed_at_utc)}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{formatDateTime(note.updated_at_utc)}</dd>
        </div>
      </dl>

      <button
        className="mark-reviewed"
        type="button"
        onClick={onReview}
        disabled={isReviewing}
      >
        {isReviewing ? "Marking..." : "Mark reviewed"}
      </button>
    </section>
  );
}
