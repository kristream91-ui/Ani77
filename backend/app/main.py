"""Ani77 API — FastAPI backend for the anime catalog.

Run:
    cd backend
    pip install -r requirements.txt
    uvicorn app.main:app --reload --port 8000

Docs at http://localhost:8000/docs
"""
from __future__ import annotations

import json
import os
from functools import lru_cache
from typing import Literal

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from . import recommender

HERE = os.path.dirname(os.path.abspath(__file__))
SEED = os.path.join(HERE, "seed.json")
JIKAN = "https://api.jikan.moe/v4"

app = FastAPI(
    title="Ani77 API",
    description="Anime catalog + recommendations tuned for India, Nepal and Bangladesh.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@lru_cache
def catalog() -> dict:
    with open(SEED, encoding="utf-8") as f:
        return json.load(f)


def all_anime() -> list[dict]:
    return catalog()["anime"]


def by_id(aid: str) -> dict:
    for a in all_anime():
        if a["id"] == aid:
            return a
    raise HTTPException(404, f"No anime with id '{aid}'")


# ---------------------------------------------------------------- models


class HistoryItem(BaseModel):
    animeId: str
    status: str = "completed"
    score: float | None = None


class RecRequest(BaseModel):
    history: list[HistoryItem] = Field(default_factory=list)
    preferredLangs: list[str] = Field(default_factory=list)
    likedGenres: list[str] = Field(default_factory=list)
    limit: int = Field(12, ge=1, le=50)


# ---------------------------------------------------------------- routes


@app.get("/api/health")
def health():
    return {"ok": True, "titles": len(all_anime())}


@app.get("/api/genres")
def genres():
    counts: dict[str, int] = {}
    for a in all_anime():
        for g in a["genres"]:
            counts[g] = counts.get(g, 0) + 1
    return {"genres": sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))}


@app.get("/api/languages")
def languages():
    return {"languages": catalog().get("languages", {})}


@app.get("/api/anime")
def list_anime(
    q: str | None = None,
    genre: str | None = None,
    language: str | None = None,
    type: Literal["TV", "Movie"] | None = None,
    status: str | None = None,
    min_score: float = Query(0, ge=0, le=10),
    sort: Literal["popularity", "score", "year", "title"] = "popularity",
    page: int = Query(1, ge=1),
    per_page: int = Query(24, ge=1, le=100),
):
    items = all_anime()

    if q:
        needle = q.strip().lower()
        items = [
            a for a in items
            if needle in a["title"].lower()
            or needle in a["studio"].lower()
            or any(needle in g.lower() for g in a["genres"])
        ]
    if genre:
        items = [a for a in items if genre in a["genres"]]
    if language:
        items = [a for a in items if language in a["dubs"]]
    if type:
        items = [a for a in items if a["type"] == type]
    if status:
        items = [a for a in items if a["status"].lower() == status.lower()]
    if min_score:
        items = [a for a in items if a["score"] >= min_score]

    keys = {
        "popularity": lambda a: (-a["popularity"], -a["score"]),
        "score": lambda a: (-a["score"], -a["popularity"]),
        "year": lambda a: (-a["year"], a["title"]),
        "title": lambda a: a["title"].lower(),
    }
    items = sorted(items, key=keys[sort])

    total = len(items)
    start = (page - 1) * per_page
    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": max(1, -(-total // per_page)),
        "results": items[start:start + per_page],
    }


@app.get("/api/anime/{aid}")
def detail(aid: str):
    a = by_id(aid)
    eps = []
    for n in range(1, min(a["episodes"], 60) + 1):
        eps.append({
            "number": n,
            "title": f"Episode {n}",
            "runtime": a["runtime"],
            "dubs": a["dubs"],
        })
    related = [x for x in all_anime()
               if x["id"] != aid and set(x["genres"]) & set(a["genres"])]
    related.sort(key=lambda x: (-len(set(x["genres"]) & set(a["genres"])), -x["score"]))
    return {**a, "episodeList": eps, "related": related[:8]}


@app.get("/api/anime/{aid}/episodes")
def episodes(aid: str, page: int = Query(1, ge=1), per_page: int = Query(24, ge=1, le=100)):
    a = by_id(aid)
    total = a["episodes"]
    start = (page - 1) * per_page
    end = min(total, start + per_page)
    return {
        "animeId": aid,
        "total": total,
        "page": page,
        "pages": max(1, -(-total // per_page)),
        "results": [
            {"number": n, "title": f"Episode {n}", "runtime": a["runtime"], "dubs": a["dubs"]}
            for n in range(start + 1, end + 1)
        ],
    }


@app.get("/api/trending")
def trending(limit: int = Query(12, ge=1, le=40)):
    items = sorted(all_anime(), key=lambda a: (-a["popularity"], -a["score"]))[:limit]
    return {"results": items}


@app.get("/api/rails")
def rails():
    """Everything the home screen needs in one round trip."""
    items = all_anime()
    newest = sorted(items, key=lambda a: -a["year"])[:12]
    top = sorted(items, key=lambda a: (-a["score"], -a["popularity"]))[:12]
    desi = [a for a in items if "Hindi" in a["dubs"]]
    desi.sort(key=lambda a: -a["popularity"])
    movies = sorted([a for a in items if a["type"] == "Movie"], key=lambda a: -a["score"])[:10]
    return {
        "hero": sorted(items, key=lambda a: -(a["popularity"] * a["score"]))[:3],
        "trending": sorted(items, key=lambda a: -a["popularity"])[:12],
        "newest": newest,
        "topRated": top,
        "hindiDub": desi[:12],
        "movies": movies,
    }


@app.post("/api/recommend")
def recommend(req: RecRequest):
    history = []
    for h in req.history:
        try:
            history.append({"anime": by_id(h.animeId), "status": h.status, "score": h.score})
        except HTTPException:
            continue
    out = recommender.recommend(
        all_anime(),
        history=history,
        preferred_langs=req.preferredLangs,
        liked_genres=req.likedGenres,
        limit=req.limit,
    )
    return {"results": out, "basedOn": len(history)}


@app.get("/api/search/jikan")
async def jikan_search(q: str, limit: int = Query(10, ge=1, le=25)):
    """Live search against MyAnimeList via Jikan, for titles not in the local catalog."""
    try:
        async with httpx.AsyncClient(timeout=12) as c:
            r = await c.get(f"{JIKAN}/anime", params={"q": q, "limit": limit, "sfw": "true"})
            r.raise_for_status()
    except httpx.HTTPError:
        raise HTTPException(502, "Upstream metadata provider unavailable")
    data = r.json().get("data", [])
    return {
        "results": [
            {
                "id": f"mal-{d['mal_id']}",
                "title": d.get("title_english") or d.get("title"),
                "year": (d.get("aired") or {}).get("prop", {}).get("from", {}).get("year"),
                "type": d.get("type"),
                "episodes": d.get("episodes") or 0,
                "score": d.get("score") or 0,
                "genres": [g["name"] for g in d.get("genres", [])],
                "posterUrl": (d.get("images") or {}).get("jpg", {}).get("large_image_url"),
                "synopsis": (d.get("synopsis") or "")[:400],
            }
            for d in data
        ]
    }
