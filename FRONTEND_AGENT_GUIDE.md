# Frontend Agent Guide: Learn Languages

Build a React frontend for a personal language-learning app backed by `LanguageLearning.Api`.

The first target language is German. The app must support exactly these language codes:

- `de`
- `fr`
- `en`

## Backend

Default local API:

```text
http://localhost:5144
```

Production API:

```text
https://langapi.angebeauty.net
```

Swagger:

```text
http://localhost:5144/swagger
```

The backend stores notes in SQLite. The frontend should not assume a remote database or direct DB access. All reads and writes go through the HTTP API.

## Product Goal

Create a small study app where the user can save and review language-learning notes.

Each note has:

- language code: `de`, `fr`, or `en`
- title
- HTML note body as `text_html`
- tags
- review count
- last reviewed date

The main workflow is review-based:

1. show notes from least reviewed to most reviewed
2. user reviews a note
3. user marks it as reviewed
4. backend increments `review_count`
5. the note naturally moves behind less-reviewed notes

## Design Direction

Make the first screen the actual study experience, not a landing page.

The UI should feel:

- focused
- calm
- fast to use
- useful for daily review
- mobile-friendly, but also comfortable on desktop

Avoid:

- marketing hero sections
- decorative dashboards
- large empty cards
- complex onboarding
- unnecessary animations

Use a practical layout:

- left/sidebar or top controls for language filters
- main review queue
- note editor panel or route
- clear `Mark Reviewed` action

## Recommended Stack

Use:

- React
- TypeScript
- Vite
- plain CSS, CSS modules, or a small existing styling setup if already present

Avoid adding heavy state libraries unless the app already uses them.

Suggested commands if starting from empty folder:

```powershell
npm create vite@latest . -- --template react-ts
npm install
npm run dev
```

## API Contract

### Note Shape

```ts
type LearningNote = {
  id: string;
  language_code: "de" | "fr" | "en";
  title: string;
  text_html: string;
  tags: string[];
  review_count: number;
  last_reviewed_at_utc: string | null;
  created_at_utc: string;
  updated_at_utc: string;
};
```

### Create Request

```ts
type CreateLearningNoteRequest = {
  language_code: "de" | "fr" | "en";
  title: string;
  text_html: string;
  tags?: string[];
};
```

### Update Request

```ts
type UpdateLearningNoteRequest = {
  language_code?: "de" | "fr" | "en";
  title?: string;
  text_html?: string;
  tags?: string[];
};
```

## Endpoints

Use these endpoints:

```text
GET    /api/v1/notes
GET    /api/v1/notes?language_code=de
GET    /api/v1/notes?q=akkusativ
GET    /api/v1/notes/{id}
POST   /api/v1/notes
POST   /api/v1/notes/import
PUT    /api/v1/notes/{id}
POST   /api/v1/notes/{id}/review
DELETE /api/v1/notes/{id}
GET    /api/v1/languages
```

Important:

- `GET /api/v1/notes` already returns notes ordered by review priority.
- Do not re-sort reviewed notes differently in the frontend.
- After `POST /api/v1/notes/{id}/review`, refetch the list or update local state and resort by the same rules.

Backend sorting rule:

```text
review_count ASC,
last_reviewed_at_utc ASC,
created_at_utc ASC
```

## Screens

### 1. Review Queue

This should be the default screen.

Show:

- current language selector
- search input
- list of notes ordered by review priority
- selected/current note content
- `Mark Reviewed` button

Each note list item should show:

- title
- tags
- review count
- last reviewed date or `Never reviewed`

### 2. Create/Edit Note

Support creating and editing notes.

Fields:

- language code
- title
- text HTML
- tags

For the first version, a plain textarea for `text_html` is enough. A rich text editor can come later.

Validation:

- language code required
- language code must be `de`, `fr`, or `en`
- title required
- text HTML required

### 3. Languages

A small language summary view is useful but not required as a separate page.

Use:

```text
GET /api/v1/languages
```

Example response shape:

