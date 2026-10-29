"""Generates seed.json for the API and catalog.json for the frontend bundle.

Run:  python3 gen_catalog.py
"""
import json
import os

# ---------------------------------------------------------------------------
# Audio languages. Japanese is the original track and is always first.
# ---------------------------------------------------------------------------
ORIGINAL = "Japanese"
AUDIO_LANGUAGES = [
    "Japanese", "English", "Hindi", "Tamil",
    "Telugu", "Bengali", "Malayalam", "Kannada",
]
LANG_LABEL = {code: code for code in AUDIO_LANGUAGES}
LANG_LABEL["Japanese"] = "Japanese (Original)"

# Dub availability shorthand — pick one per title.
ALL7 = ["English", "Hindi", "Tamil", "Telugu", "Bengali", "Malayalam", "Kannada"]
BIG6 = ["English", "Hindi", "Tamil", "Telugu", "Bengali", "Malayalam"]
WIDE5 = ["English", "Hindi", "Tamil", "Telugu", "Bengali"]
CORE4 = ["English", "Hindi", "Tamil", "Telugu"]
CORE3 = ["English", "Hindi", "Tamil"]
DUO = ["English", "Hindi"]

# (id, title, year, type, episodes, status, score, popularity, studio, genres, dubs, synopsis, palette)
A = [
    ("jujutsu-kaisen", "Jujutsu Kaisen", 2020, "TV", 24, "Finished", 8.6, 98, "MAPPA",
     ["Action", "Supernatural", "Shounen"], ALL7,
     "Yuji Itadori swallows a cursed finger and is pulled into a hidden war between sorcerers and curses.",
     ["#ff2e63", "#7c3aed"]),
    ("demon-slayer", "Demon Slayer: Kimetsu no Yaiba", 2019, "TV", 26, "Ongoing", 8.5, 99, "ufotable",
     ["Action", "Supernatural", "Historical"], ALL7,
     "Tanjiro Kamado joins the Demon Slayer Corps after his family is slaughtered and his sister turned.",
     ["#06b6d4", "#1e3a8a"]),
    ("attack-on-titan", "Attack on Titan", 2013, "TV", 25, "Finished", 9.0, 100, "Wit Studio",
     ["Action", "Drama", "Fantasy"], ALL7,
     "Humanity fights for survival behind giant walls against man-eating Titans.",
     ["#78350f", "#b45309"]),
    ("naruto", "Naruto", 2002, "TV", 220, "Finished", 8.4, 97, "Pierrot",
     ["Action", "Adventure", "Shounen"], ALL7,
     "A loud ninja with a sealed nine-tailed fox chases the title of Hokage.",
     ["#f97316", "#facc15"]),
    ("naruto-shippuden", "Naruto: Shippuden", 2007, "TV", 500, "Finished", 8.7, 96, "Pierrot",
     ["Action", "Adventure", "Shounen"], ALL7,
     "Naruto returns from training to face the Akatsuki and a war that decides the shinobi world.",
     ["#ea580c", "#7c2d12"]),
    ("one-piece", "One Piece", 1999, "TV", 1120, "Ongoing", 8.7, 100, "Toei Animation",
     ["Adventure", "Action", "Fantasy"], ALL7,
     "Monkey D. Luffy sails the Grand Line with his crew in search of the legendary One Piece.",
     ["#dc2626", "#f59e0b"]),
    ("death-note", "Death Note", 2006, "TV", 37, "Finished", 8.6, 95, "Madhouse",
     ["Mystery", "Thriller", "Psychological"], ALL7,
     "A student finds a notebook that kills anyone whose name is written in it.",
     ["#111827", "#dc2626"]),
    ("fma-brotherhood", "Fullmetal Alchemist: Brotherhood", 2009, "TV", 64, "Finished", 9.1, 93, "Bones",
     ["Action", "Adventure", "Drama"], BIG6,
     "Two alchemist brothers hunt the Philosopher's Stone to restore their bodies.",
     ["#b91c1c", "#facc15"]),
    ("spy-x-family", "Spy x Family", 2022, "TV", 25, "Ongoing", 8.5, 94, "Wit Studio",
     ["Comedy", "Action", "Slice of Life"], ALL7,
     "A spy, an assassin and a telepath pretend to be a family — and none of them know it.",
     ["#f472b6", "#8b5cf6"]),
    ("chainsaw-man", "Chainsaw Man", 2022, "TV", 12, "Finished", 8.5, 92, "MAPPA",
     ["Action", "Dark Fantasy", "Supernatural"], ALL7,
     "Denji fuses with his chainsaw devil and gets drafted into public safety.",
     ["#dc2626", "#111827"]),
    ("solo-leveling", "Solo Leveling", 2024, "TV", 12, "Ongoing", 8.3, 96, "A-1 Pictures",
     ["Action", "Fantasy", "Adventure"], ALL7,
     "The weakest hunter alive wakes up with a system that lets him level up without limit.",
     ["#4f46e5", "#06b6d4"]),
    ("blue-lock", "Blue Lock", 2022, "TV", 24, "Ongoing", 8.2, 90, "8bit",
     ["Sports", "Drama", "Shounen"], ALL7,
     "300 strikers enter a brutal facility to produce Japan's greatest egoist.",
     ["#0ea5e9", "#1e40af"]),
    ("haikyuu", "Haikyuu!!", 2014, "TV", 25, "Finished", 8.7, 89, "Production I.G",
     ["Sports", "Comedy", "Drama"], BIG6,
     "A short kid with a huge jump and a genius setter rebuild their high school volleyball team.",
     ["#f97316", "#0f172a"]),
    ("tokyo-revengers", "Tokyo Revengers", 2021, "TV", 24, "Finished", 8.0, 88, "Liden Films",
     ["Action", "Drama", "Supernatural"], WIDE5,
     "A dead-end adult time-travels to middle school to save the people he loves.",
     ["#facc15", "#111827"]),
    ("my-hero-academia", "My Hero Academia", 2016, "TV", 13, "Ongoing", 8.2, 91, "Bones",
     ["Action", "Superhero", "Shounen"], ALL7,
     "In a world of superpowers, a powerless boy inherits the strength of the greatest hero.",
     ["#16a34a", "#facc15"]),
    ("bleach", "Bleach", 2004, "TV", 366, "Finished", 8.2, 87, "Pierrot",
     ["Action", "Supernatural", "Shounen"], WIDE5,
     "Ichigo Kurosaki becomes a Soul Reaper and defends the living from hollows.",
     ["#0f766e", "#111827"]),
    ("vinland-saga", "Vinland Saga", 2019, "TV", 24, "Ongoing", 8.8, 86, "Wit Studio",
     ["Action", "Historical", "Drama"], CORE4,
     "A Viking boy raised on revenge slowly learns what a true warrior is.",
     ["#57534e", "#b91c1c"]),
    ("mob-psycho", "Mob Psycho 100", 2016, "TV", 12, "Finished", 8.6, 84, "Bones",
     ["Action", "Comedy", "Supernatural"], CORE4,
     "An overpowered psychic tries to live an ordinary life and grow as a person.",
     ["#22d3ee", "#a855f7"]),
    ("dr-stone", "Dr. Stone", 2019, "TV", 24, "Ongoing", 8.3, 83, "TMS Entertainment",
     ["Sci-Fi", "Adventure", "Comedy"], WIDE5,
     "After humanity is petrified, a science prodigy rebuilds civilisation from zero.",
     ["#10b981", "#0f766e"]),
    ("dragon-ball-z", "Dragon Ball Z", 1989, "TV", 291, "Finished", 8.2, 95, "Toei Animation",
     ["Action", "Adventure", "Comedy"], ALL7,
     "Goku defends Earth against Saiyans, androids and gods.",
     ["#f59e0b", "#ea580c"]),
    ("hunter-x-hunter", "Hunter x Hunter (2011)", 2011, "TV", 148, "Finished", 9.0, 88, "Madhouse",
     ["Adventure", "Action", "Fantasy"], BIG6,
     "Gon becomes a Hunter to find his father and discovers a far stranger world.",
     ["#22c55e", "#0ea5e9"]),
    ("steins-gate", "Steins;Gate", 2011, "TV", 24, "Finished", 8.8, 82, "White Fox",
     ["Sci-Fi", "Thriller", "Drama"], DUO,
     "A self-styled mad scientist discovers time travel by accident — and the cost of it.",
     ["#64748b", "#7c3aed"]),
    ("code-geass", "Code Geass", 2006, "TV", 25, "Finished", 8.7, 81, "Sunrise",
     ["Action", "Mecha", "Drama"], CORE4,
     "An exiled prince gains the power to command anyone and starts a rebellion.",
     ["#7c3aed", "#facc15"]),
    ("cowboy-bebop", "Cowboy Bebop", 1998, "TV", 26, "Finished", 8.8, 79, "Sunrise",
     ["Action", "Sci-Fi", "Drama"], CORE3,
     "Bounty hunters drift through space to a jazz soundtrack.",
     ["#1e3a8a", "#f472b6"]),
    ("violet-evergarden", "Violet Evergarden", 2018, "TV", 13, "Finished", 8.5, 80, "Kyoto Animation",
     ["Drama", "Fantasy", "Slice of Life"], CORE4,
     "A former child soldier writes letters for others and learns what love means.",
     ["#f5d0fe", "#7c3aed"]),
    ("your-name", "Your Name.", 2016, "Movie", 1, "Finished", 8.5, 90, "CoMix Wave Films",
     ["Romance", "Fantasy", "Drama"], ALL7,
     "Two teenagers keep waking up in each other's bodies, across distance and time.",
     ["#60a5fa", "#f472b6"]),
    ("spirited-away", "Spirited Away", 2001, "Movie", 1, "Finished", 8.6, 88, "Studio Ghibli",
     ["Fantasy", "Adventure", "Drama"], ALL7,
     "A girl must work in a spirit bathhouse to free her parents.",
     ["#0ea5e9", "#dc2626"]),
    ("suzume", "Suzume", 2022, "Movie", 1, "Finished", 8.0, 85, "CoMix Wave Films",
     ["Fantasy", "Romance", "Adventure"], CORE4,
     "A girl and a talking chair close doors across Japan before disaster spills out.",
     ["#38bdf8", "#fb923c"]),
    ("weathering-with-you", "Weathering with You", 2019, "Movie", 1, "Finished", 8.2, 84, "CoMix Wave Films",
     ["Romance", "Fantasy", "Drama"], CORE4,
     "A runaway meets a girl who can clear the sky.",
     ["#7dd3fc", "#f59e0b"]),
    ("one-punch-man", "One Punch Man", 2015, "TV", 12, "Ongoing", 8.7, 93, "Madhouse",
     ["Action", "Comedy", "Superhero"], ALL7,
     "A hero who wins every fight in one punch is bored out of his mind.",
     ["#facc15", "#dc2626"]),
    ("black-clover", "Black Clover", 2017, "TV", 170, "Finished", 8.1, 86, "Pierrot",
     ["Action", "Fantasy", "Shounen"], WIDE5,
     "A boy born without magic vows to become the Wizard King.",
     ["#111827", "#16a34a"]),
    ("re-zero", "Re:Zero - Starting Life in Another World", 2016, "TV", 25, "Ongoing", 8.6, 87, "White Fox",
     ["Fantasy", "Thriller", "Drama"], CORE4,
     "Summoned to another world, Subaru can only rewind by dying.",
     ["#a78bfa", "#1e1b4b"]),
    ("frieren", "Frieren: Beyond Journey's End", 2023, "TV", 28, "Ongoing", 9.0, 92, "Madhouse",
     ["Fantasy", "Adventure", "Drama"], ALL7,
     "An elf mage outlives her party and slowly learns why humans matter.",
     ["#34d399", "#0f766e"]),
    ("dandadan", "Dandadan", 2024, "TV", 12, "Ongoing", 8.5, 89, "Science SARU",
     ["Action", "Comedy", "Supernatural"], WIDE5,
     "An occult nerd and a ghost-obsessed girl lose their powers and their dignity.",
     ["#f472b6", "#22d3ee"]),
    ("fire-force", "Fire Force", 2019, "TV", 24, "Ongoing", 7.9, 76, "David Production",
     ["Action", "Supernatural", "Shounen"], CORE4,
     "Special firefighters battle spontaneous human combustion in Tokyo.",
     ["#f97316", "#dc2626"]),
    ("konosuba", "KonoSuba", 2016, "TV", 10, "Ongoing", 8.3, 78, "Studio Deen",
     ["Comedy", "Fantasy", "Adventure"], CORE4,
     "A dead shut-in is sent to a fantasy world with the worst party imaginable.",
     ["#60a5fa", "#facc15"]),
    ("overlord", "Overlord", 2015, "TV", 13, "Ongoing", 7.9, 75, "Madhouse",
     ["Fantasy", "Action", "Adventure"], CORE4,
     "A player trapped in a game becomes the skeletal overlord of a new world.",
     ["#4c1d95", "#a78bfa"]),
    ("apothecary-diaries", "The Apothecary Diaries", 2023, "TV", 24, "Ongoing", 8.7, 83, "OLM",
     ["Mystery", "Drama", "Historical"], WIDE5,
     "A sharp-eyed apothecary solves poisonings inside the imperial palace.",
     ["#b91c1c", "#f5d0fe"]),
    ("kaiju-no-8", "Kaiju No. 8", 2024, "TV", 12, "Ongoing", 8.0, 85, "Production I.G",
     ["Action", "Sci-Fi", "Shounen"], ALL7,
     "A kaiju cleanup worker becomes a kaiju himself and joins the defence force.",
     ["#059669", "#111827"]),
    ("mashle", "Mashle: Magic and Muscles", 2023, "TV", 12, "Ongoing", 7.8, 74, "A-1 Pictures",
     ["Comedy", "Fantasy", "Action"], CORE4,
     "In a world of magic, a boy with zero magic and absurd muscles enrols in magic school.",
     ["#a3e635", "#4d7c0f"]),
]


