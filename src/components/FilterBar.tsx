import type { LanguageSummary, NoteFilters, NoteKindFilter } from "../types/learning";

const kindOptions: Array<{ value: NoteKindFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "word", label: "Words" },
  { value: "phrase", label: "Phrases" },
  { value: "grammar", label: "Grammar" },
];

type FilterBarProps = {
  filters: NoteFilters;
  languages: LanguageSummary[];
  onChange: (filters: NoteFilters) => void;
  onCreate: () => void;
};

export function FilterBar({
  filters,
  languages,
  onChange,
  onCreate,
}: FilterBarProps) {
  const knownLanguages = languages.length
    ? languages
    : [{ language_code: filters.languageCode, note_count: 0 }];

  return (
    <section className="filter-bar" aria-label="Review filters">
      <div className="field compact">
        <label htmlFor="language">Language</label>
        <select
          id="language"
          value={filters.languageCode}
          onChange={(event) =>
            onChange({ ...filters, languageCode: event.target.value })
          }
        >
          {knownLanguages.map((language) => (
            <option
              key={language.language_code}
              value={language.language_code}
            >
              {language.language_code.toUpperCase()}
              {language.note_count ? ` (${language.note_count})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="kind-filter" role="group" aria-label="Note kind">
        {kindOptions.map((option) => (
          <button
            className={filters.kind === option.value ? "active" : ""}
            key={option.value}
            type="button"
            onClick={() => onChange({ ...filters, kind: option.value })}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="field search-field">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="search"
          placeholder="akkusativ, cafe, work"
          value={filters.search}
          onChange={(event) =>
            onChange({ ...filters, search: event.target.value })
          }
        />
      </div>

      <button className="primary-action" type="button" onClick={onCreate}>
        New note
      </button>
    </section>
  );
}
