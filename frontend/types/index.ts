export interface Book {
  isbn: string;
  title: string;
  author: string;
  year?: string | null;
  publisher?: string | null;
}

export interface BookRecommendation {
  isbn: string;
  title: string;
  author: string;
  year?: string | null;
  score: number;
  score_label: string;
  reason?: string | null;
}

export interface RecommendRequest {
  isbn?: string;
  title?: string;
  method?: "hybrid" | "collaborative" | "content" | "popular";
  n?: number;
}

export interface ProfileRecommendRequest {
  genres?: string[];
  authors?: string[];
  liked_isbns?: string[];
  mood?: string;
  n?: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export interface RecommendResponse {
  book?: Book | null;
  recommendations: BookRecommendation[];
  method: string;
}

export interface ProfileResponse {
  recommendations: BookRecommendation[];
  profile_summary: {
    liked_count: number;
    preferred_authors: string[];
    genres: string[];
    mood?: string;
  };
}

export interface ChatResponse {
  response: string;
  recommendations: BookRecommendation[];
}

export interface AnalyticsData {
  top_books: {
    title: string;
    author: string;
    count: number;
    avg_rating: number;
    score: number;
  }[];
  rating_distribution: { rating: number; count: number }[];
  year_distribution: { period: string; count: number }[];
  top_authors: {
    author: string;
    books: number;
    total_ratings: number;
    avg_rating: number;
  }[];
  stats: {
    total_books: number;
    total_ratings: number;
    avg_rating: number;
    unique_authors: number;
  };
  similarity_heatmap: { x: string; y: string; value: number }[];
}
