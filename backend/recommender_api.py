"""
Recommendation engine for the FastAPI backend.
Loads the pre-computed models from ../models/ and exposes a clean API.
"""

import os
import pickle
import pandas as pd
import numpy as np
from typing import Optional
from schemas import Book, BookRecommendation

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')


def _load(filename):
    path = os.path.join(MODELS_DIR, filename)
    if not os.path.exists(path):
        return None
    with open(path, 'rb') as f:
        return pickle.load(f)


class RecommenderAPI:
    def __init__(self):
        self.popular_df: Optional[pd.DataFrame] = None
        self.cf_model: Optional[dict] = None
        self.cb_model: Optional[dict] = None
        self.catalog: Optional[pd.DataFrame] = None
        self.loaded = False

    def load(self):
        self.popular_df = _load('popular_books.pkl')
        self.cf_model   = _load('cf_model.pkl')
        self.cb_model   = _load('cb_model.pkl')

        catalog_path = os.path.join(MODELS_DIR, 'books_catalog.csv')
        if os.path.exists(catalog_path):
            self.catalog = pd.read_csv(catalog_path, dtype=str)

        self.loaded = (
            self.popular_df is not None and
            self.cf_model   is not None and
            self.cb_model   is not None
        )
        if not self.loaded:
            raise RuntimeError("Failed to load models — run the notebook first.")
        print(f"✓ Models loaded: {len(self.catalog):,} books in catalog")

    # ── Helpers ─────────────────────────────────────────────────────────────

    def _df_to_books(self, df: pd.DataFrame, score_col: str, score_label: str,
                     reasons: Optional[dict] = None) -> list[BookRecommendation]:
        result = []
        for _, row in df.iterrows():
            isbn = str(row.get('ISBN', ''))
            rec = BookRecommendation(
                isbn=isbn,
                title=str(row.get('Title', '—')),
                author=str(row.get('Author', '—')),
                year=str(row.get('Year', '')) if pd.notna(row.get('Year', '')) else None,
                score=float(row.get(score_col, 0.0)),
                score_label=score_label,
                reason=reasons.get(isbn) if reasons else None
            )
            result.append(rec)
        return result

    def get_book_by_isbn(self, isbn: str) -> Optional[Book]:
        df = self.catalog
        if df is None or df.empty:
            return None
        row = df[df['ISBN'] == isbn]
        if row.empty:
            return None
        r = row.iloc[0]
        return Book(
            isbn=isbn,
            title=str(r.get('Title', '—')),
            author=str(r.get('Author', '—')),
            year=str(r.get('Year', '')) if pd.notna(r.get('Year', '')) else None,
            publisher=str(r.get('Publisher', '')) if 'Publisher' in r and pd.notna(r.get('Publisher', '')) else None
        )

    def search_books(self, query: str, limit: int = 20, offset: int = 0) -> tuple[list[Book], int]:
        df = self.catalog
        if df is None or df.empty:
            return [], 0
        if query.strip():
            q = query.lower()
            mask = (
                df['Title'].str.lower().str.contains(q, na=False) |
                df['Author'].str.lower().str.contains(q, na=False)
            )
            df = df[mask]
        total = len(df)
        df = df.iloc[offset:offset + limit]
        books = []
        for _, r in df.iterrows():
            books.append(Book(
                isbn=str(r.get('ISBN', '')),
                title=str(r.get('Title', '—')),
                author=str(r.get('Author', '—')),
                year=str(r.get('Year', '')) if pd.notna(r.get('Year', '')) else None,
                publisher=str(r.get('Publisher', '')) if 'Publisher' in r and pd.notna(r.get('Publisher', '')) else None
            ))
        return books, total

    def find_isbn_by_title(self, title: str) -> Optional[str]:
        df = self.catalog
        if df is None:
            return None
        q = title.lower()
        matches = df[df['Title'].str.lower().str.contains(q, na=False)]
        if matches.empty:
            return None
        isbn = matches.iloc[0]['ISBN']
        return str(isbn)

    # ── Recommendation methods ──────────────────────────────────────────────

    def popular(self, n: int = 10) -> list[BookRecommendation]:
        df = self.popular_df.head(n).copy() if self.popular_df is not None else pd.DataFrame()
        score_col = 'Weighted_Score' if 'Weighted_Score' in df.columns else 'Avg_Rating'
        return self._df_to_books(df, score_col=score_col, score_label='Popularity')

    def collaborative(self, isbn: str, n: int = 10) -> list[BookRecommendation]:
        sim_df   = self.cf_model['item_sim_df']
        books_df = self.cf_model['books_in_model']
        if isbn not in sim_df.index:
            return []
        scores = sim_df[isbn].sort_values(ascending=False).iloc[1:n+1]
        result = scores.reset_index()
        result.columns = ['ISBN', 'Similarity']
        result = result.merge(books_df[['ISBN', 'Title', 'Author', 'Year']], on='ISBN', how='left')
        return self._df_to_books(result, 'Similarity', 'CF Score')

    def content_based(self, isbn: str, n: int = 10) -> list[BookRecommendation]:
        sim_df   = self.cb_model['content_sim_df']
        books_df = self.cb_model['content_books']
        if isbn not in sim_df.index:
            return []
        scores = sim_df[isbn].sort_values(ascending=False).iloc[1:n+1]
        result = scores.reset_index()
        result.columns = ['ISBN', 'Similarity']
        result = result.merge(books_df[['ISBN', 'Title', 'Author', 'Year']], on='ISBN', how='left')
        return self._df_to_books(result, 'Similarity', 'Content Score')

    def hybrid(self, isbn: str, n: int = 10, alpha: float = 0.6) -> list[BookRecommendation]:
        cf_sim = self.cf_model['item_sim_df']
        cb_sim = self.cb_model['content_sim_df']
        if isbn not in cf_sim.index or isbn not in cb_sim.index:
            return self.collaborative(isbn, n) or self.content_based(isbn, n)
        cf_scores = cf_sim[isbn].drop(isbn, errors='ignore')
        cb_scores = cb_sim[isbn].drop(isbn, errors='ignore')
        common    = cf_scores.index.intersection(cb_scores.index)
        hybrid    = alpha * cf_scores[common] + (1 - alpha) * cb_scores[common]
        top       = hybrid.sort_values(ascending=False).head(n)
        result    = top.reset_index()
        result.columns = ['ISBN', 'Score']
        books_df  = self.cf_model['books_in_model']
        result    = result.merge(books_df[['ISBN', 'Title', 'Author', 'Year']], on='ISBN', how='left')
        return self._df_to_books(result, 'Score', 'Hybrid Score')

    def profile_recommend(self, liked_isbns: list[str], authors: list[str], n: int = 10) -> list[BookRecommendation]:
        """Aggregate CF scores across all liked books to build a profile vector."""
        cf_sim   = self.cf_model['item_sim_df']
        cb_sim   = self.cb_model['content_sim_df']
        books_df = self.cf_model['books_in_model']

        all_cf_scores: dict[str, float] = {}
        all_cb_scores: dict[str, float] = {}

        for isbn in liked_isbns:
            if isbn in cf_sim.index:
                for rec_isbn, score in cf_sim[isbn].drop(isbn, errors='ignore').items():
                    if rec_isbn not in liked_isbns:
                        all_cf_scores[rec_isbn] = all_cf_scores.get(rec_isbn, 0) + score

            if isbn in cb_sim.index:
                for rec_isbn, score in cb_sim[isbn].drop(isbn, errors='ignore').items():
                    if rec_isbn not in liked_isbns:
                        all_cb_scores[rec_isbn] = all_cb_scores.get(rec_isbn, 0) + score

        if not all_cf_scores and not all_cb_scores:
            return self.popular(n)

        common = set(all_cf_scores) | set(all_cb_scores)
        hybrid_scores = {}
        for isbn in common:
            cf_s = all_cf_scores.get(isbn, 0)
            cb_s = all_cb_scores.get(isbn, 0)
            hybrid_scores[isbn] = 0.6 * cf_s + 0.4 * cb_s

        top = sorted(hybrid_scores, key=hybrid_scores.get, reverse=True)[:n]
        result = pd.DataFrame({'ISBN': top, 'Score': [hybrid_scores[i] for i in top]})
        result = result.merge(books_df[['ISBN', 'Title', 'Author', 'Year']], on='ISBN', how='left')

        # Boost books from preferred authors
        if authors:
            author_lower = [a.lower() for a in authors]
            result['Score'] = result.apply(
                lambda row: row['Score'] * 1.3
                if any(a in str(row.get('Author', '')).lower() for a in author_lower)
                else row['Score'],
                axis=1
            )
        result = result.sort_values('Score', ascending=False).head(n)
        return self._df_to_books(result, 'Score', 'Profile Match')

    # ── Analytics ───────────────────────────────────────────────────────────

    def get_analytics(self) -> dict:
        pop = self.popular_df.copy() if self.popular_df is not None else pd.DataFrame()
        cat = self.catalog.copy() if self.catalog is not None else pd.DataFrame()

        # Top books
        score_col = 'Weighted_Score' if 'Weighted_Score' in pop.columns else 'Avg_Rating'
        top_books = []
        for _, r in pop.head(15).iterrows():
            top_books.append({
                'title': str(r.get('Title', '—'))[:40],
                'author': str(r.get('Author', '—')),
                'count': int(r.get('Num_Ratings', 0)),
                'avg_rating': round(float(r.get('Avg_Rating', 0)), 2),
                'score': round(float(r.get(score_col, 0)), 3)
            })

        # Rating distribution
        rating_dist = []
        if 'Avg_Rating' in pop.columns:
            for rating in range(1, 11):
                low, high = rating - 0.5, rating + 0.5
                count = int(((pop['Avg_Rating'] >= low) & (pop['Avg_Rating'] < high)).sum())
                rating_dist.append({'rating': rating, 'count': count})

        # Year distribution
        year_dist = []
        if not cat.empty and 'Year' in cat.columns:
            cat['Year_num'] = pd.to_numeric(cat['Year'], errors='coerce')
            bins = [(1980, 1990), (1990, 1995), (1995, 2000), (2000, 2003), (2003, 2010)]
            for lo, hi in bins:
                cnt = int(((cat['Year_num'] >= lo) & (cat['Year_num'] < hi)).sum())
                year_dist.append({'period': f'{lo}–{hi}', 'count': cnt})

        # Top authors
        top_authors = []
        if 'Author' in pop.columns and 'Num_Ratings' in pop.columns:
            author_stats = pop.groupby('Author').agg(
                books=('Title', 'count'),
                total_ratings=('Num_Ratings', 'sum'),
                avg_rating=('Avg_Rating', 'mean')
            ).sort_values('total_ratings', ascending=False).head(10)
            for author, row in author_stats.iterrows():
                top_authors.append({
                    'author': str(author)[:30],
                    'books': int(row['books']),
                    'total_ratings': int(row['total_ratings']),
                    'avg_rating': round(float(row['avg_rating']), 2)
                })

        # Similarity heatmap (top 8 books)
        heatmap = []
        isbn_list = self.cf_model.get('isbn_list', []) if self.cf_model else []
        top_isbns = [r.get('isbn', '') for r in top_books[:8] if r.get('title')]
        # Map titles to isbns via popular_df
        if self.popular_df is not None and len(top_isbns) < 8:
            top_isbns = list(self.popular_df.head(8)['ISBN'].values)

        sim_df = self.cf_model.get('item_sim_df') if self.cf_model else None
        if sim_df is not None:
            top_isbns_valid = [i for i in top_isbns if i in sim_df.index][:6]
            titles_map = {}
            if self.popular_df is not None:
                for _, r in self.popular_df.iterrows():
                    titles_map[str(r.get('ISBN', ''))] = str(r.get('Title', '?'))[:20]
            for i_isbn in top_isbns_valid:
                for j_isbn in top_isbns_valid:
                    heatmap.append({
                        'x': titles_map.get(i_isbn, i_isbn[:8]),
                        'y': titles_map.get(j_isbn, j_isbn[:8]),
                        'value': round(float(sim_df.loc[i_isbn, j_isbn]) if j_isbn in sim_df.columns else 0, 3)
                    })

        # Stats
        stats = {
            'total_books': len(cat) if not cat.empty else 0,
            'total_ratings': int(pop['Num_Ratings'].sum()) if 'Num_Ratings' in pop.columns else 0,
            'avg_rating': round(float(pop['Avg_Rating'].mean()), 2) if 'Avg_Rating' in pop.columns else 0,
            'unique_authors': int(pop['Author'].nunique()) if 'Author' in pop.columns else 0,
        }

        return {
            'top_books': top_books,
            'rating_distribution': rating_dist,
            'year_distribution': year_dist,
            'top_authors': top_authors,
            'stats': stats,
            'similarity_heatmap': heatmap
        }


engine = RecommenderAPI()