def verdict_split(aid: str, score: float) -> dict:
    """Sample community verdicts, deterministic per title so the UI looks alive.

    Skewed by the title's score: a 9.1 lands mostly on 'perfection', a 7.8 spreads
    out into 'timepass'. Replace with real vote counts once you collect them.
    """
    h = sum(ord(c) * (i + 7) for i, c in enumerate(aid)) % 11
    perfection = max(6, min(54, round((score - 7.6) / 1.5 * 44 + 8 + h * 0.7)))
    goforit = max(10, min(52, round(28 + (score - 8.0) * 14 + h * 0.8)))

    # leave at least 4 points for the negative verdicts so the bar always has
    # a little red/amber in it, and never exceed 100.
    ceiling = 96
    if perfection + goforit > ceiling:
        over = perfection + goforit - ceiling
        take = min(goforit - 10, over)
        goforit -= take
        over -= take
        perfection = max(6, perfection - over)

    rest = max(4, 100 - perfection - goforit)
    timepass = max(2, round(rest * 0.62))
    skip = max(0, rest - timepass)
    return {"skip": skip, "timepass": timepass, "goforit": goforit, "perfection": perfection}


def build():
    out = []
    for (aid, title, year, typ, eps, status, score, pop, studio, genres, dubs,
         synopsis, palette) in A:
        # Japanese first (original track), then dubs in canonical order.
        audio = [ORIGINAL] + [d for d in AUDIO_LANGUAGES[1:] if d in dubs]
        out.append({
            "id": aid,
            "title": title,
            "year": year,
            "type": typ,
            "episodes": eps,
            "status": status,
            "score": score,
            "popularity": pop,
            "studio": studio,
            "genres": genres,
            "dubs": audio,
            "verdicts": verdict_split(aid, score),
            "synopsis": synopsis,
            "palette": palette,
            "posterUrl": None,
            "runtime": "1h 47m" if typ == "Movie" else "24 min",
            "slug": aid,
        })
    return out


if __name__ == "__main__":
    data = build()
    here = os.path.dirname(os.path.abspath(__file__))
    api_path = os.path.join(here, "app", "seed.json")
    web_path = os.path.join(here, "..", "frontend", "src", "data", "catalog.json")
    payload = {
        "count": len(data),
        "audioLanguages": AUDIO_LANGUAGES,
        "languages": LANG_LABEL,
        "anime": data,
    }
    for p in (api_path, web_path):
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
    genres = sorted({g for a in data for g in a["genres"]})
    print(f"wrote {len(data)} titles, {len(genres)} genres, {len(AUDIO_LANGUAGES)} audio languages")
