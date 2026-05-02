import type {
  LanguageSummary,
  LearningNote,
  ReviewActivityDay,
  StatsSummary,
} from "../types/learning";

type ReviewStatsProps = {
  notes: LearningNote[];
  languages: LanguageSummary[];
  summary: StatsSummary | null;
  activity: ReviewActivityDay[];
};

export function ReviewStats({
  notes,
  languages,
  summary,
  activity,
}: ReviewStatsProps) {
  const neverReviewed =
    summary?.never_reviewed ??
    notes.filter((note) => !note.last_reviewed_at_utc).length;
  const totalReviews =
    summary?.total_review_count ??
    notes.reduce((sum, note) => sum + note.review_count, 0);
  const totalNotes = summary?.total_notes ?? notes.length;
  const trackedEvents = summary?.tracked_review_events ?? 0;
  const maxActivity = Math.max(
    1,
    ...activity.map((day) => Math.max(0, day.review_count)),
  );

  return (
    <section className="stats-panel" aria-label="Review stats">
      <div className="stats-strip">
        <div>
          <span>{totalNotes}</span>
          <small>Total notes</small>
        </div>
        <div>
          <span>{neverReviewed}</span>
          <small>Never reviewed</small>
        </div>
        <div>
          <span>{totalReviews}</span>
          <small>Total reviews</small>
        </div>
        <div>
          <span>{trackedEvents}</span>
          <small>Tracked events</small>
        </div>
        <div>
          <span>{languages.length || 1}</span>
          <small>Languages</small>
        </div>
      </div>

      {activity.length > 0 ? (
        <div className="activity-chart" aria-label="Daily review activity">
          {activity.map((day, index) => {
            const label = day.date ?? day.day ?? `Day ${index + 1}`;
            const height = Math.max(8, (day.review_count / maxActivity) * 52);

            return (
              <span
                key={`${label}-${index}`}
                title={`${label}: ${day.review_count} reviews`}
                style={{ height }}
              />
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
