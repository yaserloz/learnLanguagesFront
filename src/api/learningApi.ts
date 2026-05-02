import type {
  CreateLearningNoteRequest,
  LanguageSummary,
  LearningNote,
  NoteFilters,
  ReviewActivityDay,
  StatsSummary,
  UpdateLearningNoteRequest,
} from "../types/learning";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5144";

type ApiErrorBody = {
  title?: string;
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
};

type ArrayResponse<T> =
  | T[]
  | {
      activity?: T[];
      data?: T[];
      items?: T[];
      languages?: T[];
      notes?: T[];
      days?: T[];
    };

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildUrl(path: string, params?: URLSearchParams) {
  const url = new URL(path, API_BASE_URL);
  params?.forEach((value, key) => {
    if (value.trim()) {
      url.searchParams.set(key, value.trim());
    }
  });
  return url.toString();
}

async function readError(response: Response) {
  const fallback = `Request failed with ${response.status}`;

  try {
    const body = (await response.json()) as ApiErrorBody;
    const validationErrors = body.errors
      ? Object.values(body.errors).flat().join(" ")
      : "";

    return (
      validationErrors ||
      body.detail ||
      body.message ||
      body.title ||
      fallback
    );
  } catch {
    return fallback;
  }
}

async function fetchJson<T>(
  path: string,
  init?: RequestInit,
  params?: URLSearchParams,
): Promise<T> {
  let response: Response;

  try {
    const isFormData = init?.body instanceof FormData;
    response = await fetch(buildUrl(path, params), {
      ...init,
      headers: {
        ...(init?.body && !isFormData
          ? { "Content-Type": "application/json" }
          : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(
      `API is not reachable at ${API_BASE_URL}. Check that the backend is running.`,
      0,
    );
  }

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function unwrapArray<T>(
  response: ArrayResponse<T>,
  keys: Array<keyof Exclude<ArrayResponse<T>, T[]>>,
) {
  if (Array.isArray(response)) {
    return response;
  }

  for (const key of keys) {
    const value = response[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

export async function listNotes(filters: NoteFilters) {
  const params = new URLSearchParams();
  params.set("language_code", filters.languageCode);

  if (filters.search) {
    params.set("q", filters.search);
  }

  const response = await fetchJson<ArrayResponse<LearningNote>>(
    "/api/v1/notes",
    undefined,
    params,
  );

  return unwrapArray(response, ["notes", "items", "data"]);
}

export async function listLanguages() {
  const response =
    await fetchJson<ArrayResponse<LanguageSummary>>("/api/v1/languages");

  return unwrapArray(response, ["languages", "items", "data"]);
}

export async function createNote(payload: CreateLearningNoteRequest) {
  return fetchJson<LearningNote>("/api/v1/notes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateNote(
  id: string,
  payload: UpdateLearningNoteRequest,
) {
  return fetchJson<LearningNote>(`/api/v1/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function reviewNote(id: string) {
  return fetchJson<LearningNote>(`/api/v1/notes/${id}/review`, {
    method: "POST",
  });
}

export async function deleteNote(id: string) {
  return fetchJson<void>(`/api/v1/notes/${id}`, {
    method: "DELETE",
  });
}

export async function getStatsSummary() {
  return fetchJson<StatsSummary>("/api/v1/stats/summary");
}

export async function getReviewActivity(days = 30) {
  const params = new URLSearchParams();
  params.set("days", String(days));

  const response = await fetchJson<ArrayResponse<ReviewActivityDay>>(
    "/api/v1/stats/activity",
    undefined,
    params,
  );

  return unwrapArray(response, ["activity", "days", "items", "data"]);
}
