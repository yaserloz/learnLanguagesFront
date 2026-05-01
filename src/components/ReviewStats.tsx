import type { LanguageSummary, LearningNote } from "../types/learning";

type ReviewStatsProps = {
  notes: LearningNote[];
  languages: LanguageSummary[];
};

export function ReviewStats({ notes, languages }: ReviewStatsProps) {
  const neverReviewed = notes.filter((note) => !note.last_reviewed_at_utc).length;
  const totalReviews = notes.reduce((sum, note) => sum + note.review_count, 0);

  return (
    <section className="stats-strip" aria-label="Review stats">
      <div>
        <span>{notes.length}</span>
        <small>In queue</small>
      </div>
      <div>
        <span>{neverReviewed}</span>
        <small>New</small>
      </div>
      <div>
        <span>{totalReviews}</span>
        <small>Reviews</small>
      </div>
      <div>
        <span>{languages.length || 1}</span>
        <small>Languages</small>
      </div>
    </section>
  );
}
