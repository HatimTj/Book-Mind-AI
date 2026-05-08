"""
BookMind AI — FastAPI Backend
Run: uvicorn main:app --reload --port 8000
"""

import os
import sys
from contextlib import asynccontextmanager
from typing import Optional

import anthropic
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

sys.path.insert(0, os.path.dirname(__file__))
from recommender_api import engine
from schemas import (
    RecommendRequest, RecommendResponse,
    ProfileRecommendRequest, ProfileResponse,
    ChatRequest, ChatResponse,
    Book, BookRecommendation,
)

# ── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    engine.load()
    yield

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="BookMind AI",
    description="Intelligent Book Recommendation System",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Anthropic client (optional — graceful degradation if no key) ──────────────

def get_claude():
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        return None
    return anthropic.Anthropic(api_key=api_key)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "models_loaded": engine.loaded}


@app.get("/api/books")
def list_books(
    q: str = Query(default="", description="Search query"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0)
):
    books, total = engine.search_books(q, limit=limit, offset=offset)
    return {"books": [b.model_dump() for b in books], "total": total}


@app.get("/api/books/{isbn}")
def get_book(isbn: str):
    book = engine.get_book_by_isbn(isbn)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    recs = engine.hybrid(isbn, n=8)
    if not recs:
        recs = engine.content_based(isbn, n=8)
    return {
        "book": book.model_dump(),
        "recommendations": [r.model_dump() for r in recs]
    }


@app.post("/api/recommend")
def recommend(req: RecommendRequest):
    isbn = req.isbn

    # Resolve ISBN from title if needed
    if not isbn and req.title:
        isbn = engine.find_isbn_by_title(req.title)

    if not isbn:
        # Fall back to popularity
        recs = engine.popular(n=req.n)
        return RecommendResponse(
            book=None,
            recommendations=recs,
            method="popular"
        ).model_dump()

    book = engine.get_book_by_isbn(isbn)

    method = req.method.lower()
    if method == "collaborative":
        recs = engine.collaborative(isbn, n=req.n)
    elif method == "content":
        recs = engine.content_based(isbn, n=req.n)
    elif method == "popular":
        recs = engine.popular(n=req.n)
    else:
        recs = engine.hybrid(isbn, n=req.n)

    if not recs:
        recs = engine.popular(n=req.n)

    return RecommendResponse(
        book=book,
        recommendations=recs,
        method=method
    ).model_dump()


@app.post("/api/profile/recommend")
def profile_recommend(req: ProfileRecommendRequest):
    recs = engine.profile_recommend(
        liked_isbns=req.liked_isbns,
        authors=req.authors,
        n=req.n
    )
    if not recs:
        recs = engine.popular(n=req.n)

    profile_summary = {
        "liked_count": len(req.liked_isbns),
        "preferred_authors": req.authors[:5],
        "genres": req.genres[:5],
        "mood": req.mood
    }

    return ProfileResponse(
        recommendations=recs,
        profile_summary=profile_summary
    ).model_dump()


@app.get("/api/analytics")
def analytics():
    data = engine.get_analytics()
    return data


@app.post("/api/chat")
def chat(req: ChatRequest):
    client = get_claude()
    recs: list[BookRecommendation] = []

    # Extract potential book titles from message for recommendations
    message_lower = req.message.lower()
    potential_isbn = None

    # Try to find a book mentioned in the message and get recs from it
    books_found, _ = engine.search_books(req.message, limit=3)
    if books_found:
        potential_isbn = books_found[0].isbn
        recs = engine.hybrid(potential_isbn, n=5)
        if not recs:
            recs = engine.popular(n=5)

    if not client:
        # Fallback response without Claude
        if recs:
            titles = ", ".join([f'"{r.title}"' for r in recs[:3]])
            response_text = (
                f"Based on your interest, I'd recommend these books: {titles}. "
                "They share similar themes and have received excellent ratings from readers."
            )
        else:
            top = engine.popular(n=5)
            recs = top
            titles = ", ".join([f'"{r.title}"' for r in top[:3]])
            response_text = (
                f"Great question! Here are some highly-rated books you might enjoy: {titles}. "
                "Set ANTHROPIC_API_KEY for personalized AI responses."
            )
        return ChatResponse(response=response_text, recommendations=recs).model_dump()

    # Build Claude messages
    rec_context = ""
    if recs:
        rec_list = "\n".join([f"- {r.title} by {r.author} (score: {r.score:.3f})" for r in recs])
        rec_context = f"\n\nRelevant books found in our database:\n{rec_list}"

    system_prompt = (
        "You are BookMind AI, an expert literary assistant and book recommendation engine. "
        "You have deep knowledge of literature, themes, writing styles, and reader preferences. "
        "You provide warm, insightful, and personalized book recommendations. "
        "Keep responses concise (2-4 sentences), enthusiastic, and helpful. "
        "Focus on WHY the user will love the recommended books."
        + rec_context
    )

    messages = []
    for msg in req.history[-6:]:  # Last 6 messages for context
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": req.message})

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=512,
            system=system_prompt,
            messages=messages
        )
        response_text = response.content[0].text
    except Exception as e:
        response_text = f"I'd love to help! Based on your query, here are some great picks for you."

    if not recs:
        recs = engine.popular(n=5)

    return ChatResponse(response=response_text, recommendations=recs).model_dump()