```ts
type LanguageSummary = {
  language_code: string;
  note_count: number;
};
```

## Suggested Component Structure

Keep it small:

```text
src/
  api/
    learningApi.ts
  components/
    NoteList.tsx
    NoteViewer.tsx
    NoteForm.tsx
    FilterBar.tsx
    ReviewStats.tsx
  pages/
    ReviewPage.tsx
  types/
    learning.ts
  App.tsx
```

## Suggested State

```ts
type NoteFilters = {
  languageCode: string;
  search: string;
};

type ReviewPageState = {
  notes: LearningNote[];
  selectedNoteId: string | null;
  filters: NoteFilters;
  isLoading: boolean;
  error: string | null;
};
```

## API Helper Rules

Create one API client module. Do not scatter `fetch` calls across components.

Use a configurable base URL:

```ts
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5144";
```

Expected local `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5144
```

Expected production environment value:

```env
VITE_API_BASE_URL=https://langapi.angebeauty.net
```

Do not hardcode localhost into production builds. Production frontend deployments must use `https://langapi.angebeauty.net` as the API base URL.

When sending JSON:

```ts
headers: {
  "Content-Type": "application/json"
}
```

Use UTF-8 normally. The app must handle German characters such as:

```text
ä ö ü ß Ä Ö Ü
```

## Review Behavior

When the user clicks `Mark Reviewed`:

1. disable the button while request is in progress
2. call `POST /api/v1/notes/{id}/review`
3. update the returned note in local state
4. refetch notes or move to the next least-reviewed note
5. keep the UI focused on continuing study

Do not ask for confirmation before marking reviewed. This should be a fast daily action.

## JSON Import

The frontend may add an import action that uploads a `.json` file through multipart form data:

```text
POST /api/v1/notes/import
```

Form field:

```text
file
```

Accepted raw array shape:

```json
[
  {
    "language_code": "de",
    "title": "der Termin",
    "text_html": "<p>appointment</p>",
    "tags": ["work", "noun"]
  }
]
```

Accepted object shape:

```json
{
  "notes": [
    {
      "language_code": "de",
      "title": "Ich hätte gern einen Kaffee.",
      "text_html": "<p>I would like a coffee.</p>",
      "tags": ["restaurant", "polite"]
    }
  ]
}
```

Frontend behavior:

1. only allow `.json` file selection
2. send `FormData` with `file`
3. show imported count from `imported_count`
4. refetch the note list after successful import
5. if import fails, show the backend error and do not clear the selected file automatically

## Initial German Seed Examples

The frontend may provide sample placeholders, but it should not hardcode seed data into runtime state.

Good test notes:

```json
{
  "language_code": "de",
  "title": "der Termin",
  "text_html": "<p>appointment</p>",
  "tags": ["work", "noun"]
}
```

```json
{
  "language_code": "de",
  "title": "Ich hätte gern einen Kaffee.",
  "text_html": "<p>I would like a coffee.</p>",
  "tags": ["restaurant", "polite"]
}
```

```json
{
  "language_code": "de",
  "title": "Akkusativ after für",
  "text_html": "<p>The preposition <strong>für</strong> always takes accusative.</p>",
  "tags": ["grammar", "akkusativ"]
}
```

## Error Handling

Show clear inline errors:

- API not reachable
- validation failed
- note not found
- save failed

Keep user-entered form data if save fails.

## First Version Acceptance Criteria

The first version is done when:

- user can list notes
- user can filter by language
- user can search notes
- user can create a note
- user can edit a note
- user can delete a note
- user can mark a note as reviewed
- reviewed notes move behind less-reviewed notes
- UI works on mobile and desktop
- API base URL is configurable with `VITE_API_BASE_URL`

## Backend Run Command

From the API repo:

```powershell
dotnet run --project .\LanguageLearning.Api\LanguageLearning.Api.csproj --urls http://localhost:5144
```

Or with Docker:

```powershell
docker compose -f .\LanguageLearning.Api\docker-compose.local.yml up -d --build
```
