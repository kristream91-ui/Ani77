"""Content-based recommender.

Pure Python, no ML dependency. Builds a weighted genre/tag vector per title,
then scores candidates against a taste profile built from what a user has
watched, rated and searched for.
"""
from __future__ import annotations

import math
from collections import Counter
from typing import Iterable

# Weights that make the ranking feel right: genre dominates, then era, then dub.
W_GENRE = 1.0
W_STUDIO = 0.35
W_YEAR = 0.30
W_DUB = 0.55
W_POP = 0.15

STATUS_BOOST = {"watching": 1.0, "completed": 1.0, "onhold": 0.6, "planned": 0.5, "dropped": -0.8}


def _year_bucket(year: int) -> str:
    if year >= 2020:
        return "y2020s"
    if year >= 2010:
        return "y2010s"
    if year >= 2000:
        return "y2000s"
    return "yclassic"


def vector(anime: dict) -> dict[str, float]:
    """Sparse weighted feature vector for one title."""
    v: dict[str, float] = {}
    for g in anime.get("genres", []):
        v[f"g:{g}"] = W_GENRE
    v[f"s:{anime.get('studio', '')}"] = W_STUDIO
    v[f"y:{_year_bucket(anime.get('year', 2000))}"] = W_YEAR
    for d in anime.get("dubs", []):
        v[f"d:{d}"] = W_DUB
    return v


def taste_profile(
    history: Iterable[dict],
    preferred_langs: Iterable[str] = (),
    liked_genres: Iterable[str] = (),
) -> dict[str, float]:
    """history: [{'anime': <anime dict>, 'status': str, 'score': float|None}]"""
    prof: dict[str, float] = Counter()
    for h in history:
        a = h.get("anime") or {}
        weight = STATUS_BOOST.get(h.get("status", "completed"), 0.5)
        rating = h.get("score")
        if isinstance(rating, (int, float)) and rating > 0:
            # rating 1..10 -> 0.3 .. 1.3 multiplier
            weight *= 0.3 + (rating / 10.0)
        if weight == 0:
            continue
        for k, val in vector(a).items():
            prof[k] += val * weight

    for lang in preferred_langs:
        prof[f"d:{lang}"] += 2.5
    for g in liked_genres:
        prof[f"g:{g}"] += 2.0
    return dict(prof)


def _norm(v: dict[str, float]) -> float:
    return math.sqrt(sum(x * x for x in v.values())) or 1.0


def score(profile: dict[str, float], anime: dict) -> float:
    """Cosine similarity, lightly nudged by popularity so ties break sensibly."""
    if not profile:
        return anime.get("popularity", 0) / 100.0 * W_POP
    v = vector(anime)
    dot = sum(profile.get(k, 0.0) * val for k, val in v.items())
    sim = dot / (_norm(profile) * _norm(v))
    pop = anime.get("popularity", 0) / 100.0
    return round(sim + pop * W_POP, 5)


def recommend(
    catalog: list[dict],
    history: Iterable[dict] = (),
    exclude_ids: Iterable[str] = (),
    preferred_langs: Iterable[str] = (),
    liked_genres: Iterable[str] = (),
    limit: int = 12,
) -> list[dict]:
    history = list(history)
    seen = {h["anime"]["id"] for h in history if h.get("anime")} | set(exclude_ids)
    prof = taste_profile(history, preferred_langs, liked_genres)
    ranked = [
        {**a, "_score": score(prof, a)}
        for a in catalog
        if a["id"] not in seen
    ]
    ranked.sort(key=lambda x: x["_score"], reverse=True)
    return ranked[:limit]
