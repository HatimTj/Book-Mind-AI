from pydantic import BaseModel, Field
from typing import Optional


class Book(BaseModel):
    isbn: str
    title: str
    author: str
    year: Optional[str] = None
    publisher: Optional[str] = None


class BookRecommendation(BaseModel):
    isbn: str
    title: str
    author: str
    year: Optional[str] = None
    score: float
    score_label: str = "Score"
    reason: Optional[str] = None


class RecommendRequest(BaseModel):
    isbn: Optional[str] = None
    title: Optional[str] = None
    method: str = "hybrid"
    n: int = Field(default=10, ge=1, le=50)


class ProfileRecommendRequest(BaseModel):
    genres: list[str] = []
    authors: list[str] = []
    liked_isbns: list[str] = []
    mood: Optional[str] = None
    n: int = Field(default=10, ge=1, le=50)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


class RecommendResponse(BaseModel):
    book: Optional[Book] = None
    recommendations: list[BookRecommendation]
    method: str


class ProfileResponse(BaseModel):
    recommendations: list[BookRecommendation]
    profile_summary: dict


class ChatResponse(BaseModel):
    response: str
    recommendations: list[BookRecommendation]


class AnalyticsData(BaseModel):
    top_books: list[dict]
    rating_distribution: list[dict]
    year_distribution: list[dict]
    top_authors: list[dict]
    stats: dict
    similarity_heatmap: list[dict]
