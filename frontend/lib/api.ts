import type {
  Book,
  BookRecommendation,
  RecommendRequest,
  RecommendResponse,
  ProfileRecommendRequest,
  ProfileResponse,
  ChatRequest,
  ChatResponse,
  AnalyticsData,
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string; models_loaded: boolean }>("/api/health"),

  books: (q = "", limit = 20, offset = 0) =>
    request<{ books: Book[]; total: number }>(
      `/api/books?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`
    ),

  book: (isbn: string) =>
    request<{ book: Book; recommendations: BookRecommendation[] }>(
      `/api/books/${isbn}`
    ),

  recommend: (body: RecommendRequest) =>
    request<RecommendResponse>("/api/recommend", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  profileRecommend: (body: ProfileRecommendRequest) =>
    request<ProfileResponse>("/api/profile/recommend", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  analytics: () => request<AnalyticsData>("/api/analytics"),

  chat: (body: ChatRequest) =>
    request<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
