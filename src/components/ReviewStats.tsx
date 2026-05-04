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
  const activityDays = Array.isArray(activity) ? activity : [];
  const chartData = activityDays
    .slice(-12)
    .map((day, index) => ({
      label: formatActivityLabel(day.date ?? day.day ?? `Day ${index + 1}`),
      value: Math.max(0, day.review_count),
    }));
  const neverReviewed =
    summary?.never_reviewed ??
    notes.filter((note) => !note.last_reviewed_at_utc).length;
  const totalReviews =
    summary?.total_review_count ??
    notes.reduce((sum, note) => sum + note.review_count, 0);
  const totalNotes = summary?.total_notes ?? notes.length;
  const trackedEvents = summary?.tracked_review_events ?? 0;
  const latestActivity = chartData.at(-1)?.value ?? 0;
  const peakActivity = Math.max(1, ...chartData.map((day) => day.value));
  const chart = buildLineChart(chartData, peakActivity);

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

      {chartData.length > 0 ? (
        <div className="activity-card" aria-label="Daily review activity">
          <div className="activity-glyph" aria-hidden="true">
            <span style={{ height: `${Math.max(10, (neverReviewed / Math.max(1, totalNotes)) * 62)}px` }} />
            <span style={{ height: `${Math.max(22, (latestActivity / peakActivity) * 76)}px` }} />
            <span style={{ height: `${Math.max(10, (trackedEvents / Math.max(1, totalReviews)) * 62)}px` }} />
          </div>

          <div className="line-chart">
            <div className="chart-heading">
              <h2>Review Activity</h2>
              <span>Last {chartData.length} days</span>
            </div>

            <svg viewBox="0 0 640 220" role="img" aria-label="Review activity line chart">
              {[0, 1, 2, 3, 4].map((line) => {
                const y = 32 + line * 36;

                return (
                  <line
                    className="chart-grid-line"
                    key={line}
                    x1="42"
                    x2="616"
                    y1={y}
                    y2={y}
                  />
                );
              })}

              <polyline className="chart-line" points={chart.points} />

              {chart.pointsWithMeta.map((point, index) => (
                <g key={`${point.label}-${index}`}>
                  <circle className="chart-point" cx={point.x} cy={point.y} r="4" />
                  <text className="chart-value" x={point.x} y={point.y - 10}>
                    {point.value}
                  </text>
                  {(index === 0 ||
                    index === chart.pointsWithMeta.length - 1 ||
                    index % 3 === 0) && (
                    <text className="chart-label" x={point.x} y="204">
                      {point.label}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function buildLineChart(
  data: Array<{ label: string; value: number }>,
  maxValue: number,
) {
  const width = 574;
  const left = 42;
  const top = 28;
  const height = 144;
  const step = data.length > 1 ? width / (data.length - 1) : 0;

  const pointsWithMeta = data.map((item, index) => {
    const x = data.length > 1 ? left + index * step : left + width / 2;
    const y = top + height - (item.value / maxValue) * height;

    return {
      ...item,
      x,
      y,
    };
  });

  return {
    points: pointsWithMeta.map((point) => `${point.x},${point.y}`).join(" "),
    pointsWithMeta,
  };
}

function formatActivityLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}
