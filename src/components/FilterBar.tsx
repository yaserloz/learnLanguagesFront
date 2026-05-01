import type { LanguageSummary, NoteFilters } from "../types/learning";

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
